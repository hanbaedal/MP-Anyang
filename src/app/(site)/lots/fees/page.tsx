import Link from "next/link";
import { getFeeRatesMerged, getSaleRatesMerged } from "../../../../lib/store";

export default async function LotFeesPage() {
  const [annualFees, salePrices] = await Promise.all([getFeeRatesMerged(), getSaleRatesMerged()]);

  return (
    <article className="article lot-fees-page">
      <p className="kicker">분양안내</p>
      <h1>분양가·연관리비 (참고)</h1>
      <p className="lead">
        묘역 형태·기수별 <strong>임시</strong> 요금표입니다. 정확한 금액은 상담 후 계약서로 확정됩니다.
      </p>
      <p className="meta">
        <Link href="/consult">상담신청</Link> 시 유형을 선택하면 아래 금액이 자동 표시됩니다.
      </p>

      <section className="panel lot-fees-section">
        <h2>분양가 (1회)</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>형태</th>
                <th>기수·규모</th>
                <th>분양가</th>
              </tr>
            </thead>
            <tbody>
              {salePrices.map((row) => (
                <tr key={`sale-${row.type}-${row.capacity}`}>
                  <td>{row.type}</td>
                  <td>{row.capacity}</td>
                  <td>{row.annualFee.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel lot-fees-section">
        <h2>연간 관리비</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>형태</th>
                <th>기수·규모</th>
                <th>연간 관리비</th>
              </tr>
            </thead>
            <tbody>
              {annualFees.map((row) => (
                <tr key={`annual-${row.type}-${row.capacity}`}>
                  <td>{row.type}</td>
                  <td>{row.capacity}</td>
                  <td>{row.annualFee.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel lot-fees-note">
        <h2>사이버 추모관·기타</h2>
        <p>
          사이버 추모관 연간권·상조·리모델링 등은{" "}
          <Link href="/memorial/plans">추모관 요금</Link> 및 <Link href="/consult">상담</Link>을 통해 안내됩니다.
        </p>
      </section>
    </article>
  );
}
