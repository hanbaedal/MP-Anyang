import bcrypt from "bcryptjs";
import { findUserByUsername, toId } from "../../../lib/store";
import { setSessionCookie, signSession } from "../../../lib/auth";
import { redirectTo } from "../../../lib/public-url";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const user = await findUserByUsername(username);
    const hash = String(user?.passwordHash || user?.password || "");

    if (!user || !hash || !(await bcrypt.compare(password, hash))) {
      return redirectTo(request, "/login?error=1");
    }

    const token = await signSession({
      id: toId(user._id),
      username: String(user.username),
      name: String(user.name || user.username),
      role: user.role === "admin" ? "admin" : "member",
    });
    await setSessionCookie(token);
    return redirectTo(request, user.role === "admin" ? "/admin" : "/");
  } catch {
    return redirectTo(request, "/login?error=server");
  }
}
