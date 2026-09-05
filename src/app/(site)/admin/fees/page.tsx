import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdminPage } from "../../../../lib/auth";
import { listMembers, toId, updateMember } from "../../../../lib/store";
import type { FeeRecord } from "../../../../lib/store";
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
    feeHistory: parseFeeHistory(formData),
  });
  revalidatePath("/admin/fees");
  revalidatePath("/mypage");
  redirect("/admin/fees?saved=1");
}

export default async function AdminFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await guardAdminPage("/admin/fees");
  const { saved } = await searchParams;

  const members = (await listMembers()).map((m) => ({
    id: toId(m._id),
    username: String(m.username || ""),
    name: String(m.name || ""),
    phone: String(m.phone || ""),
    plotNo: String(m.plotNo || ""),
    annualFee: Number(m.annualFee || 0),
    feeStatus: String(m.feeStatus || "미납"),
    feeHistory: ((m.feeHistory as FeeRecord[] | undefined) || []).slice(),
  }));

  return (
    <article className="article admin-fees-page">
      <p className="kicker">관리자</p>
      <h1>관리비 현황</h1>
      <p className="lead">회원별 연간 관리비·납부 상태·연도별 내역을 등록합니다. 회원은 내 정보에서 조회합니다.</p>
      {saved && <p className="ok">관리비 정보가 저장되었습니다.</p>}

      <AdminFeesClient members={members} updateFeeAction={updateFeeAction} />
    </article>
  );
}
