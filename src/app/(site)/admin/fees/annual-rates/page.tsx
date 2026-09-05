import Link from "next/link";
import { guardAdminPage } from "../../../../../lib/auth";
import { getFeeRatesMerged } from "../../../../../lib/store";
import { AdminRateTableForm } from "../AdminRateTableForm";
import { saveFeeRatesAction } from "../actions";

export default async function AdminAnnualRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await guardAdminPage("/admin/fees/annual-rates");
  const { saved } = await searchParams;
  const annualRates = await getFeeRatesMerged();

  return (
    <article className="article admin-fees-page">
      <p className="kicker">관리자</p>
      <h1>연간 관리비 요금표</h1>
      <p className="lead">
        형태·기수별 <strong>연간 관리비</strong> 기준표입니다. 회원가입·관리비 현황·상담 견적에 반영됩니다.
      </p>
      {saved && <p className="ok">연간 관리비 요금표가 저장되었습니다.</p>}

      <AdminRateTableForm
        title="연간 관리비 (원)"
        description="묘역번호 조회 시 요금표 → 묘역 개별 금액 순으로 적용됩니다."
        rates={annualRates}
        amountField="feeAmount"
        amountLabel="연간 관리비 (원)"
        submitLabel="연간 관리비 저장"
        saveAction={saveFeeRatesAction}
      />

      <p className="meta admin-fee-crosslinks">
        <Link href="/admin/fees/sale-rates">분양가 요금표</Link>
        {" · "}
        <Link href="/admin/fees">관리비 현황</Link>
        {" · "}
        <Link href="/lots/fees">공개 요금 안내</Link>
      </p>
    </article>
  );
}
