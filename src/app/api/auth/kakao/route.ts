import { NextResponse } from "next/server";
import { authBaseUrl, randomState } from "../../../../lib/oauth";

export async function GET(request: Request) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?oauth=kakao-config", request.url));
  }
  const redirectUri = `${authBaseUrl()}/api/auth/kakao/callback`;
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", randomState());
  return NextResponse.redirect(url);
}
