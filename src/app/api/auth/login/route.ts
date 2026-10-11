import { NextResponse } from "next/server";
import { encodeSession, loginAccount, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { clientIp } from "@/lib/ip-place";
import { isStaffWorkHour, isWorkHourLimitedRole } from "@/lib/work-hours";
import { recordStaffLogin } from "@/lib/site-analytics";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const result = await loginAccount({
      username: body.username ?? "",
      password: body.password ?? "",
    });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    if (isWorkHourLimitedRole(result.user.role) && !isStaffWorkHour()) {
      return NextResponse.json(
        { ok: false, error: "관리자는 오전 9시부터 오후 6시까지만 로그인할 수 있습니다." },
        { status: 400 },
      );
    }
    const ip = clientIp(request.headers);
    const userAgent = request.headers.get("user-agent") ?? "";
    await recordStaffLogin(result.user, ip, userAgent);
    const res = NextResponse.json({ ok: true, redirect: result.redirect });
    res.cookies.set(SESSION_COOKIE, encodeSession(result.user), sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." }, { status: 500 });
  }
}
