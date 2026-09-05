import { NextResponse } from "next/server";
import { randomState } from "../../../../lib/oauth";
import { googleRedirectUri } from "../../../../lib/oauth-redirect";
import { redirectTo } from "../../../../lib/public-url";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return redirectTo(request, "/login?oauth=google-config");
  }
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", googleRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", randomState());
  return NextResponse.redirect(url);
}
