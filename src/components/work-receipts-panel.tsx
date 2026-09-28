"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildStatementPair, RECEIPT_PRINT_MAX } from "@/lib/receipt-statement";
import {
  STATEMENT_SHEET_ASPECT,
  TransactionStatementPreview,
} from "@/components/transaction-statement-preview";
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

type StatementPair = ReturnType<typeof buildStatementPair>;

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

async function fetchSerials(count: number): Promise<string[]> {
  const res = await fetch("/api/work/statement-serial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
  const json = (await res.json()) as { ok?: boolean; serials?: string[]; error?: string };
  if (!res.ok || !json.ok || !json.serials?.length) {
    throw new Error(json.error || "일련번호를 발급하지 못했습니다.");
  }
  return json.serials;
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
  const [previewPair, setPreviewPair] = useState<StatementPair | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [serialByFeeId, setSerialByFeeId] = useState<Map<string, string>>(() => new Map());
  const [printPages, setPrintPages] = useState<StatementPair[]>([]);

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

  const ensureSerialMap = useCallback(
    async (list: FeeCopy[]) => {
      const missing = list.filter((f) => !serialByFeeId.has(feeKey(f)));
      if (!missing.length) return new Map(serialByFeeId);
      const serials = await fetchSerials(missing.length);
      const next = new Map(serialByFeeId);
      missing.forEach((f, i) => next.set(feeKey(f), serials[i] ?? serials[0]));
      setSerialByFeeId(next);
      return next;
    },
    [serialByFeeId],
  );

  const buildPages = useCallback(
    (list: FeeCopy[], serialMap: Map<string, string>) =>
      list.map((fee) => buildStatementPair(fee, contracts, serialMap.get(feeKey(fee)) ?? "000000000")),
    [contracts],
  );

  useEffect(() => {
    const clear = () => setPrintPages([]);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);

  const triggerPrint = useCallback(
    async (list: FeeCopy[]) => {
      if (!list.length) return;
      try {
        const serialMap = await ensureSerialMap(list);
        const pages = buildPages(list, serialMap);
        flushSync(() => setPrintPages(pages));
        requestAnimationFrame(() => window.print());
      } catch {
        window.alert("일련번호 발급 또는 출력 준비에 실패했습니다.");
      }
    },
    [buildPages, ensureSerialMap],
  );

  async function openPreview(id: string) {
    setPreviewId(id);
    setPreviewPair(null);
    setPreviewLoading(true);
    try {
      const fee = feeById.get(id);
      if (!fee) return;
      const serialMap = await ensureSerialMap([fee]);
      setPreviewPair(buildStatementPair(fee, contracts, serialMap.get(id)!));
    } catch {
      window.alert("일련번호를 발급하지 못했습니다.");
      setPreviewId(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewId(null);
    setPreviewPair(null);
  }

  function runPrint() {
    void triggerPrint(printFees);
  }

  function printPreviewFee() {
    if (!previewId) return;
    const fee = feeById.get(previewId);
    if (!fee) return;
    if (previewPair) {
      flushSync(() => setPrintPages([previewPair]));
      requestAnimationFrame(() => window.print());
      return;
    }
    void triggerPrint([fee]);
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
                  <Button type="button" size="sm" variant="outline" onClick={() => void openPreview(row.id)}>
                    보기
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={previewId !== null} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent
          className="flex h-[min(96vh,920px)] max-h-[96vh] flex-col gap-2 overflow-hidden p-2 sm:p-3"
          style={{
            width: `min(98vw, calc((min(96vh, 920px) - 7.5rem) * ${STATEMENT_SHEET_ASPECT} + 1.5rem))`,
            maxWidth: "98vw",
          }}
          showCloseButton
        >
          <DialogHeader className="shrink-0 gap-0.5 pr-8">
            <DialogTitle className="text-base">거래명세서 미리보기</DialogTitle>
            <DialogDescription className="text-xs">
              A4 가로 · 왼쪽 회사용 · 오른쪽 고객용 · 일련번호 {previewPair?.company.serial ?? "…"} (발급일 KST)
            </DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <p className="flex min-h-0 flex-1 basis-0 items-center justify-center text-sm text-muted-foreground">
              일련번호 발급 중…
            </p>
          ) : previewPair ? (
            <div className="min-h-0 flex-1 basis-0 overflow-hidden rounded-md bg-muted/30">
              <TransactionStatementPreview company={previewPair.company} customer={previewPair.customer} />
            </div>
          ) : null}
          <div className="flex shrink-0 justify-end gap-2 border-t pt-3">
            <Button type="button" size="sm" variant="outline" onClick={closePreview}>
              닫기
            </Button>
            <Button type="button" size="sm" variant="default" disabled={!previewPair || previewLoading} onClick={printPreviewFee}>
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
