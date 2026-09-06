/** 본인인증·만 15세 연령 확인 설정 */

export const MIN_MEMBER_AGE = 15;

export type IdentityProvider = "mock" | "nice" | "danal";

export function isIdentityVerifyEnabled() {
  return process.env.IDENTITY_VERIFY_ENABLED === "true";
}

export function identityVerifyMode(): IdentityProvider {
  const mode = (process.env.IDENTITY_VERIFY_MODE || "mock").trim().toLowerCase();
  if (mode === "nice" || mode === "danal") return mode;
  return "mock";
}

export function identityProviderConfigured(mode: IdentityProvider = identityVerifyMode()) {
  if (mode === "mock") return true;
  if (mode === "nice") {
    return Boolean(process.env.NICE_SITE_CODE?.trim() && process.env.NICE_SITE_PASSWORD?.trim());
  }
  if (mode === "danal") {
    return Boolean(process.env.DANAL_CP_ID?.trim() && process.env.DANAL_CP_PASSWORD?.trim());
  }
  return false;
}
