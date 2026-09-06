import { NextResponse } from "next/server";
import {
  identityProviderConfigured,
  identityVerifyMode,
  isIdentityVerifyEnabled,
  MIN_MEMBER_AGE,
} from "../../../../lib/identity-config";
import { readIdentityPayload } from "../../../../lib/identity-token";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = isIdentityVerifyEnabled();
  const mode = identityVerifyMode();
  const configured = identityProviderConfigured(mode);
  const verified = enabled ? await readIdentityPayload() : null;

  return NextResponse.json({
    enabled,
    mode,
    configured,
    minAge: MIN_MEMBER_AGE,
    verified: Boolean(verified),
    name: verified?.name || "",
    phone: verified?.phone || "",
    birthDate: verified?.birthDate || "",
  });
}
