"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { StatementPayload } from "@/lib/receipt-statement";
import { TransactionStatementPage } from "@/components/transaction-statement-sheet";

/** 인쇄·미리보기 공통 — A4 가로 용지(여백 반영) */
export const STATEMENT_SHEET_W_MM = 277;
export const STATEMENT_SHEET_H_MM = 190;
export const STATEMENT_SHEET_ASPECT = STATEMENT_SHEET_W_MM / STATEMENT_SHEET_H_MM;

const MM_TO_PX = 96 / 25.4;
const FULL_W_PX = STATEMENT_SHEET_W_MM * MM_TO_PX;
const FULL_H_PX = STATEMENT_SHEET_H_MM * MM_TO_PX;

function computeLayout(availW: number, availH: number) {
  const pad = 8;
  const w = Math.max(0, availW - pad);
  const h = Math.max(0, availH - pad);
  const scale = Math.min(w / FULL_W_PX, h / FULL_H_PX);
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 0.45;
  return {
    widthPx: FULL_W_PX * safeScale,
    heightPx: FULL_H_PX * safeScale,
    scale: safeScale,
  };
}

function initialLayout() {
  if (typeof window === "undefined") {
    return computeLayout(FULL_W_PX, FULL_H_PX);
  }
  return computeLayout(window.innerWidth * 0.94, window.innerHeight * 0.62);
}

type Props = {
  company: StatementPayload;
  customer: StatementPayload;
};

/** 가용 영역 안에 A4 가로 양식 전체(회사·고객)가 들어가도록 contain 스케일 */
export function TransactionStatementPreview({ company, customer }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(initialLayout);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fit = () => {
      let availW = el.clientWidth;
      let availH = el.clientHeight;
      if (availH < 80) {
        const parent = el.parentElement;
        if (parent) {
          availW = parent.clientWidth || availW;
          availH = parent.clientHeight || availH;
        }
      }
      if (availW < 40 && availH < 40) return;
      setLayout(computeLayout(availW, availH));
    };

    fit();
    const raf = requestAnimationFrame(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const parent = el.parentElement;
    if (parent) ro.observe(parent);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [company.serial, customer.serial]);

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-[240px] w-full items-center justify-center py-1"
    >
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
    </div>
  );
}
