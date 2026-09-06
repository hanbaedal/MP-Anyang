import { NextResponse } from "next/server";
import { isAtLeastMinAge } from "../../../../lib/identity-age";
import { identityVerifyMode, isIdentityVerifyEnabled } from "../../../../lib/identity-config";
import { safeReturnPath } from "../../../../lib/identity-flow";
import { completeIdentityVerification } from "../../../../lib/identity-complete";
import { redirectTo } from "../../../../lib/public-url";

export const dynamic = "force-dynamic";

const ERROR_PATH: Record<string, string> = {
  disabled: "disabled",
  underage: "underage",
  duplicate: "duplicate",
  invalid: "invalid",
};

export async function POST(request: Request) {
  if (!isIdentityVerifyEnabled()) {
    return redirectTo(request, "/signup?error=identity_disabled");
  }
  if (identityVerifyMode() !== "mock") {
    return redirectTo(request, "/identity/verify?error=provider");
  }

  const form = await request.formData();
  const name = String(form.get("name") || "");
  const birthDate = String(form.get("birthDate") || "");
  const phone = String(form.get("phone") || "");
  const returnTo = safeReturnPath(String(form.get("returnTo") || "/signup"), "/signup");

  const result = await completeIdentityVerification({ name, birthDate, phone, returnTo });
  if (!result.ok) {
    const err = ERROR_PATH[result.error] || "invalid";
    return redirectTo(request, `/identity/verify?error=${err}&next=${encodeURIComponent(returnTo)}`);
  }

  const sep = returnTo.includes("?") ? "&" : "?";
  return redirectTo(request, `${returnTo}${sep}verified=1`);
}

/** JSON API (개발·테스트용) */
export async function PUT(request: Request) {
  if (!isIdentityVerifyEnabled() || identityVerifyMode() !== "mock") {
    return NextResponse.json({ error: "not_available" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "");
  const birthDate = String(body.birthDate || "");
  const phone = String(body.phone || "");
  const returnTo = safeReturnPath(String(body.returnTo || "/signup"), "/signup");

  if (!isAtLeastMinAge(birthDate)) {
    return NextResponse.json({ error: "underage" }, { status: 400 });
  }

  const result = await completeIdentityVerification({ name, birthDate, phone, returnTo });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, returnTo: result.returnTo });
}
