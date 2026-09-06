import { memberLandingPath } from "./oauth";
import { isIdentityVerifyEnabled } from "./identity-config";

/** OAuth·회원가입 후 본인인증이 필요하면 verify 페이지로 */
export function postAuthRedirectPath(doc: Record<string, unknown> | null | undefined) {
  const landing = memberLandingPath(doc);
  if (isIdentityVerifyEnabled() && !doc?.identityVerifiedAt) {
    return `/identity/verify?next=${encodeURIComponent(landing)}`;
  }
  return landing;
}

export function safeReturnPath(raw: string | null | undefined, fallback = "/signup") {
  const value = (raw || fallback).trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
