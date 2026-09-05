import { randomBytes } from "crypto";
import type { SessionUser } from "./auth";
import { publicOrigin, redirectTo } from "./public-url";
import { createOAuthMember, findUserByGoogle, findUserByKakao, toId } from "./store";

export function authBaseUrl(request: Request) {
  return publicOrigin(request);
}

export async function completeOAuthLogin(input: {
  provider: "kakao" | "google";
  providerId: string;
  name: string;
  email: string;
}): Promise<SessionUser> {
  const existing =
    input.provider === "kakao" ? await findUserByKakao(input.providerId) : await findUserByGoogle(input.providerId);

  if (existing) {
    return {
      id: toId(existing._id),
      username: String(existing.username),
      name: String(existing.name || existing.username),
      role: existing.role === "admin" ? "admin" : "member",
    };
  }

  const username = `${input.provider}_${input.providerId.slice(0, 12)}`;
  const id = await createOAuthMember({
    username,
    name: input.name || username,
    email: input.email,
    kakaoId: input.provider === "kakao" ? input.providerId : undefined,
    googleId: input.provider === "google" ? input.providerId : undefined,
  });
  return { id, username, name: input.name || username, role: "member" };
}

export function oauthErrorRedirect(request: Request, message: string) {
  return redirectTo(request, `/login?oauth=${encodeURIComponent(message)}`);
}

export function randomState() {
  return randomBytes(16).toString("hex");
}
