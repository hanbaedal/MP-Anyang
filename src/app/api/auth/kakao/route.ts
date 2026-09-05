import { NextResponse } from "next/server";
import { authBaseUrl, randomState } from "../../../../lib/oauth";
import { kakaoRedirectUri } from "../../../../lib/oauth-redirect";
import { redirectTo } from "../../../../lib/public-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) {
    return redirectTo(request, "/login?oauth=kakao-config");
  }
  const redirectUri = kakaoRedirectUri(request);
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", randomState());
  url.searchParams.set("scope", "profile_nickname account_email");
  return NextResponse.redirect(url);
}
