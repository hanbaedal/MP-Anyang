import { NextResponse } from "next/server";
import { authBaseUrl, randomState } from "../../../../lib/oauth";
import { kakaoRedirectUri } from "../../../../lib/oauth-redirect";
import { redirectTo } from "../../../../lib/public-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = process.env.KAKAO_CLIENT_ID?.trim();
  if (!clientId) {
    return redirectTo(request, "/login?oauth=kakao-config");
  }
  const redirectUri = kakaoRedirectUri(request);
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", randomState());
  // scope 미지정 — 카카오 콘솔 [동의항목] 설정을 따름 (미설정 scope 요청 시 KOE205)
  return NextResponse.redirect(url);
}
