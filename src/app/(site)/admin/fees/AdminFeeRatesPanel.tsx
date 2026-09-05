"use client";

import { useState } from "react";
import type { FeeRateRow } from "../../../../lib/fee-rates";

type Props = {
  annualRates: FeeRateRow[];
  saleRates: FeeRateRow[];
  saveFeeRatesAction: (formData: FormData) => Promise<void>;
  saveSaleRatesAction: (formData: FormData) => Promise<void>;
};

function RateTable({
  rates,
  amountField,
  amountLabel,
}: {
  rates: FeeRateRow[];
  amountField: string;
  amountLabel: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table admin-fee-rates-table">
        <thead>
          <tr>
            <th>분양 형태</th>
            <th>기수·규모</th>
            <th>{amountLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((row) => (
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
                  name={amountField}
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={row.annualFee}
                  aria-label={`${row.type} ${row.capacity} ${amountLabel}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminFeeRatesPanel({
  annualRates,
  saleRates,
  saveFeeRatesAction,
  saveSaleRatesAction,
}: Props) {
  const [openAnnual, setOpenAnnual] = useState(false);
  const [openSale, setOpenSale] = useState(false);

  return (
    <section className="admin-price-tables">
      <div className="panel admin-fee-rates">
        <div className="admin-fee-rates-head">
          <div>
            <h2>연간 관리비 요금표</h2>
            <p className="meta">회원가입·관리비 현황·상담 참고용 (임시 금액)</p>
          </div>
          <button type="button" className="btn btn-sm" onClick={() => setOpenAnnual((v) => !v)}>
            {openAnnual ? "접기" : "편집"}
          </button>
        </div>
        {openAnnual && (
          <form action={saveFeeRatesAction} className="admin-fee-rates-form">
            <RateTable rates={annualRates} amountField="feeAmount" amountLabel="연간 관리비 (원)" />
            <div className="admin-fee-rates-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                연관리비 저장
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="panel admin-fee-rates">
        <div className="admin-fee-rates-head">
          <div>
            <h2>분양가 요금표</h2>
            <p className="meta">상담·분양 안내 참고용 (1회 분양가, 임시 금액)</p>
          </div>
          <button type="button" className="btn btn-sm" onClick={() => setOpenSale((v) => !v)}>
            {openSale ? "접기" : "편집"}
          </button>
        </div>
        {openSale && (
          <form action={saveSaleRatesAction} className="admin-fee-rates-form">
            <RateTable rates={saleRates} amountField="saleAmount" amountLabel="분양가 (원)" />
            <div className="admin-fee-rates-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                분양가 저장
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
