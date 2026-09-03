import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { findUserByPhoneAndName, setResetToken, toId } from "../../../../lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "");
  const user = await findUserByPhoneAndName(phone, name);
  if (!user || user.role === "admin") {
    return NextResponse.json({ error: "등록된 이름과 전화번호가 일치하지 않습니다." }, { status: 404 });
  }
  const token = randomBytes(24).toString("hex");
  await setResetToken(toId(user._id), token, new Date(Date.now() + 10 * 60 * 1000));
  return NextResponse.json({ token, username: String(user.username) });
}
