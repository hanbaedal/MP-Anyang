import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MyPageClient } from "../../../components/MyPageClient";
import { guardMemberPage } from "../../../lib/auth";
import { isMemberProfileComplete, memberProfileFromDoc } from "../../../lib/member-profile";
import { listMemberCharges, syncMemberChargesFromLegacy } from "../../../lib/member-charges";
import { findUserById, updateMember } from "../../../lib/store";
import type { Relation } from "../../../lib/store";
import { smsConsentFromForm } from "../../../lib/sms-consent";

async function saveProfile(formData: FormData) {
  "use server";
  const user = await guardMemberPage();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const plotNo = String(formData.get("plotNo") || "").trim();
  if (!name || !phone || !plotNo) {
    redirect("/mypage?setup=1&error=required");
  }

  const password = String(formData.get("password") || "");
  const deceasedNames = formData.getAll("deceasedName").map(String);
  const relations = formData.getAll("relation").map(String);
  const plotNos = formData.getAll("relPlotNo").map(String);
  const data: Record<string, unknown> = {
    name,
    phone,
    email: String(formData.get("email") || ""),
    plotNo,
    address: String(formData.get("address") || ""),
    emergencyPhone: String(formData.get("emergencyPhone") || ""),
    carNumber: String(formData.get("carNumber") || ""),
    contractNo: String(formData.get("contractNo") || ""),
    registeredAt: String(formData.get("registeredAt") || ""),
    annualFee: Number(formData.get("annualFee") || 0),
    salePrice: Number(formData.get("salePrice") || 0) || undefined,
    relations: deceasedNames
      .map((deceasedName, i) => ({
        deceasedName: deceasedName.trim(),
        relation: (relations[i] || "").trim(),
        plotNo: (plotNos[i] || "").trim(),
      }))
      .filter((row) => row.deceasedName || row.plotNo),
    ...smsConsentFromForm(formData),
  };
  if (password) data.passwordHash = await hash(password, 12);
  await updateMember(user.id, data);
  await syncMemberChargesFromLegacy(user.id);
  revalidatePath("/mypage");
  revalidatePath("/admin/fees");
  redirect("/mypage?saved=1");
}

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; setup?: string; error?: string }>;
}) {
  const session = await guardMemberPage();
  const { saved, setup, error } = await searchParams;
  const doc = await findUserById(session.id);
  if (!doc) redirect("/login");

  const profileComplete = isMemberProfileComplete(doc);
  const setupRequired = setup === "1" || !profileComplete;

  await syncMemberChargesFromLegacy(session.id);
  const charges = setupRequired ? [] : await listMemberCharges(session.id);

  const smsConsentAt = doc.smsConsentAt ? String(doc.smsConsentAt) : null;

  return (
    <MyPageClient
      username={String(doc.username || "")}
      initial={memberProfileFromDoc(doc)}
      charges={charges}
      smsConsentAt={smsConsentAt}
      setupRequired={setupRequired}
      saved={saved === "1"}
      saveProfile={saveProfile}
      error={error === "required" ? "필수 항목(이름·전화·묘역번호)을 입력해 주세요." : null}
    />
  );
}
