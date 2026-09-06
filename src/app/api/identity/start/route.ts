import { redirectTo } from "../../../../lib/public-url";
import { identityProviderConfigured, identityVerifyMode, isIdentityVerifyEnabled } from "../../../../lib/identity-config";
import { safeReturnPath } from "../../../../lib/identity-flow";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturnPath(url.searchParams.get("returnTo") || url.searchParams.get("next"), "/signup");

  if (!isIdentityVerifyEnabled()) {
    return redirectTo(request, returnTo);
  }

  const mode = identityVerifyMode();
  if (mode === "mock" || !identityProviderConfigured(mode)) {
    const next = encodeURIComponent(returnTo);
    return redirectTo(request, `/identity/verify?next=${next}`);
  }

  // TODO: NICE/Danal 인증 URL 생성 후 redirect
  return redirectTo(request, `/identity/verify?error=provider_pending&next=${encodeURIComponent(returnTo)}`);
}
