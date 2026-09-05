import Link from "next/link";
import { guardAdminPage } from "../../../../lib/auth";
import { listMembers, toId } from "../../../../lib/store";
import type { FeeRecord } from "../../../../lib/store";
import { AdminFeesClient } from "./AdminFeesClient";
import {
  addChargeAction,
  deleteChargeAction,
  loadChargesAction,
  syncChargesAction,
  updateChargeAction,
  updateFeeAction,
} from "./actions";

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
    salePrice: Number(m.salePrice || 0),
    feeStatus: String(m.feeStatus || "미납"),
    feeHistory: ((m.feeHistory as FeeRecord[] | undefined) || []).slice(),
  }));

  return (
    <article className="article admin-fees-page">
      <p className="kicker">관리자</p>
      <h1>관리비 현황</h1>
      <p className="lead">
        회원별 납부 상태와 <strong>비용 원장</strong>(분양·연관리·추모·기타)을 관리합니다.
      </p>
      {saved && <p className="ok">회원 관리비 정보가 저장되었습니다.</p>}

      <p className="meta admin-fee-crosslinks">
        <Link href="/admin/fees/sale-rates">분양가 요금표</Link>
        {" · "}
        <Link href="/admin/fees/annual-rates">연간 관리비 요금표</Link>
      </p>

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
