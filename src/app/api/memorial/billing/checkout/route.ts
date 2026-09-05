import { NextResponse } from "next/server";
import { errorStatus, readSession } from "../../../../../lib/auth";
import { createMemorialOrder } from "../../../../../lib/memorial-billing";
import { findHallByCode, memberCanEditHall } from "../../../../../lib/memorial-store";
import type { MemorialPlanId } from "../../../../../lib/memorial-info";

export async function POST(request: Request) {
  try {
    const user = await readSession();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const body = await request.json();
    const planId = String(body.planId || "") as MemorialPlanId;
    const hallCode = String(body.hallCode || "").trim();

    if (!hallCode) {
      return NextResponse.json({ error: "추모관을 선택해 주세요." }, { status: 400 });
    }

    const hall = await findHallByCode(hallCode);
    if (!hall) return NextResponse.json({ error: "추모관을 찾을 수 없습니다." }, { status: 404 });
    if (!(await memberCanEditHall(user.id, user.role, hall))) {
      return NextResponse.json({ error: "해당 추모관에 대한 권한이 없습니다." }, { status: 403 });
    }

    const order = await createMemorialOrder({ memberId: user.id, hallCode, planId });
    return NextResponse.json({ ok: true, ...order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "주문 생성 실패";
    return NextResponse.json({ error: message }, { status: errorStatus(error) || 500 });
  }
}
