"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  /** 인쇄 대화상자용 — 체크 선택과 분리(모달에서 1건 출력 등) */
  const [printQueue, setPrintQueue] = useState<FeeCopy[] | null>(null);

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

  const feesForPrint = printQueue ?? printFees;

  const printPages = useMemo(
    () => feesForPrint.map((fee, i) => buildStatementPair(fee, contracts, i)),
    [feesForPrint, contracts],
  );

  useEffect(() => {
    const clear = () => setPrintQueue(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);

  const triggerPrint = useCallback((list: FeeCopy[]) => {
    if (!list.length) return;
    flushSync(() => setPrintQueue(list));
    requestAnimationFrame(() => window.print());
  }, []);

  function runPrint() {
    triggerPrint(printFees);
  }

  function printPreviewFee() {
    if (!previewId) return;
    const fee = feeById.get(previewId);
    if (!fee) return;
    triggerPrint([fee]);
  }

  const selectedAmount = selectedFees.reduce((s, f) => s + (f.paidAmount > 0 ? f.paidAmount : f.billedAmount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="default" disabled={!printFees.length} onClick={runPrint}>
          {selected.size > 0 ? `선택 ${selected.size}건 출력` : `조회 결과 전체 ${printFees.length}건 출력`}
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

      <Dialog open={previewId !== null} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent
          className="flex max-h-[min(92vh,900px)] max-w-[min(96vw,920px)] flex-col gap-3 overflow-hidden p-4 sm:p-5"
          showCloseButton
        >
          <DialogHeader className="shrink-0 gap-1 pr-8">
            <DialogTitle className="text-base">거래명세서 미리보기</DialogTitle>
            <DialogDescription>가로(A4) · 왼쪽 회사용 · 오른쪽 고객용</DialogDescription>
          </DialogHeader>
          {previewPair ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-white p-2">
              <div className="mx-auto w-max origin-top scale-[0.42] sm:scale-[0.52] md:scale-[0.58] lg:scale-[0.65]">
                <TransactionStatementPage company={previewPair.company} customer={previewPair.customer} />
              </div>
            </div>
          ) : null}
          <div className="flex shrink-0 justify-end gap-2 border-t pt-3">
            <Button type="button" size="sm" variant="outline" onClick={() => setPreviewId(null)}>
              닫기
            </Button>
            <Button type="button" size="sm" variant="default" disabled={!previewPair} onClick={printPreviewFee}>
              출력
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
