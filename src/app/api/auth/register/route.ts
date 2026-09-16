import { NextResponse } from "next/server";
import { afterLoginPath, encodeSession, sessionCookieOptions, SESSION_COOKIE, usernameTaken } from "@/lib/auth";
import { ensureAuthSeed, findStaffByUsername } from "@/lib/staff";
import { memberSession, registerMember, validateRegister } from "@/lib/members";

export async function POST(request: Request) {
  let body: {
    username?: string;
    password?: string;
    password2?: string;
    name?: string;
    phone?: string;
    email?: string;
    title?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const error = validateRegister(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  try {
    await ensureAuthSeed();
    const username = body.username!.trim();
    if ((await findStaffByUsername(username)) || (await usernameTaken(username))) {
      return NextResponse.json({ ok: false, error: "이미 있는 아이디입니다." }, { status: 400 });
    }
    const result = await registerMember({
      username,
      password: body.password!,
      name: body.name!,
      phone: body.phone!,
      email: body.email!,
      title: body.title,
    });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    const user = memberSession(result.member);
    const res = NextResponse.json({ ok: true, redirect: afterLoginPath(user) });
    res.cookies.set(SESSION_COOKIE, encodeSession(user), sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." }, { status: 500 });
  }
}
