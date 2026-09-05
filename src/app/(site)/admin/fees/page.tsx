import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdminPage } from "../../../../lib/auth";
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
        분양가·연관리비 요금표(마스터)와 회원별 실제 청구·납부 내역을 관리합니다. 상담·회원가입·공개 안내에 동일 요금표가 사용됩니다.
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

      <AdminFeesClient members={members} updateFeeAction={updateFeeAction} />
    </article>
  );
}
