import { completeOAuthLogin, oauthErrorRedirect } from "../../../../../lib/oauth";
import { kakaoRedirectUri } from "../../../../../lib/oauth-redirect";
import { redirectWithSession } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  if (oauthError) return oauthErrorRedirect(request, `kakao-${oauthError}`);

  const code = url.searchParams.get("code");
    const clientId = process.env.KAKAO_CLIENT_ID?.trim();
    const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
  if (!code || !clientId) return oauthErrorRedirect(request, "kakao-fail");

  try {
    const redirectUri = kakaoRedirectUri(request);
    const tokenParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    };
    if (clientSecret) tokenParams.client_secret = clientSecret;

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });
    const token = await tokenRes.json();
    if (!token.access_token) {
      console.error("[kakao/callback] token exchange failed", token);
      const err = String(token.error || "token-fail");
      return oauthErrorRedirect(request, err === "invalid_grant" ? "kakao-invalid_grant" : `kakao-${err}`);
    }

    const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = await meRes.json();
    const kakaoId = String(me.id || "");
    if (!kakaoId) {
      console.error("[kakao/callback] user/me failed", me);
      return oauthErrorRedirect(request, "kakao-fail");
    }

    const user = await completeOAuthLogin({
      provider: "kakao",
      providerId: kakaoId,
      name: me.kakao_account?.profile?.nickname || "카카오회원",
      email: me.kakao_account?.email || "",
    });
    return redirectWithSession(request, "/mypage", user);
  } catch (error) {
    console.error("[kakao/callback]", error);
    return oauthErrorRedirect(request, "kakao-server");
  }
}
