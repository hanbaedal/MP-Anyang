import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import { listMembers, toId, updateMember, deleteMember } from "../../../../lib/store";
import type { Relation } from "../../../../lib/store";
import { AdminMembersClient } from "./AdminMembersClient";

async function updateMemberAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const password = String(formData.get("password") || "");
  const data: Record<string, unknown> = {
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    plotNo: String(formData.get("plotNo") || ""),
    feeStatus: String(formData.get("feeStatus") || "미납"),
    annualFee: Number(formData.get("annualFee") || 0),
  };
  if (password) data.passwordHash = await hash(password, 12);
  await updateMember(id, data);
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

async function removeMemberAction(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteMember(String(formData.get("id")));
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = (await listMembers()).map((m) => ({
    id: toId(m._id),
    username: String(m.username || ""),
    name: String(m.name || ""),
    phone: String(m.phone || ""),
    email: String(m.email || ""),
    plotNo: String(m.plotNo || ""),
    annualFee: Number(m.annualFee || 0),
    feeStatus: String(m.feeStatus || "미납"),
    smsConsent: Boolean(m.smsConsent),
    marketingSmsConsent: Boolean(m.marketingSmsConsent),
    smsConsentAt: m.smsConsentAt ? String(m.smsConsentAt) : null,
    relations: ((m.relations as Relation[] | undefined) || []).slice(),
  }));

  return (
    <article className="article admin-members-page">
      <p className="kicker">관리자</p>
      <h1>회원 관리</h1>
      <p className="lead">이름 가나다순 목록 · 검색 · 수정/삭제</p>

      <AdminMembersClient
        members={members}
        updateMemberAction={updateMemberAction}
        removeMemberAction={removeMemberAction}
      />
    </article>
  );
}
