import { oauthConfigInfo } from "../../../../lib/oauth-redirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const info = oauthConfigInfo(request);
  return Response.json({
    ok: true,
    message: "카카오·Google 콘솔에 아래 redirect URI를 문자 그대로 등록하세요.",
    ...info,
    kakaoConsole: "앱 > 제품 설정 > 카카오 로그인 > Redirect URI",
    googleConsole: "Google Cloud > 사용자 인증 정보 > OAuth 클라이언트 > 승인된 리디렉션 URI",
  });
}
