export function oauthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    "kakao-config":
      "카카오 Client ID가 없습니다. Render 환경변수 KAKAO_CLIENT_ID를 확인해 주세요.",
    "kakao-fail":
      "카카오 로그인 처리에 실패했습니다. 아래 Redirect URI가 카카오 개발자 콘솔에 등록됐는지 확인해 주세요.",
    "kakao-invalid_grant":
      "카카오 Redirect URI 불일치입니다. 콘솔에 https://mp-anyang.onrender.com/api/auth/kakao/callback 를 정확히 등록해 주세요.",
    "kakao-invalid_client": "카카오 Client ID 또는 Client Secret이 올바르지 않습니다.",
    "kakao-access_denied": "카카오 로그인이 취소되었습니다.",
    "kakao-token-fail": "카카오 인증 코드 교환에 실패했습니다.",
    "kakao-server": "서버 처리 중 오류가 났습니다. 잠시 후 다시 시도해 주세요.",
    "google-fail": "Google 로그인에 실패했습니다. Google Cloud Redirect URI 설정을 확인해 주세요.",
  };
  if (map[code]) return map[code];
  if (code.startsWith("kakao-")) return map["kakao-fail"];
  if (code.startsWith("google-")) return map["google-fail"];
  return "간편 로그인에 실패했습니다. 환경변수와 OAuth 콘솔 설정을 확인해 주세요.";
}

export const KAKAO_REDIRECT_URI_HINT = "https://mp-anyang.onrender.com/api/auth/kakao/callback";
