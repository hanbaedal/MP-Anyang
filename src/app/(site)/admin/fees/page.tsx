import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdminPage } from "../../../../lib/auth";
import {
  createMemberCharge,
  deleteMemberCharge,
  listMemberCharges,
  syncMemberChargesFromLegacy,
  updateMemberCharge,
  type ChargeStatus,
  type ChargeType,
} from "../../../../lib/member-charges";
import {
  getFeeRatesMerged,
  getSaleRatesMerged,
  listMembers,
  saveFeeRates,
  saveSaleRates,
  toId,
  updateMember,
} from "../../../../lib/store";
import type { FeeRecord } from "../../../../lib/store";
import { AdminFeeRatesPanel } from "./AdminFeeRatesPanel";
import { AdminFeesClient } from "./AdminFeesClient";

function parseFeeHistory(formData: FormData): FeeRecord[] {
  const years = formData.getAll("feeYear").map(String);
  const amounts = formData.getAll("feeAmount").map((v) => Number(v));
  const paidFlags = formData.getAll("feePaid").map(String);
  const memos = formData.getAll("feeMemo").map(String);

  return years
    .map((year, i) => ({
      year: year.trim(),
      amount: amounts[i] || 0,
      paid: paidFlags[i] === "1",
      memo: (memos[i] || "").trim(),
    }))
    .filter((row) => row.year);
}

async function updateFeeAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  const id = String(formData.get("id"));
  await updateMember(id, {
    feeStatus: String(formData.get("feeStatus") || "미납"),
    annualFee: Number(formData.get("annualFee") || 0),
    salePrice: Number(formData.get("salePrice") || 0) || undefined,
    feeHistory: parseFeeHistory(formData),
  });
  await syncMemberChargesFromLegacy(id);
  revalidatePath("/admin/fees");
  revalidatePath("/mypage");
  redirect("/admin/fees?saved=1");
}

async function saveFeeRatesAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  const types = formData.getAll("feeType").map(String);
  const capacities = formData.getAll("feeCapacity").map(String);
  const amounts = formData.getAll("feeAmount").map((v) => Number(v));
  const rates = types.map((type, i) => ({
    type,
    capacity: capacities[i] || "",
    annualFee: amounts[i] || 0,
  }));
  await saveFeeRates(rates);
  revalidatePath("/admin/fees");
  revalidatePath("/lots/fees");
  redirect("/admin/fees?rates=1");
}

async function saveSaleRatesAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  const types = formData.getAll("feeType").map(String);
  const capacities = formData.getAll("feeCapacity").map(String);
  const amounts = formData.getAll("saleAmount").map((v) => Number(v));
  const rates = types.map((type, i) => ({
    type,
    capacity: capacities[i] || "",
    annualFee: amounts[i] || 0,
  }));
  await saveSaleRates(rates);
  revalidatePath("/admin/fees");
  revalidatePath("/lots/fees");
  redirect("/admin/fees?sale=1");
}

async function loadChargesAction(memberId: string) {
  "use server";
  await guardAdminPage("/admin/fees");
  await syncMemberChargesFromLegacy(memberId);
  return listMemberCharges(memberId);
}

async function addChargeAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  const memberId = String(formData.get("memberId"));
  await createMemberCharge({
    memberId,
    chargeType: String(formData.get("chargeType")) as ChargeType,
    title: String(formData.get("title") || ""),
    amount: Number(formData.get("amount") || 0),
    paidAmount: Number(formData.get("paidAmount") || 0),
    status: String(formData.get("status") || "pending") as ChargeStatus,
    periodYear: String(formData.get("periodYear") || ""),
    memo: String(formData.get("memo") || ""),
    source: "manual",
  });
  revalidatePath("/mypage");
}

async function updateChargeAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  await updateMemberCharge(String(formData.get("id")), {
    chargeType: String(formData.get("chargeType")) as ChargeType,
    title: String(formData.get("title") || ""),
    amount: Number(formData.get("amount") || 0),
    paidAmount: Number(formData.get("paidAmount") || 0),
    status: String(formData.get("status") || "pending") as ChargeStatus,
    periodYear: String(formData.get("periodYear") || ""),
    memo: String(formData.get("memo") || ""),
  });
  revalidatePath("/mypage");
}

async function deleteChargeAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  await deleteMemberCharge(String(formData.get("id")));
  revalidatePath("/mypage");
}

async function syncChargesAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/fees");
  await syncMemberChargesFromLegacy(String(formData.get("memberId")));
  revalidatePath("/mypage");
}

export default async function AdminFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; rates?: string; sale?: string }>;
}) {
  await guardAdminPage("/admin/fees");
  const { saved, rates: ratesSaved, sale: saleSaved } = await searchParams;
  const [feeRates, saleRates] = await Promise.all([getFeeRatesMerged(), getSaleRatesMerged()]);

  const members = (await listMembers()).map((m) => ({
    id: toId(m._id),
    username: String(m.username || ""),
    name: String(m.name || ""),
    phone: String(m.phone || ""),
    plotNo: String(m.plotNo || ""),
    annualFee: Number(m.annualFee || 0),
    salePrice: Number(m.salePrice || 0),
    feeStatus: String(m.feeStatus || "미납"),
    feeHistory: ((m.feeHistory as FeeRecord[] | undefined) || []).slice(),
  }));

  return (
    <article className="article admin-fees-page">
      <p className="kicker">관리자</p>
      <h1>관리비·요금표</h1>
      <p className="lead">
        요금표(마스터)와 회원별 <strong>비용 원장</strong>(분양·연관리·추모·기타)을 관리합니다.
      </p>
      {saved && <p className="ok">회원 관리비 정보가 저장되었습니다.</p>}
      {ratesSaved && <p className="ok">연간 관리비 요금표가 저장되었습니다.</p>}
      {saleSaved && <p className="ok">분양가 요금표가 저장되었습니다.</p>}

      <AdminFeeRatesPanel
        annualRates={feeRates}
        saleRates={saleRates}
        saveFeeRatesAction={saveFeeRatesAction}
        saveSaleRatesAction={saveSaleRatesAction}
      />

      <AdminFeesClient
        members={members}
        updateFeeAction={updateFeeAction}
        loadChargesAction={loadChargesAction}
        addChargeAction={addChargeAction}
        updateChargeAction={updateChargeAction}
        deleteChargeAction={deleteChargeAction}
        syncChargesAction={syncChargesAction}
      />
    </article>
  );
}
