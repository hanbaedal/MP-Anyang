import {
  CHARGE_STATUS_LABELS,
  CHARGE_TYPE_LABELS,
  chargeSummary,
  groupChargesByType,
  type MemberChargeRow,
} from "../lib/member-charges-types";

type Props = {
  charges: MemberChargeRow[];
};

function statusClass(status: string) {
  if (status === "paid") return "charge-status-paid";
  if (status === "partial") return "charge-status-partial";
  if (status === "cancelled") return "charge-status-cancelled";
  return "charge-status-pending";
}

export function MemberChargesView({ charges }: Props) {
  const summary = chargeSummary(charges);
  const groups = groupChargesByType(charges);

  return (
    <>
      <div className="member-cost-grid">
        {(Object.keys(CHARGE_TYPE_LABELS) as Array<keyof typeof CHARGE_TYPE_LABELS>).map((type) => {
          const s = summary[type];
          return (
            <div key={type} className="member-cost-item">
              <h3>{CHARGE_TYPE_LABELS[type]}</h3>
              {s.count === 0 ? (
                <p className="meta">등록된 내역 없음</p>
              ) : (
                <>
                  <p className="member-cost-amount">{s.total.toLocaleString()}원</p>
                  <p className="meta">
                    납부 {s.paid.toLocaleString()}원 · 잔액 {s.balance.toLocaleString()}원
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {charges.length > 0 && (
        <div className="table-wrap member-charges-table-wrap">
          <table className="data-table member-charges-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>항목</th>
                <th>금액</th>
                <th>납부</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(groups) as Array<keyof typeof groups>).flatMap((type) =>
                groups[type].map((row) => (
                  <tr key={row.id}>
                    <td>{CHARGE_TYPE_LABELS[row.chargeType]}</td>
                    <td>{row.title}</td>
                    <td>{row.amount.toLocaleString()}원</td>
                    <td>{row.paidAmount.toLocaleString()}원</td>
                    <td>
                      <span className={`charge-status ${statusClass(row.status)}`}>
                        {CHARGE_STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="meta">{row.memo || row.periodYear || "—"}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
