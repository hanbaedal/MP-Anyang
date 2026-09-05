import { NextResponse } from "next/server";
import { readSession } from "../../../../../lib/auth";
import { billingMode, listMemberSubscriptions } from "../../../../../lib/memorial-billing";

export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const subs = await listMemberSubscriptions(user.id);
  return NextResponse.json({
    mode: billingMode(),
    subscriptions: subs.map((s) => ({
      hallCode: s.hallCode,
      planId: s.planId,
      expiresAt: s.expiresAt,
    })),
  });
}
