import { NextResponse } from "next/server";
import { finishOAuthLogin, encodeSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import {
  exchangeOAuthCode,
  oauthConfigured,
  oauthStateCookieOptions,
  OAUTH_STATE_COOKIE,
  readOAuthState,
  type OAuthProvider,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

function fail(request: Request) {
  return NextResponse.redirect(new URL("/account/login?error=oauth", request.url));
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  if (provider !== "kakao" && provider !== "google") return fail(request);
  const kind = provider as OAuthProvider;
  if (!oauthConfigured(kind)) return fail(request);

  const url = new URL(request.url);
  if (url.searchParams.get("error")) return fail(request);
  const code = url.searchParams.get("code")?.trim();
  const state = url.searchParams.get("state")?.trim();
  if (!code || !state) return fail(request);

  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${OAUTH_STATE_COOKIE}=([^;]+)`));
  const stored = match ? decodeURIComponent(match[1]) : "";
  if (!readOAuthState(stored, kind) || stored !== state) return fail(request);

  try {
    const profile = await exchangeOAuthCode(kind, code);
    const result = await finishOAuthLogin(profile);
    const res = NextResponse.redirect(new URL(result.redirect, `${url.origin}`));
    res.cookies.set(SESSION_COOKIE, encodeSession(result.user), sessionCookieOptions());
    res.cookies.set(OAUTH_STATE_COOKIE, "", { ...oauthStateCookieOptions(0), maxAge: 0 });
    return res;
  } catch (err) {
    console.error("[auth/oauth-callback]");
    console.error(err);
    return fail(request);
  }
}
