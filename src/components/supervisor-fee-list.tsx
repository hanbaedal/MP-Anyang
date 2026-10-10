"use client";

import { useState } from "react";

export type FeeLine = {
  billedOn: string;
  tombNo: string;
  userName: string;
  period: string;
  billed: string;
  paid: string;
  balance: string;
  dueDate: string;
  status: string;
  billedNum: number;
  paidNum: number;
  balanceNum: number;
};

export type FeeHit = FeeLine & { group: string };

const STATUSES = ["전체", "미납", "납부중", "보류", "완납"] as const;

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

function FeeModal({
  hit,
  rounds,
  onClose,
}: {
  hit: FeeHit;
  rounds: FeeLine[];
  onClose: () => void;
}) {
  const start = Math.max(
    0,
    rounds.findIndex(
      (row) =>
        row.billedOn === hit.billedOn &&
        row.tombNo === hit.tombNo &&
        row.period === hit.period &&
        row.dueDate === hit.dueDate &&
        row.status === hit.status,
    ),
  );
  const [picked, setPicked] = useState(start);
  const billedSum = rounds.reduce((sum, row) => sum + row.billedNum, 0);
  const paidSum = rounds.reduce((sum, row) => sum + row.paidNum, 0);
  const balanceSum = rounds.reduce((sum, row) => sum + row.balanceNum, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="관리비내역"
        className="w-full max-w-5xl border border-[#7aa2c4] bg-[#f7fbfe] text-slate-800 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#7aa2c4] bg-[#d7ebfb] px-3 py-2">
          <h2 className="text-sm font-semibold">관리비내역</h2>
          <button type="button" onClick={onClose} className="h-7 bg-[#6b7280] px-3 text-xs text-white">
            닫기
          </button>
        </div>
        <div className="space-y-3 p-3">
          <p className="text-xs text-slate-600">
            {hit.tombNo} · {hit.userName} · {hit.billedOn}
          </p>
          <div className="overflow-x-auto border border-[#9db7d0]">
            <table className="w-full min-w-[48rem] border-collapse text-xs">
              <thead className="bg-[#e8f2fb]">
                <tr>
                  {["청구회차", "사용자", "청구일자", "계약기간", "청구금액", "납부금액", "잔액", "납부구분", "납부기한"].map((header) => (
                    <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rounds.map((row, index) => (
                  <tr
                    key={`${row.billedOn}-${row.period}-${index}`}
                    className={index === picked ? "bg-[#fff4e5]" : "odd:bg-white even:bg-slate-50"}
                  >
                    <td className="border border-[#d5e0ea] px-1 py-0.5">
                      <button type="button" className="text-[#1d4f91] underline-offset-2 hover:underline" onClick={() => setPicked(index)}>
                        {index + 1}
                      </button>
                    </td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5">{row.userName}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5">{row.billedOn}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5">{row.period}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{row.billed}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{row.paid}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{row.balance}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5">{row.status}</td>
                    <td className="border border-[#d5e0ea] px-1 py-0.5">{row.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs">
            합계 청구금액 {won(billedSum)} · 납부금액 {won(paidSum)} · 잔액 {won(balanceSum)}
          </p>
          <div>
            <h3 className="mb-1 text-xs font-semibold">납부내역</h3>
            <div className="overflow-x-auto border border-[#9db7d0]">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-[#e8f2fb]">
                  <tr>
                    {["청구회차", "납부회차", "납부일자", "납부자", "납부금액"].map((header) => (
                      <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="border border-[#d5e0ea] px-2 py-4 text-center text-slate-500">
                      상단 리스트에서 원하시는 항목을 선택하세요.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupervisorFeeList({
  action,
  from,
  to,
  gubun,
  page,
  pages,
  total,
  hits,
  details,
}: {
  action: string;
  from: string;
  to: string;
  gubun: string;
  page: number;
  pages: number;
  total: number;
  hits: FeeHit[];
  details: Record<string, FeeLine[]>;
}) {
  const [open, setOpen] = useState<FeeHit | null>(null);
  const query = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&gubun=${encodeURIComponent(gubun)}`;
  const prev = page > 1 ? `${action}?${query}&pg=${page - 1}` : "";
  const next = page < pages ? `${action}?${query}&pg=${page + 1}` : "";
  return (
    <div className="mx-auto max-w-[90rem] space-y-3 px-3 py-4 pb-16 text-slate-800">
      <h1 className="font-serif text-xl text-primary">관리비내역</h1>
      <form action={action} className="flex flex-wrap items-end gap-2 rounded border border-[#9db7d0] bg-[#f4f8fc] px-2 py-2">
        <label className="text-[11px] text-slate-600">
          청구일자
          <span className="mt-0.5 flex items-center gap-1">
            <input type="date" name="from" defaultValue={from} className="h-7 border border-[#b7c6d6] bg-white px-1 text-xs" />
            <span>~</span>
            <input type="date" name="to" defaultValue={to} className="h-7 border border-[#b7c6d6] bg-white px-1 text-xs" />
          </span>
        </label>
        <label className="text-[11px] text-slate-600">
          납부구분
          <select name="gubun" defaultValue={gubun} className="mt-0.5 block h-7 border border-[#b7c6d6] bg-white px-1 text-xs">
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-7 bg-[#6b7280] px-3 text-xs text-white">
          조회
        </button>
        <a href={action} className="inline-flex h-7 items-center bg-[#6b7280] px-3 text-xs text-white">
          초기화
        </a>
        <span className="px-1 pb-1 text-[11px] text-slate-500">
          {total.toLocaleString("ko-KR")}건 · {page}/{pages}
        </span>
      </form>
      <div className="overflow-x-auto border border-[#9db7d0]">
        <table className="w-full min-w-[48rem] border-collapse text-xs">
          <thead className="bg-[#d7ebfb]">
            <tr>
              {["청구일자", "묘지번호", "사용자", "적용기간", "청구금액", "납부금액", "잔액", "납부기한", "구분"].map((header) => (
                <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hits.length ? (
              hits.map((hit, index) => (
                <tr key={`${hit.group}-${hit.billedOn}-${index}`} className="odd:bg-white even:bg-slate-50">
                  {([hit.billedOn, hit.tombNo, hit.userName] as const).map((value, cell) => (
                    <td key={["billedOn", "tombNo", "userName"][cell]} className="border border-[#d5e0ea] px-1 py-0.5">
                      <button type="button" className="text-[#1d4f91] underline-offset-2 hover:underline" onClick={() => setOpen(hit)}>
                        {value}
                      </button>
                    </td>
                  ))}
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{hit.period}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{hit.billed}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{hit.paid}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5 text-right">{hit.balance}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{hit.dueDate}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{hit.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="border px-2 py-8 text-center text-slate-500">
                  조건에 맞는 관리비가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 text-xs">
        {prev ? (
          <a href={prev} className="text-[#1d4f91] underline-offset-2 hover:underline">
            이전
          </a>
        ) : null}
        {next ? (
          <a href={next} className="text-[#1d4f91] underline-offset-2 hover:underline">
            다음
          </a>
        ) : null}
      </div>
      {open ? <FeeModal hit={open} rounds={details[open.group] ?? [open]} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
