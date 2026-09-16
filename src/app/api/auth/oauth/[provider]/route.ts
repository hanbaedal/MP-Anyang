import { NextResponse } from "next/server";
import {
  authorizeUrl,
  createOAuthState,
  oauthConfigured,
  oauthStateCookieOptions,
  OAUTH_STATE_COOKIE,
  type OAuthProvider,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  if (provider !== "kakao" && provider !== "google") {
    return NextResponse.redirect(new URL("/account/login?error=oauth", _request.url));
  }
  const kind = provider as OAuthProvider;
  if (!oauthConfigured(kind)) {
    return NextResponse.redirect(new URL("/account/login?error=oauth", _request.url));
  }
  const state = createOAuthState(kind);
  const res = NextResponse.redirect(authorizeUrl(kind, state));
  res.cookies.set(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions());
  return res;
}
