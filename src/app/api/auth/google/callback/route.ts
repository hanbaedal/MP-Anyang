import { completeOAuthLogin, oauthErrorRedirect } from "../../../../../lib/oauth";
import { googleRedirectUri } from "../../../../../lib/oauth-redirect";
import { redirectWithSession } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  if (oauthError) return oauthErrorRedirect(request, `google-${oauthError}`);

  const code = url.searchParams.get("code");
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!code || !clientId || !clientSecret) return oauthErrorRedirect(request, "google-fail");

  try {
    const redirectUri = googleRedirectUri(request);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) {
      console.error("[google/callback] token exchange failed", { redirectUri, error: token });
      const err = String(token.error || "token-fail");
      if (err === "redirect_uri_mismatch" || err === "invalid_grant") {
        return oauthErrorRedirect(request, "google-invalid_grant");
      }
      if (err === "invalid_client") return oauthErrorRedirect(request, "google-invalid_client");
      return oauthErrorRedirect(request, `google-${err}`);
    }

    const meRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = await meRes.json();
    const googleId = String(me.sub || me.id || "");
    if (!googleId) {
      console.error("[google/callback] userinfo failed", me);
      return oauthErrorRedirect(request, "google-fail");
    }

    const user = await completeOAuthLogin({
      provider: "google",
      providerId: googleId,
      name: me.name || "구글회원",
      email: me.email || "",
    });
    return redirectWithSession(request, "/mypage", user);
  } catch (error) {
    console.error("[google/callback]", error);
    return oauthErrorRedirect(request, "google-server");
  }
}
