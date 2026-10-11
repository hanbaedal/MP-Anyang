"use client";

import { useState } from "react";
import type { ReceiptCopy } from "@/lib/cemetery-parse";

const KINDS = ["전체", "관리비", "계약비", "시설비", "공사비"];

function value(inputs: Record<string, string> | undefined, key: string) {
  return inputs?.[key]?.trim() ?? "";
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <>
      <div className="flex items-center bg-[#e8f2fb] px-1 text-[11px] text-slate-700">{label}</div>
      <input readOnly value={text} className="h-6 w-full border border-[#b7c6d6] bg-white px-1 text-xs" />
    </>
  );
}

function ReceiptModal({ row, onClose }: { row: ReceiptCopy; onClose: () => void }) {
  const inputs = row.inputs ?? {};
  const lines = [1, 2, 3, 4, 5].map((n) => ({
    item: value(inputs, `item${n}`),
    spec: value(inputs, `type${n}`),
    qty: value(inputs, `qty${n}`),
    price: value(inputs, `price${n}`),
    amount: value(inputs, `amount${n}`),
  }));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="영수증내역"
        className="w-full max-w-4xl border border-[#7aa2c4] bg-[#f7fbfe] text-slate-800 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#7aa2c4] bg-[#d7ebfb] px-3 py-2">
          <h2 className="text-sm font-semibold">영수증내역</h2>
          <button type="button" onClick={onClose} className="h-7 bg-[#6b7280] px-3 text-xs text-white">
            닫기
          </button>
        </div>
        <div className="space-y-3 p-3 text-xs">
          <section className="border border-[#9db7d0]">
            <h3 className="border-b border-[#9db7d0] bg-[#d7ebfb] px-2 py-1 font-semibold">계약정보</h3>
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)] gap-1 p-2">
              <Field label="계약번호" text={value(inputs, "ex_no_contract")} />
              <Field label="묘지번호" text={value(inputs, "ex_no_tomb") || row.tombNo} />
              <Field label="계약자명" text={value(inputs, "nm_con")} />
              <Field label="연락처" text={value(inputs, "tel_con")} />
              <Field label="우편번호" text={value(inputs, "zip_code_con")} />
              <Field label="주소" text={value(inputs, "addr_con")} />
              <Field label="상세주소" text={value(inputs, "addr1_con")} />
              <div />
            </div>
          </section>
          <section className="border border-[#9db7d0]">
            <h3 className="border-b border-[#9db7d0] bg-[#d7ebfb] px-2 py-1 font-semibold">영수증</h3>
            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_7rem_minmax(0,1fr)] gap-1 p-2">
              <Field label="시설명" text={value(inputs, "nm_company")} />
              <Field label="사업자등록번호" text={value(inputs, "busi_no")} />
              <Field label="소재지" text={value(inputs, "addr")} />
              <div />
              <Field label="대표자성명" text={value(inputs, "nm_rep")} />
              <Field label="사업장전화번호" text={value(inputs, "tel")} />
              <Field label="고인성명" text={value(inputs, "nm_death") || row.deceased} />
              <Field label="연고자성명" text={value(inputs, "nm_family")} />
              <Field label="매장년월일" text={value(inputs, "dt_burial")} />
              <Field label="묘지번호" text={value(inputs, "no_tomb") || row.tombNo} />
              <Field label="평수" text={value(inputs, "pyeong")} />
              <Field label="담당자" text={value(inputs, "id_insert") || row.staff} />
              <Field label="거래년월일" text={value(inputs, "dt_receipt") || row.date} />
              <Field label="거래금액" text={value(inputs, "total_amt") || row.amount.toLocaleString("ko-KR")} />
            </div>
            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_6rem] gap-1 px-2 pb-2">
              <div className="bg-[#f6e27a] px-1 py-1 text-center">관리기간</div>
              <div />
              <div className="bg-[#f6e27a] px-1 py-1 text-center">금액</div>
              <div className="flex items-center bg-[#e8f2fb] px-1">관리비1</div>
              <input readOnly value={value(inputs, "cont1")} className="h-6 border border-[#b7c6d6] bg-white px-1" />
              <input readOnly value={value(inputs, "amt1")} className="h-6 border border-[#b7c6d6] bg-white px-1 text-right" />
              <div className="flex items-center bg-[#e8f2fb] px-1">관리비2</div>
              <input readOnly value={value(inputs, "cont2")} className="h-6 border border-[#b7c6d6] bg-white px-1" />
              <input readOnly value={value(inputs, "amt2")} className="h-6 border border-[#b7c6d6] bg-white px-1 text-right" />
              <div className="flex items-center bg-[#e8f2fb] px-1">산역비</div>
              <input readOnly value={value(inputs, "cont3")} className="h-6 border border-[#b7c6d6] bg-white px-1" />
              <input readOnly value={value(inputs, "amt3")} className="h-6 border border-[#b7c6d6] bg-white px-1 text-right" />
            </div>
            <div className="px-2 pb-2">
              <div className="mb-1">시설물 (기타)</div>
              <table className="w-full border-collapse">
                <thead className="bg-[#f6e27a]">
                  <tr>
                    {["품목", "규격", "수량", "단가", "금액"].map((header) => (
                      <th key={header} className="border border-[#e4d27a] px-1 py-1 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      {[line.item, line.spec, line.qty, line.price, line.amount].map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-[#e2e8f0] px-1 py-0.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function SupervisorReceiptList({
  action,
  from,
  to,
  tomb,
  kind,
  rows,
}: {
  action: string;
  from: string;
  to: string;
  tomb: string;
  kind: string;
  rows: ReceiptCopy[];
}) {
  const [open, setOpen] = useState<ReceiptCopy | null>(null);
  return (
    <div className="mx-auto max-w-[90rem] space-y-3 px-3 py-4 pb-16 text-slate-800">
      <h1 className="font-serif text-xl text-primary">영수증관리</h1>
      <form action={action} className="flex flex-wrap items-end gap-2 rounded border border-[#9db7d0] bg-[#f4f8fc] px-2 py-2">
        <label className="text-[11px] text-slate-600">
          거래년월일
          <span className="mt-0.5 flex items-center gap-1">
            <input type="date" name="from" defaultValue={from} className="h-7 border border-[#b7c6d6] bg-white px-1 text-xs" />
            <span>~</span>
            <input type="date" name="to" defaultValue={to} className="h-7 border border-[#b7c6d6] bg-white px-1 text-xs" />
          </span>
        </label>
        <label className="text-[11px] text-slate-600">
          묘지번호
          <input name="tomb" defaultValue={tomb} className="mt-0.5 block h-7 w-28 border border-[#b7c6d6] bg-white px-2 text-xs" />
        </label>
        <label className="text-[11px] text-slate-600">
          영수증종류
          <select name="kind" defaultValue={kind} className="mt-0.5 block h-7 border border-[#b7c6d6] bg-white px-1 text-xs">
            {KINDS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-7 bg-[#6b7280] px-3 text-xs text-white">
          검색
        </button>
        <a href={action} className="inline-flex h-7 items-center bg-[#6b7280] px-3 text-xs text-white">
          초기화
        </a>
        <span className="px-1 pb-1 text-[11px] text-slate-500">{rows.length.toLocaleString("ko-KR")}건</span>
      </form>
      <div className="overflow-x-auto border border-[#9db7d0]">
        <table className="w-full min-w-[40rem] border-collapse text-xs">
          <thead className="bg-[#d7ebfb]">
            <tr>
              {["거래년월일", "묘지번호", "고인성명", "일련번호", "거래금액"].map((header) => (
                <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={`${row.date}-${row.serial}`} className="odd:bg-white even:bg-slate-50">
                  {[row.date, row.tombNo, row.deceased].map((text, index) => (
                    <td key={["date", "tomb", "name"][index]} className="border border-[#d5e0ea] px-1 py-0.5">
                      <button type="button" className="text-[#1d4f91] underline-offset-2 hover:underline" onClick={() => setOpen(row)}>
                        {text || " "}
                      </button>
                    </td>
                  ))}
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{row.serial}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{row.amount.toLocaleString("ko-KR")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border px-2 py-8 text-center text-slate-500">
                  조건에 맞는 영수증이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {open ? <ReceiptModal row={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
