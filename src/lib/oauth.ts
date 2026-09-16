import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/lib/site";

export type OAuthProvider = "kakao" | "google";

function firstEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function secret() {
  return process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || "anyang-local-auth";
}

export function oauthBaseUrl() {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    siteUrl()
  ).replace(/\/$/, "");
}

export function oauthCallbackUrl(provider: OAuthProvider) {
  return `${oauthBaseUrl()}/api/auth/callback/${provider}`;
}

export function googleCredentials() {
  return {
    clientId: firstEnv(["GOOGLE_CLIENT_ID", "AUTH_GOOGLE_ID", "GOOGLE_ID", "AUTH_GOOGLE_CLIENT_ID"]),
    clientSecret: firstEnv([
      "GOOGLE_CLIENT_SECRET",
      "AUTH_GOOGLE_SECRET",
      "GOOGLE_SECRET",
      "AUTH_GOOGLE_CLIENT_SECRET",
    ]),
  };
}

export function kakaoCredentials() {
  return {
    clientId: firstEnv(["KAKAO_REST_API_KEY", "KAKAO_CLIENT_ID", "AUTH_KAKAO_ID", "KAKAO_ID", "AUTH_KAKAO_CLIENT_ID"]),
    clientSecret: firstEnv(["KAKAO_CLIENT_SECRET", "AUTH_KAKAO_SECRET", "KAKAO_SECRET", "AUTH_KAKAO_CLIENT_SECRET"]),
  };
}

export function oauthConfigured(provider: OAuthProvider) {
  if (provider === "google") {
    const { clientId, clientSecret } = googleCredentials();
    return Boolean(clientId && clientSecret);
  }
  return Boolean(kakaoCredentials().clientId);
}

export const OAUTH_STATE_COOKIE = "anyang_oauth";

export function oauthStateCookieOptions(maxAge = 600) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge,
    secure: oauthBaseUrl().startsWith("https://"),
  };
}

export function createOAuthState(provider: OAuthProvider) {
  const nonce = randomBytes(16).toString("hex");
  const payload = Buffer.from(JSON.stringify({ p: provider, n: nonce, exp: Date.now() + 600_000 })).toString("base64url");
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function readOAuthState(token: string | undefined, provider: OAuthProvider) {
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { p?: string; exp?: number };
    if (data.p !== provider) return false;
    if (!data.exp || data.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function authorizeUrl(provider: OAuthProvider, state: string) {
  const redirectUri = oauthCallbackUrl(provider);
  if (provider === "google") {
    const { clientId } = googleCredentials();
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    return url.toString();
  }
  const { clientId } = kakaoCredentials();
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "profile_nickname,account_email");
  return url.toString();
}

export type OAuthProfile = {
  provider: OAuthProvider;
  oauthId: string;
  name: string;
  email: string;
  phone: string;
};

function kakaoPhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("82") && digits.length >= 12) return `0${digits.slice(2)}`;
  return digits;
}

export async function exchangeOAuthCode(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
  const redirectUri = oauthCallbackUrl(provider);
  if (provider === "google") {
    const { clientId, clientSecret } = googleCredentials();
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!tokenRes.ok) throw new Error("google-token");
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) throw new Error("google-token");
    const meRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!meRes.ok) throw new Error("google-profile");
    const me = (await meRes.json()) as { sub?: string; name?: string; email?: string };
    if (!me.sub) throw new Error("google-profile");
    return {
      provider,
      oauthId: me.sub,
      name: me.name?.trim() || "",
      email: me.email?.trim() || "",
      phone: "",
    };
  }

  const { clientId, clientSecret } = kakaoCredentials();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });
  if (clientSecret) body.set("client_secret", clientSecret);
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });
  if (!tokenRes.ok) throw new Error("kakao-token");
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) throw new Error("kakao-token");
  const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!meRes.ok) throw new Error("kakao-profile");
  const me = (await meRes.json()) as {
    id?: number | string;
    properties?: { nickname?: string };
    kakao_account?: { email?: string; profile?: { nickname?: string }; phone_number?: string };
  };
  const oauthId = me.id != null ? String(me.id) : "";
  if (!oauthId) throw new Error("kakao-profile");
  return {
    provider,
    oauthId,
    name: me.kakao_account?.profile?.nickname?.trim() || me.properties?.nickname?.trim() || "",
    email: me.kakao_account?.email?.trim() || "",
    phone: me.kakao_account?.phone_number ? kakaoPhone(me.kakao_account.phone_number) : "",
  };
}
