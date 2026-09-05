import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { MemorialPlanId } from "./memorial-info";
import { getPaidPlan } from "./memorial-info";

export type MemorialOrderStatus = "pending" | "paid" | "cancelled" | "failed";

export type MemorialOrderDoc = {
  _id?: ObjectId;
  memberId: string;
  hallCode: string;
  planId: MemorialPlanId;
  amount: number;
  currency: "KRW";
  status: MemorialOrderStatus;
  paymentMode: "mock" | "pg";
  paymentRef?: string;
  createdAt: Date;
  paidAt?: Date;
};

export type MemorialSubscriptionDoc = {
  _id?: ObjectId;
  memberId: string;
  hallCode: string;
  planId: MemorialPlanId;
  orderId: string;
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
};

const ANNUAL_MS = 365 * 24 * 60 * 60 * 1000;

function oid(id: string) {
  return new ObjectId(id);
}

export function billingMode(): "mock" | "pg" {
  const mode = process.env.MEMORIAL_BILLING_MODE?.trim().toLowerCase();
  if (mode === "pg") return "pg";
  return "mock";
}

export function isDemoHallCode(hallCode: string) {
  return hallCode.startsWith("DEMO-");
}

export async function createMemorialOrder(input: {
  memberId: string;
  hallCode: string;
  planId: MemorialPlanId;
}) {
  const plan = getPaidPlan(input.planId);
  if (!plan) throw new Error("유료 플랜을 선택해 주세요.");

  const db = await getDb();
  const now = new Date();

  const active = await db.collection<MemorialSubscriptionDoc>("memorialSubscriptions").findOne({
    memberId: input.memberId,
    hallCode: input.hallCode,
    expiresAt: { $gt: now },
  });
  if (active) {
    throw new Error("이 추모관에는 이미 유효한 연간권이 있습니다.");
  }

  const doc: MemorialOrderDoc = {
    memberId: input.memberId,
    hallCode: input.hallCode,
    planId: input.planId,
    amount: plan.priceAmount,
    currency: "KRW",
    status: "pending",
    paymentMode: billingMode(),
    createdAt: now,
  };

  const result = await db.collection<MemorialOrderDoc>("memorialOrders").insertOne(doc);
  return { orderId: String(result.insertedId), amount: doc.amount, planName: plan.name, paymentMode: doc.paymentMode };
}

export async function confirmMemorialOrder(orderId: string, memberId: string, paymentRef?: string) {
  const db = await getDb();
  const order = await db.collection<MemorialOrderDoc>("memorialOrders").findOne({ _id: oid(orderId) });
  if (!order) throw new Error("주문을 찾을 수 없습니다.");
  if (order.memberId !== memberId) throw new Error("주문 정보가 일치하지 않습니다.");
  if (order.status === "paid") {
    return { alreadyPaid: true as const, subscription: await getActiveSubscription(memberId, order.hallCode) };
  }
  if (order.status !== "pending") throw new Error("결제할 수 없는 주문입니다.");

  if (billingMode() === "pg") {
    throw new Error("PG 결제 확인은 아직 연결되지 않았습니다. MEMORIAL_BILLING_MODE=mock 로 테스트해 주세요.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ANNUAL_MS);

  await db.collection<MemorialOrderDoc>("memorialOrders").updateOne(
    { _id: order._id },
    { $set: { status: "paid", paidAt: now, paymentRef: paymentRef || `mock-${Date.now()}` } },
  );

  const sub: MemorialSubscriptionDoc = {
    memberId: order.memberId,
    hallCode: order.hallCode,
    planId: order.planId,
    orderId,
    startsAt: now,
    expiresAt,
    createdAt: now,
  };

  await db.collection<MemorialSubscriptionDoc>("memorialSubscriptions").insertOne(sub);

  return { alreadyPaid: false as const, subscription: sub };
}

export async function getActiveSubscription(memberId: string, hallCode: string) {
  const db = await getDb();
  return db.collection<MemorialSubscriptionDoc>("memorialSubscriptions").findOne({
    memberId,
    hallCode,
    expiresAt: { $gt: new Date() },
  });
}

export async function listMemberSubscriptions(memberId: string) {
  const db = await getDb();
  return db
    .collection<MemorialSubscriptionDoc>("memorialSubscriptions")
    .find({ memberId, expiresAt: { $gt: new Date() } })
    .sort({ expiresAt: -1 })
    .toArray();
}

export async function memberHasMemorialPass(memberId: string, role: string, hallCode: string) {
  if (role === "admin") return true;
  if (isDemoHallCode(hallCode)) return true;
  const sub = await getActiveSubscription(memberId, hallCode);
  return Boolean(sub);
}

export function subscriptionLabel(planId: MemorialPlanId) {
  if (planId === "premium") return "프리미엄 연간권";
  if (planId === "standard") return "스탠다드 연간권";
  return "데모";
}
