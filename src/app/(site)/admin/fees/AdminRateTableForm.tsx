"use client";

import type { FeeRateRow } from "../../../../lib/fee-rates";

type Props = {
  title: string;
  description: string;
  rates: FeeRateRow[];
  amountField: string;
  amountLabel: string;
  submitLabel: string;
  saveAction: (formData: FormData) => Promise<void>;
};

export function AdminRateTableForm({
  title,
  description,
  rates,
  amountField,
  amountLabel,
  submitLabel,
  saveAction,
}: Props) {
  return (
    <section className="panel admin-fee-rates admin-fee-rates-page">
      <div className="admin-fee-rates-head">
        <div>
          <h2>{title}</h2>
          <p className="meta">{description}</p>
        </div>
      </div>
      <form action={saveAction} className="admin-fee-rates-form">
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
        <div className="admin-fee-rates-actions">
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
