import { NextResponse } from "next/server";
import { verifySolapiConnection } from "@/lib/solapi";

/** 비밀값 없이 솔라피 env·인증만 확인 (배포/설정 점검용) */
export const dynamic = "force-dynamic";

export async function GET() {
  const solapi = await verifySolapiConnection();
  return NextResponse.json(
    {
      ok: true,
      configured: solapi.configured,
      authOk: solapi.authOk,
      from: solapi.from,
      error: solapi.error ?? null,
      // 잔액 숫자는 공개하지 않음
      balanceReady: Boolean(solapi.balance),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
