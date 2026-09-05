"use client";

import { useState } from "react";
import type { FeeRateRow } from "../../../../lib/fee-rates";

type Props = {
  rates: FeeRateRow[];
  saveFeeRatesAction: (formData: FormData) => Promise<void>;
};

export function AdminFeeRatesPanel({ rates, saveFeeRatesAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel admin-fee-rates">
      <div className="admin-fee-rates-head">
        <div>
          <h2>묘역 형태별 요금표</h2>
          <p className="meta">회원가입·묘역 조회 시 연간 관리비가 자동 적용됩니다. 묘역별 개별 금액은 묘역 관리에서 지정할 수 있습니다.</p>
        </div>
        <button type="button" className="btn btn-sm" onClick={() => setOpen((v) => !v)}>
          {open ? "접기" : "요금표 편집"}
        </button>
      </div>

      {open && (
        <form action={saveFeeRatesAction} className="admin-fee-rates-form">
          <div className="table-wrap">
            <table className="data-table admin-fee-rates-table">
              <thead>
                <tr>
                  <th>분양 형태</th>
                  <th>기수·규모</th>
                  <th>연간 관리비 (원)</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((row, i) => (
                  <tr key={`${row.type}-${row.capacity}`}>
                    <td>
                      {row.type}
                      <input type="hidden" name="feeType" value={row.type} />
                    </td>
                    <td>
                      {row.capacity}
                      <input type="hidden" name="feeCapacity" value={row.capacity} />
                    </td>
                    <td>
                      <input
                        name="feeAmount"
                        type="number"
                        min="0"
                        step="1000"
                        defaultValue={row.annualFee}
                        aria-label={`${row.type} ${row.capacity} 연간 관리비`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-fee-rates-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              요금표 저장
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
