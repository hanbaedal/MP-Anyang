import { completeOAuthLogin, oauthErrorRedirect } from "../../../../../lib/oauth";
import { kakaoRedirectUri } from "../../../../../lib/oauth-redirect";
import { redirectTo } from "../../../../../lib/public-url";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  if (!code || !clientId) return oauthErrorRedirect(request, "kakao-fail");

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret || "",
      redirect_uri: kakaoRedirectUri(request),
      code,
    }),
  });
  const token = await tokenRes.json();
  if (!token.access_token) return oauthErrorRedirect(request, "kakao-fail");

  const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const me = await meRes.json();
  const kakaoId = String(me.id || "");
  if (!kakaoId) return oauthErrorRedirect(request, "kakao-fail");

  await completeOAuthLogin({
    provider: "kakao",
    providerId: kakaoId,
    name: me.kakao_account?.profile?.nickname || "카카오회원",
    email: me.kakao_account?.email || "",
  });
  return redirectTo(request, "/mypage");
}
