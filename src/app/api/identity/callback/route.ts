import { redirectTo } from "../../../../lib/public-url";
import { identityVerifyMode, isIdentityVerifyEnabled } from "../../../../lib/identity-config";

export const dynamic = "force-dynamic";

/** NICE·Danal 콜백 — 계약·키 설정 후 provider 연동 시 사용 */
export async function GET(request: Request) {
  if (!isIdentityVerifyEnabled()) {
    return redirectTo(request, "/signup");
  }

  const mode = identityVerifyMode();
  if (mode === "mock") {
    return redirectTo(request, "/identity/verify?error=provider");
  }

  // TODO: NICE/Danal EncodeData 검증 후 completeIdentityVerification 호출
  return redirectTo(request, "/identity/verify?error=provider_pending");
}

export async function POST(request: Request) {
  return GET(request);
}
