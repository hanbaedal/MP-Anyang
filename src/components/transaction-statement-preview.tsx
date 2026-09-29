"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { StatementPayload } from "@/lib/receipt-statement";
import {
  STATEMENT_COPY_W_MM,
  TransactionStatementCopy,
  TransactionStatementPage,
} from "@/components/transaction-statement-sheet";

/** 인쇄·미리보기 공통 — A4 가로 용지(여백 반영) */
export const STATEMENT_SHEET_W_MM = 277;
export const STATEMENT_SHEET_H_MM = 190;
export const STATEMENT_SHEET_ASPECT = STATEMENT_SHEET_W_MM / STATEMENT_SHEET_H_MM;

const MM_TO_PX = 96 / 25.4;
const FULL_W_PX = STATEMENT_SHEET_W_MM * MM_TO_PX;
const FULL_H_PX = STATEMENT_SHEET_H_MM * MM_TO_PX;
const COPY_W_PX = STATEMENT_COPY_W_MM * MM_TO_PX;
const COPY_H_PX = STATEMENT_SHEET_H_MM * MM_TO_PX;
/** 양면을 한 장에 넣으면 글자가 너무 작아지는 폭 */
const STACK_BELOW_PX = 760;

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

function computeCopyLayout(availW: number) {
  const pad = 12;
  const w = Math.max(0, availW - pad);
  const scale = w / COPY_W_PX;
  const safeScale = Number.isFinite(scale) && scale > 0 ? Math.min(scale, 1.15) : 0.7;
  return {
    widthPx: COPY_W_PX * safeScale,
    heightPx: COPY_H_PX * safeScale,
    scale: safeScale,
  };
}

function initialStacked() {
  return typeof window !== "undefined" && window.innerWidth < STACK_BELOW_PX;
}

function initialLayout() {
  if (typeof window === "undefined") {
    return computeLayout(FULL_W_PX, FULL_H_PX);
  }
  if (initialStacked()) return computeCopyLayout(window.innerWidth * 0.94);
  return computeLayout(window.innerWidth * 0.94, window.innerHeight * 0.62);
}

type Props = {
  company: StatementPayload;
  customer: StatementPayload;
};

/** 가용 영역 안에 A4 가로 양식 전체(회사·고객)가 들어가도록 contain 스케일 */
export function TransactionStatementPreview({ company, customer }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(initialStacked);
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
      const narrow = availW < STACK_BELOW_PX;
      setStacked(narrow);
      setLayout(narrow ? computeCopyLayout(availW) : computeLayout(availW, availH));
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

  const scaledFrame = (child: ReactNode, label: string) => (
    <div
      className="shrink-0 overflow-hidden rounded-sm border border-neutral-400 bg-white shadow-md"
      style={{ width: layout.widthPx, height: layout.heightPx }}
      aria-label={label}
    >
      <div
        style={{
          transform: `scale(${layout.scale})`,
          transformOrigin: "top left",
          width: stacked ? `${STATEMENT_COPY_W_MM}mm` : `${STATEMENT_SHEET_W_MM}mm`,
          height: `${STATEMENT_SHEET_H_MM}mm`,
        }}
      >
        {child}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={
        stacked
          ? "h-full min-h-[240px] w-full overflow-x-hidden overflow-y-auto"
          : "flex h-full min-h-[240px] w-full items-center justify-center py-1"
      }
    >
      {stacked ? (
        <div className="flex flex-col items-center gap-3 py-2">
          {scaledFrame(<TransactionStatementCopy data={company} />, "회사용 거래명세서")}
          {scaledFrame(<TransactionStatementCopy data={customer} />, "고객용 거래명세서")}
        </div>
      ) : (
        scaledFrame(
          <TransactionStatementPage company={company} customer={customer} />,
          "A4 가로 거래명세서 미리보기",
        )
      )}
    </div>
  );
}
