import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { findUserByUsername, toId } from "../../../lib/store";
import { setSessionCookie, signSession } from "../../../lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const user = await findUserByUsername(username);

  if (!user || !(await bcrypt.compare(password, String(user.passwordHash || "")))) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  const token = await signSession({
    id: toId(user._id),
    username: String(user.username),
    name: String(user.name || user.username),
    role: user.role === "admin" ? "admin" : "member",
  });
  await setSessionCookie(token);
  return NextResponse.redirect(new URL("/", request.url));
}
