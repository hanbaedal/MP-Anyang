import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { findUserByResetToken, toId, updatePassword } from "../../../../lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (password.length < 6) {
    return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
  }
  const user = await findUserByResetToken(token);
  if (!user) {
    return NextResponse.json({ error: "인증이 만료되었습니다. 다시 시도해 주세요." }, { status: 400 });
  }
  await updatePassword(toId(user._id), await hash(password, 12));
  return NextResponse.json({ username: String(user.username) });
}
