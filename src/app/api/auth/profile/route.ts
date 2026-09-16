import { NextResponse } from "next/server";
import { afterLoginPath, encodeSession, readSession, sessionCookieOptions, SESSION_COOKIE, usernameTaken } from "@/lib/auth";
import { updateMemberProfile, validateProfile } from "@/lib/members";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session || session.role !== "member") {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { username?: string; name?: string; phone?: string; email?: string; title?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const error = validateProfile({
    username: body.username || session.username,
    name: body.name,
    phone: body.phone,
    email: body.email,
    title: body.title,
  });
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  const username = (body.username || session.username).trim();
  if (await usernameTaken(username, session.id)) {
    return NextResponse.json({ ok: false, error: "이미 있는 아이디입니다." }, { status: 400 });
  }

  try {
    const result = await updateMemberProfile(session.id, {
      username,
      name: body.name!,
      phone: body.phone!,
      email: body.email!,
      title: body.title,
    });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    const user = {
      id: result.member.id,
      username: result.member.username,
      name: result.member.name,
      role: "member" as const,
      phone: result.member.phone,
      email: result.member.email,
      title: result.member.title,
    };
    const res = NextResponse.json({ ok: true, redirect: afterLoginPath(user) });
    res.cookies.set(SESSION_COOKIE, encodeSession(user), sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[auth/profile]", err);
    return NextResponse.json({ ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." }, { status: 500 });
  }
}
