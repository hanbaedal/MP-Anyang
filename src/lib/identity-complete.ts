import { isAtLeastMinAge } from "./identity-age";
import { identityVerifyMode, isIdentityVerifyEnabled } from "./identity-config";
import { safeReturnPath } from "./identity-flow";
import {
  clearIdentityCookie,
  hashCi,
  identityFieldsFromPayload,
  readIdentityPayload,
  setIdentityCookie,
  type IdentityPayload,
} from "./identity-token";
import { readSession } from "./auth";
import { ciHashExists, updateMember } from "./store";
import { normalizePhone } from "./phone";

export type IdentityCompleteResult =
  | { ok: true; returnTo: string }
  | { ok: false; error: "disabled" | "underage" | "duplicate" | "invalid" | "provider" };

export async function completeIdentityVerification(input: {
  name: string;
  birthDate: string;
  phone: string;
  returnTo?: string | null;
}): Promise<IdentityCompleteResult> {
  if (!isIdentityVerifyEnabled()) {
    return { ok: false, error: "disabled" };
  }

  const name = input.name.trim();
  const birthDate = input.birthDate.trim();
  const phone = normalizePhone(input.phone);
  const returnTo = safeReturnPath(input.returnTo, "/signup");

  if (!name || !birthDate || phone.length < 10) {
    return { ok: false, error: "invalid" };
  }
  if (!isAtLeastMinAge(birthDate)) {
    return { ok: false, error: "underage" };
  }

  const provider = identityVerifyMode();
  const ciHash = hashCi({ name, birthDate, phone, provider });
  if (await ciHashExists(ciHash)) {
    return { ok: false, error: "duplicate" };
  }

  const verifiedAt = new Date().toISOString();
  const payload: IdentityPayload = { name, birthDate, phone, ciHash, provider, verifiedAt };
  const fields = identityFieldsFromPayload(payload);

  const session = await readSession();
  if (session && session.role === "member") {
    await updateMember(session.id, fields);
    await clearIdentityCookie();
    return { ok: true, returnTo };
  }

  await setIdentityCookie(payload);
  return { ok: true, returnTo };
}

export async function requireSignupIdentity() {
  if (!isIdentityVerifyEnabled()) return null;
  const payload = await readIdentityPayload();
  if (!payload) return { error: "identity" as const };
  if (!isAtLeastMinAge(payload.birthDate)) return { error: "underage" as const };
  if (await ciHashExists(payload.ciHash)) return { error: "duplicate" as const };
  return { payload };
}
