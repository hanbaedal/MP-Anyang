import { authBaseUrl, completeOAuthLogin, oauthErrorRedirect } from "../../../../../lib/oauth";
import { redirectTo } from "../../../../../lib/public-url";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!code || !clientId || !clientSecret) return oauthErrorRedirect(request, "google-fail");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${authBaseUrl(request)}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const token = await tokenRes.json();
  if (!token.access_token) return oauthErrorRedirect(request, "google-fail");

  const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const me = await meRes.json();
  const googleId = String(me.id || "");
  if (!googleId) return oauthErrorRedirect(request, "google-fail");

  await completeOAuthLogin({
    provider: "google",
    providerId: googleId,
    name: me.name || "구글회원",
    email: me.email || "",
  });
  return redirectTo(request, "/mypage");
}
