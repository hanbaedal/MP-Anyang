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
  const kakaoClientId = process.env.KAKAO_CLIENT_ID || "";
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  return {
    authBaseUrl: authBaseUrl(request),
    kakaoRedirectUri: kakaoRedirectUri(request),
    googleRedirectUri: googleRedirectUri(request),
    kakaoClientIdHint: kakaoClientId ? `${kakaoClientId.slice(0, 6)}…${kakaoClientId.slice(-4)}` : "(미설정)",
    googleClientIdHint: googleClientId ? `${googleClientId.slice(0, 8)}…${googleClientId.slice(-12)}` : "(미설정)",
    hasKakaoSecret: Boolean(process.env.KAKAO_CLIENT_SECRET?.trim()),
    hasGoogleClient: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
    hasGoogleSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
  };
}
