import { hash } from "bcryptjs";
import { syncMemberChargesFromLegacy } from "../../../lib/member-charges";
import { createMember, phoneExists, usernameExists } from "../../../lib/store";
import type { Relation } from "../../../lib/store";
import { redirectTo } from "../../../lib/public-url";
import { smsConsentFromForm } from "../../../lib/sms-consent";

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  const password2 = String(form.get("password2") || "");
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "");
  const email = String(form.get("email") || "").trim();

  if (!username || !password || !name || !phone) {
    return redirectTo(request, "/signup?error=required");
  }
  if (password !== password2) {
    return redirectTo(request, "/signup?error=pw");
  }
  if (password.length < 6) {
    return redirectTo(request, "/signup?error=short");
  }
  if (await usernameExists(username)) {
    return redirectTo(request, "/signup?error=id");
  }
  if (await phoneExists(phone)) {
    return redirectTo(request, "/signup?error=phone");
  }

  const deceasedNames = form.getAll("deceasedName").map(String);
  const relations = form.getAll("relation").map(String);
  const plotNos = form.getAll("relPlotNo").map(String);
  const rels: Relation[] = deceasedNames
    .map((deceasedName, i) => ({
      deceasedName: deceasedName.trim(),
      relation: (relations[i] || "").trim(),
      plotNo: (plotNos[i] || "").trim(),
    }))
    .filter((row) => row.deceasedName || row.plotNo);

  const consent = smsConsentFromForm(form);

  const memberId = await createMember({
    username,
    passwordHash: await hash(password, 12),
    name,
    phone,
    email,
    plotNo: String(form.get("plotNo") || "").trim(),
    address: String(form.get("address") || "").trim(),
    emergencyPhone: String(form.get("emergencyPhone") || "").trim(),
    carNumber: String(form.get("carNumber") || "").trim(),
    contractNo: String(form.get("contractNo") || "").trim(),
    registeredAt: String(form.get("registeredAt") || new Date().toISOString().slice(0, 10)),
    relations: rels,
    annualFee: Number(form.get("annualFee") || 0),
    salePrice: Number(form.get("salePrice") || 0) || undefined,
    ...consent,
  });
  await syncMemberChargesFromLegacy(memberId);

  return redirectTo(request, `/login?signup=1&u=${encodeURIComponent(username)}`);
}
