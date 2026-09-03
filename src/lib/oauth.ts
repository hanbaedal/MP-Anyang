import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { loginAs } from "./auth";
import { createOAuthMember, findUserByGoogle, findUserByKakao, toId } from "./store";

export function authBaseUrl() {
  return process.env.AUTH_BASE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
}

export async function completeOAuthLogin(input: {
  provider: "kakao" | "google";
  providerId: string;
  name: string;
  email: string;
}) {
  const existing =
    input.provider === "kakao" ? await findUserByKakao(input.providerId) : await findUserByGoogle(input.providerId);

  if (existing) {
    await loginAs({
      id: toId(existing._id),
      username: String(existing.username),
      name: String(existing.name || existing.username),
      role: existing.role === "admin" ? "admin" : "member",
    });
    return;
  }

  const username = `${input.provider}_${input.providerId.slice(0, 12)}`;
  const id = await createOAuthMember({
    username,
    name: input.name || username,
    email: input.email,
    kakaoId: input.provider === "kakao" ? input.providerId : undefined,
    googleId: input.provider === "google" ? input.providerId : undefined,
  });
  await loginAs({ id, username, name: input.name || username, role: "member" });
}

export function oauthErrorRedirect(request: Request, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("oauth", message);
  return NextResponse.redirect(url);
}

export function randomState() {
  return randomBytes(16).toString("hex");
}
