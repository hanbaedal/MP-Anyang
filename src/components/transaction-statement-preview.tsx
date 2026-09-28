"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { StatementPayload } from "@/lib/receipt-statement";
import { TransactionStatementPage } from "@/components/transaction-statement-sheet";

const SHEET_W_MM = 277;
const SHEET_H_MM = 190;
const MM_TO_PX = 96 / 25.4;

type Props = {
  company: StatementPayload;
  customer: StatementPayload;
};

/** 모달용 — transform scale + 바깥 박스 크기 맞춤으로 좌·우(회사/고객) 한 번에 표시 */
export function TransactionStatementPreview({ company, customer }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.34);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fit = () => {
      const pad = 8;
      const w = el.clientWidth - pad;
      const h = el.clientHeight - pad;
      if (w < 40 || h < 40) return;
      const fullW = SHEET_W_MM * MM_TO_PX;
      const fullH = SHEET_H_MM * MM_TO_PX;
      const next = Math.min(w / fullW, h / fullH, 0.48);
      setScale(Math.max(0.26, next));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const boxW = SHEET_W_MM * scale;
  const boxH = SHEET_H_MM * scale;

  return (
    <div ref={containerRef} className="flex h-full min-h-[200px] w-full items-center justify-center">
      <div
        className="shrink-0 overflow-hidden rounded-sm border border-neutral-300 bg-white shadow-sm"
        style={{ width: `${boxW}mm`, height: `${boxH}mm` }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${SHEET_W_MM}mm`,
            height: `${SHEET_H_MM}mm`,
          }}
        >
          <TransactionStatementPage company={company} customer={customer} />
        </div>
      </div>
    </div>
  );
}
