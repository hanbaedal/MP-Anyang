import { ObjectId, type Document } from "mongodb";
import { listMemberSubscriptions, subscriptionLabel } from "./memorial-billing";
import { getDb } from "./mongodb";
import { findUserById } from "./store";
import type { FeeRecord } from "./store";
import type { ChargeStatus, ChargeType, MemberChargeRow } from "./member-charges-types";
export type { ChargeStatus, ChargeType, MemberChargeRow } from "./member-charges-types";
export { CHARGE_STATUS_LABELS, CHARGE_TYPE_LABELS, chargeSummary, groupChargesByType } from "./member-charges-types";

export type MemberChargeInput = {
  memberId: string;
  chargeType: ChargeType;
  title: string;
  amount: number;
  paidAmount?: number;
  status?: ChargeStatus;
  periodYear?: string;
  dueDate?: string;
  paidAt?: string;
  memo?: string;
  source?: string;
  legacyKey?: string;
};

function oid(id: string) {
  return ObjectId.createFromHexString(id);
}

function toId(v: unknown) {
  if (v instanceof ObjectId) return v.toString();
  return String(v);
}

function normalizeChargeType(value: string): ChargeType {
  if (value === "sale" || value === "annual_fee" || value === "memorial" || value === "other") return value;
  return "other";
}

function normalizeChargeStatus(value: string | undefined, amount: number, paidAmount: number): ChargeStatus {
  if (value === "paid" || value === "partial" || value === "cancelled" || value === "pending") return value;
  if (paidAmount >= amount && amount > 0) return "paid";
  if (paidAmount > 0) return "partial";
  return "pending";
}

function mapCharge(doc: Document): MemberChargeRow {
  const amount = Number(doc.amount || 0);
  const paidAmount = Number(doc.paidAmount ?? 0);
  return {
    id: toId(doc._id),
    memberId: String(doc.memberId),
    chargeType: normalizeChargeType(String(doc.chargeType)),
    title: String(doc.title || ""),
    amount,
    paidAmount,
    status: normalizeChargeStatus(doc.status as string | undefined, amount, paidAmount),
    periodYear: doc.periodYear ? String(doc.periodYear) : undefined,
    dueDate: doc.dueDate ? String(doc.dueDate) : undefined,
    paidAt: doc.paidAt ? String(doc.paidAt) : undefined,
    memo: doc.memo ? String(doc.memo) : undefined,
    source: String(doc.source || "manual"),
    legacyKey: doc.legacyKey ? String(doc.legacyKey) : undefined,
    createdAt: String(doc.createdAt),
    updatedAt: String(doc.updatedAt || doc.createdAt),
  };
}

declare global {
  var _memberChargeIndexesPromise: Promise<void> | undefined;
}

async function chargesReady() {
  const db = await getDb();
  if (!global._memberChargeIndexesPromise) {
    global._memberChargeIndexesPromise = db
      .collection("memberCharges")
      .createIndexes([
        { key: { memberId: 1, createdAt: -1 }, name: "charges_member_created" },
        { key: { memberId: 1, legacyKey: 1 }, name: "charges_member_legacy", sparse: true },
        { key: { chargeType: 1, status: 1 }, name: "charges_type_status" },
      ])
      .then(() => undefined);
  }
  await global._memberChargeIndexesPromise;
  return db;
}

export async function listMemberCharges(memberId: string) {
  const db = await chargesReady();
  const rows = await db
    .collection("memberCharges")
    .find({ memberId })
    .sort({ chargeType: 1, periodYear: -1, createdAt: -1 })
    .toArray();
  return rows.map(mapCharge);
}

export async function countMemberCharges(memberId: string) {
  const db = await chargesReady();
  return db.collection("memberCharges").countDocuments({ memberId });
}

export async function createMemberCharge(input: MemberChargeInput) {
  const db = await chargesReady();
  const amount = Number(input.amount || 0);
  const paidAmount = Number(input.paidAmount ?? 0);
  const now = new Date();
  const doc = {
    memberId: input.memberId,
    chargeType: input.chargeType,
    title: input.title.trim(),
    amount,
    paidAmount,
    status: normalizeChargeStatus(input.status, amount, paidAmount),
    periodYear: input.periodYear?.trim() || undefined,
    dueDate: input.dueDate?.trim() || undefined,
    paidAt: input.paidAt?.trim() || undefined,
    memo: input.memo?.trim() || undefined,
    source: input.source || "manual",
    legacyKey: input.legacyKey || undefined,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection("memberCharges").insertOne(doc);
  return toId(result.insertedId);
}

export async function updateMemberCharge(id: string, input: Partial<MemberChargeInput>) {
  const db = await chargesReady();
  const existing = await db.collection("memberCharges").findOne({ _id: oid(id) });
  if (!existing) return false;

  const amount = input.amount != null ? Number(input.amount) : Number(existing.amount || 0);
  const paidAmount = input.paidAmount != null ? Number(input.paidAmount) : Number(existing.paidAmount ?? 0);
  const $set: Record<string, unknown> = {
    updatedAt: new Date(),
    amount,
    paidAmount,
    status: normalizeChargeStatus(input.status, amount, paidAmount),
  };
  if (input.title != null) $set.title = input.title.trim();
  if (input.chargeType != null) $set.chargeType = input.chargeType;
  if (input.periodYear !== undefined) $set.periodYear = input.periodYear?.trim() || undefined;
  if (input.dueDate !== undefined) $set.dueDate = input.dueDate?.trim() || undefined;
  if (input.paidAt !== undefined) $set.paidAt = input.paidAt?.trim() || undefined;
  if (input.memo !== undefined) $set.memo = input.memo?.trim() || undefined;

  await db.collection("memberCharges").updateOne({ _id: oid(id) }, { $set });
  return true;
}

export async function deleteMemberCharge(id: string) {
  const db = await chargesReady();
  await db.collection("memberCharges").deleteOne({ _id: oid(id) });
}

async function upsertLegacyCharge(input: MemberChargeInput & { legacyKey: string }) {
  const db = await chargesReady();
  const now = new Date();
  const amount = Number(input.amount || 0);
  const paidAmount = Number(input.paidAmount ?? 0);
  await db.collection("memberCharges").updateOne(
    { memberId: input.memberId, legacyKey: input.legacyKey },
    {
      $set: {
        chargeType: input.chargeType,
        title: input.title.trim(),
        amount,
        paidAmount,
        status: normalizeChargeStatus(input.status, amount, paidAmount),
        periodYear: input.periodYear?.trim() || undefined,
        dueDate: input.dueDate?.trim() || undefined,
        paidAt: input.paidAt?.trim() || undefined,
        memo: input.memo?.trim() || undefined,
        source: input.source || "legacy-sync",
        updatedAt: now,
      },
      $setOnInsert: { memberId: input.memberId, legacyKey: input.legacyKey, createdAt: now },
    },
    { upsert: true },
  );
}

export async function syncMemberChargesFromLegacy(memberId: string) {
  const user = await findUserById(memberId);
  if (!user) return;

  const salePrice = Number(user.salePrice || 0);
  if (salePrice > 0) {
    await upsertLegacyCharge({
      memberId,
      legacyKey: "legacy:sale",
      chargeType: "sale",
      title: "분양 계약금",
      amount: salePrice,
      paidAmount: 0,
      status: "pending",
      source: "legacy-sync",
      memo: user.contractNo ? `계약번호 ${user.contractNo}` : undefined,
    });
  }

  const feeHistory = (user.feeHistory as FeeRecord[] | undefined) || [];
  for (const row of feeHistory) {
    if (!row.year?.trim()) continue;
    const amount = Number(row.amount || user.annualFee || 0);
    await upsertLegacyCharge({
      memberId,
      legacyKey: `legacy:annual:${row.year.trim()}`,
      chargeType: "annual_fee",
      title: `${row.year}년 연간 관리비`,
      amount,
      paidAmount: row.paid ? amount : 0,
      status: row.paid ? "paid" : "pending",
      periodYear: row.year.trim(),
      source: "legacy-sync",
      memo: row.memo || undefined,
      paidAt: row.paidAt,
    });
  }

  if (feeHistory.length === 0 && Number(user.annualFee || 0) > 0) {
    const year = new Date().getFullYear().toString();
    const amount = Number(user.annualFee);
    const paid = user.feeStatus === "완납";
    await upsertLegacyCharge({
      memberId,
      legacyKey: `legacy:annual:${year}`,
      chargeType: "annual_fee",
      title: `${year}년 연간 관리비`,
      amount,
      paidAmount: paid ? amount : 0,
      status: paid ? "paid" : "pending",
      periodYear: year,
      source: "legacy-sync",
    });
  }

  const subs = await listMemberSubscriptions(memberId);
  for (const sub of subs) {
    const planLabel = subscriptionLabel(sub.planId);
    await upsertLegacyCharge({
      memberId,
      legacyKey: `legacy:memorial:${sub.hallCode}:${sub.orderId}`,
      chargeType: "memorial",
      title: `추모관 ${sub.hallCode} · ${planLabel}`,
      amount: 0,
      paidAmount: 0,
      status: "paid",
      source: "memorial-billing",
      memo: `~${new Date(sub.expiresAt).toLocaleDateString("ko-KR")}까지`,
    });
  }
}
