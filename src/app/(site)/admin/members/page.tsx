import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import { syncMemberChargesFromLegacy } from "../../../../lib/member-charges";
import { listMembers, resolvePlotPrices, toId, updateMember, deleteMember } from "../../../../lib/store";
import type { Relation } from "../../../../lib/store";
import { AdminMembersClient } from "./AdminMembersClient";

async function updateMemberAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const password = String(formData.get("password") || "");
  const plotNo = String(formData.get("plotNo") || "").trim();
  let annualFee = Number(formData.get("annualFee") || 0);
  let salePrice = Number(formData.get("salePrice") || 0) || undefined;

  if (plotNo) {
    const prices = await resolvePlotPrices(plotNo);
    if (prices) {
      if (formData.get("applyPlotFees") === "1") {
        annualFee = prices.annualFee;
        salePrice = prices.salePrice || undefined;
      } else {
        if (annualFee === 0 && prices.annualFee > 0) annualFee = prices.annualFee;
        if ((!salePrice || salePrice === 0) && prices.salePrice > 0) salePrice = prices.salePrice;
      }
    }
  }

  const data: Record<string, unknown> = {
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    plotNo,
    feeStatus: String(formData.get("feeStatus") || "미납"),
    annualFee,
    salePrice,
  };
  if (password) data.passwordHash = await hash(password, 12);
  await updateMember(id, data);
  await syncMemberChargesFromLegacy(id);
  revalidatePath("/admin/members");
  revalidatePath("/admin/fees");
  revalidatePath("/mypage");
  redirect("/admin/members?saved=1");
}

async function removeMemberAction(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteMember(String(formData.get("id")));
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { saved } = await searchParams;
  const members = (await listMembers()).map((m) => ({
    id: toId(m._id),
    username: String(m.username || ""),
    name: String(m.name || ""),
    phone: String(m.phone || ""),
    email: String(m.email || ""),
    plotNo: String(m.plotNo || ""),
    annualFee: Number(m.annualFee || 0),
    salePrice: Number(m.salePrice || 0),
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
      <p className="lead">이름 가나다순 목록 · 검색 · 수정/삭제 · 묘역 연결 시 요금표 자동 반영</p>
      {saved && <p className="ok">회원 정보가 저장되었고 비용 원장이 동기화되었습니다.</p>}

      <AdminMembersClient
        members={members}
        updateMemberAction={updateMemberAction}
        removeMemberAction={removeMemberAction}
      />
    </article>
  );
}
