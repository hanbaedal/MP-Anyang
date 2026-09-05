import { authBaseUrl } from "./oauth";

function trimUri(value: string) {
  return value.trim().replace(/\/$/, "");
}

export function kakaoRedirectUri(request: Request) {
  const fromEnv = process.env.KAKAO_REDIRECT_URI?.trim();
  if (fromEnv) return trimUri(fromEnv);
  return `${authBaseUrl(request)}/api/auth/kakao/callback`;
}

export function googleRedirectUri(request: Request) {
  const fromEnv = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (fromEnv) return trimUri(fromEnv);
  return `${authBaseUrl(request)}/api/auth/google/callback`;
}

export function oauthConfigInfo(request: Request) {
  const clientId = process.env.KAKAO_CLIENT_ID || "";
  return {
    authBaseUrl: authBaseUrl(request),
    kakaoRedirectUri: kakaoRedirectUri(request),
    googleRedirectUri: googleRedirectUri(request),
    kakaoClientIdHint: clientId ? `${clientId.slice(0, 6)}…${clientId.slice(-4)}` : "(미설정)",
    hasKakaoSecret: Boolean(process.env.KAKAO_CLIENT_SECRET),
    hasGoogleClient: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasGoogleSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
  };
}
