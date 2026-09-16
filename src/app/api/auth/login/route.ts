import { NextResponse } from "next/server";
import { encodeSession, loginMember, sessionCookieOptions, MEMBER_COOKIE } from "@/lib/members";

export async function POST(request: Request) {
  let body: { phone?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const result = await loginMember({ phone: body.phone ?? "", password: body.password ?? "" });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(MEMBER_COOKIE, encodeSession(result.member), sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." }, { status: 500 });
  }
}
