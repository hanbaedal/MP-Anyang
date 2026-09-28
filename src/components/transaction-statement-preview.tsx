"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { StatementPayload } from "@/lib/receipt-statement";
import { TransactionStatementPage } from "@/components/transaction-statement-sheet";

/** 인쇄·미리보기 공통 — A4 가로 용지(여백 반영) */
export const STATEMENT_SHEET_W_MM = 277;
export const STATEMENT_SHEET_H_MM = 190;
export const STATEMENT_SHEET_ASPECT = STATEMENT_SHEET_W_MM / STATEMENT_SHEET_H_MM;

const MM_TO_PX = 96 / 25.4;

type Props = {
  company: StatementPayload;
  customer: StatementPayload;
};

/** 가용 영역 안에 A4 가로 양식 전체(회사·고객)가 들어가도록 contain 스케일 */
export function TransactionStatementPreview({ company, customer }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ widthPx: 0, heightPx: 0, scale: 0.4 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fit = () => {
      const pad = 8;
      const availW = Math.max(0, el.clientWidth - pad);
      const availH = Math.max(0, el.clientHeight - pad);
      if (availW < 40 || availH < 40) return;

      const fullW = STATEMENT_SHEET_W_MM * MM_TO_PX;
      const fullH = STATEMENT_SHEET_H_MM * MM_TO_PX;
      const scale = Math.min(availW / fullW, availH / fullH);

      setLayout({
        widthPx: fullW * scale,
        heightPx: fullH * scale,
        scale,
      });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full items-center justify-center">
      {layout.widthPx > 0 ? (
        <div
          className="shrink-0 overflow-hidden rounded-sm border border-neutral-400 bg-white shadow-md"
          style={{ width: layout.widthPx, height: layout.heightPx }}
          aria-label="A4 가로 거래명세서 미리보기"
        >
          <div
            style={{
              transform: `scale(${layout.scale})`,
              transformOrigin: "top left",
              width: `${STATEMENT_SHEET_W_MM}mm`,
              height: `${STATEMENT_SHEET_H_MM}mm`,
            }}
          >
            <TransactionStatementPage company={company} customer={customer} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
