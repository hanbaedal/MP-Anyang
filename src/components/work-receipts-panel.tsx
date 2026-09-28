"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildStatementPair, RECEIPT_PRINT_MAX } from "@/lib/receipt-statement";
import { TransactionStatementPage, TransactionStatementPrintRoot } from "@/components/transaction-statement-sheet";
import type { ContractCopy, FeeCopy } from "@/lib/cemetery-parse";
import { feeKey } from "@/lib/work-status";

export type ReceiptListRow = {
  id: string;
  billedOn: string;
  tombNo: string;
  userName: string;
  period: string;
  paidAmount: number;
  status: string;
};

function toListRow(fee: FeeCopy): ReceiptListRow {
  return {
    id: feeKey(fee),
    billedOn: fee.billedOn,
    tombNo: fee.tombNo,
    userName: fee.userName,
    period: fee.period,
    paidAmount: fee.paidAmount,
    status: fee.status,
  };
}

export function WorkReceiptsPanel({
  fees,
  contracts,
}: {
  fees: FeeCopy[];
  contracts: ContractCopy[];
}) {
  const rows = useMemo(() => fees.map(toListRow), [fees]);
  const feeById = useMemo(() => new Map(fees.map((f) => [feeKey(f), f])), [fees]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === rows.length) return new Set();
      return new Set(rows.map((r) => r.id));
    });
  }, [rows]);

  const selectedFees = useMemo(() => {
    const ids = selected.size > 0 ? [...selected] : [];
    return ids.map((id) => feeById.get(id)).filter(Boolean) as FeeCopy[];
  }, [selected, feeById]);

  const printFees = useMemo(() => {
    const list = selected.size > 0 ? selectedFees : fees;
    return list.slice(0, RECEIPT_PRINT_MAX);
  }, [selected.size, selectedFees, fees]);

  const previewPair = useMemo(() => {
    if (!previewId) return null;
    const fee = feeById.get(previewId);
    if (!fee) return null;
    return buildStatementPair(fee, contracts, 0);
  }, [previewId, feeById, contracts]);

  const printPages = useMemo(
    () => printFees.map((fee, i) => buildStatementPair(fee, contracts, i)),
    [printFees, contracts],
  );

  function runPrint() {
    if (!printFees.length) return;
    window.print();
  }

  const selectedAmount = selectedFees.reduce((s, f) => s + (f.paidAmount > 0 ? f.paidAmount : f.billedAmount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="default" disabled={!printFees.length} onClick={runPrint}>
          {selected.size > 0 ? `선택 ${selected.size}건 출력 / PDF` : `조회 결과 전체 ${printFees.length}건 출력 / PDF`}
        </Button>
        <p className="text-xs text-muted-foreground">
          {selected.size > 0
            ? `선택 ${selected.size}건 · ${selectedAmount.toLocaleString("ko-KR")}원`
            : `체크 없으면 조회 결과 최대 ${RECEIPT_PRINT_MAX}건`}
          {fees.length > RECEIPT_PRINT_MAX && selected.size === 0 ? " — 범위를 좁혀 주세요." : null}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-2 py-2">
                <input
                  type="checkbox"
                  aria-label="전체 선택"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2 font-medium">청구일자</th>
              <th className="px-3 py-2 font-medium">묘지번호</th>
              <th className="px-3 py-2 font-medium">사용자</th>
              <th className="px-3 py-2 font-medium">적용기간</th>
              <th className="px-3 py-2 text-right font-medium">납부금액</th>
              <th className="px-3 py-2 font-medium">구분</th>
              <th className="px-3 py-2 font-medium">미리보기</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                <td className="px-2 py-2">
                  <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} aria-label={`${row.tombNo} 선택`} />
                </td>
                <td className="px-3 py-2">{row.billedOn || "—"}</td>
                <td className="px-3 py-2">{row.tombNo || "—"}</td>
                <td className="px-3 py-2">{row.userName || "—"}</td>
                <td className="px-3 py-2">{row.period || "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.paidAmount.toLocaleString("ko-KR")}</td>
                <td className="px-3 py-2">{row.status || "—"}</td>
                <td className="px-3 py-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setPreviewId(row.id)}>
                    보기
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewPair ? (
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">거래명세서 미리보기</h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPreviewId(null)}>
              닫기
            </Button>
          </div>
          <div className="overflow-x-auto">
            <TransactionStatementPage company={previewPair.company} customer={previewPair.customer} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">출력 시 가로(A4) · 왼쪽 회사용 · 오른쪽 고객용 · PDF는 인쇄 대화상자에서 「PDF로 저장」</p>
        </section>
      ) : null}

      <TransactionStatementPrintRoot>
        {printPages.map((page, i) => (
          <div key={i} className="receipt-print-page break-after-page">
            <TransactionStatementPage company={page.company} customer={page.customer} />
          </div>
        ))}
      </TransactionStatementPrintRoot>
    </div>
  );
}
