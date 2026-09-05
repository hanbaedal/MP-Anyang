import { NextResponse } from "next/server";
import { errorStatus, readSession } from "../../../../../lib/auth";
import { confirmMemorialOrder, subscriptionLabel } from "../../../../../lib/memorial-billing";

export async function POST(request: Request) {
  try {
    const user = await readSession();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const body = await request.json();
    const orderId = String(body.orderId || "").trim();
    if (!orderId) return NextResponse.json({ error: "주문 ID가 필요합니다." }, { status: 400 });

    const result = await confirmMemorialOrder(orderId, user.id);
    const sub = result.subscription;
    if (!sub) throw new Error("구독 정보를 저장하지 못했습니다.");

    return NextResponse.json({
      ok: true,
      alreadyPaid: result.alreadyPaid,
      hallCode: sub.hallCode,
      planLabel: subscriptionLabel(sub.planId),
      expiresAt: sub.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "결제 확인 실패";
    return NextResponse.json({ error: message }, { status: errorStatus(error) || 500 });
  }
}
