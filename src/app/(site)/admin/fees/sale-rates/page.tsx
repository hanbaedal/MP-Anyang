import Link from "next/link";
import { guardAdminPage } from "../../../../../lib/auth";
import { getSaleRatesMerged } from "../../../../../lib/store";
import { AdminRateTableForm } from "../AdminRateTableForm";
import { saveSaleRatesAction } from "../actions";

export default async function AdminSaleRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await guardAdminPage("/admin/fees/sale-rates");
  const { saved } = await searchParams;
  const saleRates = await getSaleRatesMerged();

  return (
    <article className="article admin-fees-page">
      <p className="kicker">관리자</p>
      <h1>분양가 요금표</h1>
      <p className="lead">
        형태·기수별 <strong>1회 분양가</strong> 기준표입니다. 상담·회원 원장(분양) 생성 시 참고됩니다.
      </p>
      {saved && <p className="ok">분양가 요금표가 저장되었습니다.</p>}

      <AdminRateTableForm
        title="분양가 (원)"
        description="묘역번호 조회 시 요금표 → 묘역 개별 금액 순으로 적용됩니다."
        rates={saleRates}
        amountField="saleAmount"
        amountLabel="분양가 (원)"
        submitLabel="분양가 저장"
        saveAction={saveSaleRatesAction}
      />

      <p className="meta admin-fee-crosslinks">
        <Link href="/admin/fees/annual-rates">연간 관리비 요금표</Link>
        {" · "}
        <Link href="/admin/fees">관리비 현황</Link>
        {" · "}
        <Link href="/lots/fees">공개 요금 안내</Link>
      </p>
    </article>
  );
}
