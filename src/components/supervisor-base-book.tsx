"use client";

import { useState } from "react";
import { BASE_TABS } from "@/lib/base-book";

function DetailModal({ title, columns, values, onClose }: { title: string; columns: string[]; values: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-3xl border border-[#7aa2c4] bg-[#f7fbfe] text-slate-800 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#7aa2c4] bg-[#d7ebfb] px-3 py-2">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="h-7 bg-[#6b7280] px-3 text-xs text-white">
            닫기
          </button>
        </div>
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-1 p-3 text-xs">
          {columns.map((column, index) => (
            <div key={column} className="contents">
              <div className="flex items-center bg-[#e8f2fb] px-1">{column}</div>
              <input readOnly value={values[index] ?? ""} className="h-7 border border-[#b7c6d6] bg-white px-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SupervisorBaseBook({
  action,
  tab,
  tomb,
  page,
  pages,
  total,
  columns,
  rows,
}: {
  action: string;
  tab: string;
  tomb: string;
  page: number;
  pages: number;
  total: number;
  columns: string[];
  rows: { key: string; values: string[] }[];
}) {
  const [open, setOpen] = useState<{ key: string; values: string[] } | null>(null);
  const label = BASE_TABS.find((item) => item.kind === tab)?.label ?? "기초정보";
  const query = `tab=${encodeURIComponent(tab)}&tomb=${encodeURIComponent(tomb)}`;
  return (
    <div className="mx-auto max-w-[90rem] space-y-3 px-3 py-4 pb-16 text-slate-800">
      <h1 className="font-serif text-xl text-primary">기초정보</h1>
      <div className="flex flex-wrap border-b border-[#7aa2c4]">
        {BASE_TABS.map((item) => (
          <a
            key={item.kind}
            href={`${action}?tab=${item.kind}`}
            className={
              tab === item.kind
                ? "border border-b-white border-[#7aa2c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d4f91]"
                : "px-3 py-1.5 text-xs text-slate-600"
            }
          >
            {item.label}
          </a>
        ))}
      </div>
      <form action={action} className="flex flex-wrap items-end gap-2 rounded border border-[#9db7d0] bg-[#f4f8fc] px-2 py-2">
        <input type="hidden" name="tab" value={tab} />
        <label className="text-[11px] text-slate-600">
          {tab === "plot" ? "묘지번호" : "검색"}
          <input name="tomb" defaultValue={tomb} className="mt-0.5 block h-7 w-40 border border-[#b7c6d6] bg-white px-2 text-xs" />
        </label>
        <button type="submit" className="h-7 bg-[#6b7280] px-3 text-xs text-white">
          검색
        </button>
        <a href={`${action}?tab=${tab}`} className="inline-flex h-7 items-center bg-[#6b7280] px-3 text-xs text-white">
          초기화
        </a>
        <span className="px-1 pb-1 text-[11px] text-slate-500">
          {total.toLocaleString("ko-KR")}건 · {page}/{pages}
        </span>
      </form>
      <div className="overflow-x-auto border border-[#9db7d0]">
        <table className="w-full min-w-[40rem] border-collapse text-xs">
          <thead className="bg-[#d7ebfb]">
            <tr>
              {columns.map((header) => (
                <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.key} className="odd:bg-white even:bg-slate-50">
                  <td className="border border-[#d5e0ea] px-1 py-0.5">
                    <button type="button" className="text-[#1d4f91] underline-offset-2 hover:underline" onClick={() => setOpen(row)}>
                      {row.values[0] || " "}
                    </button>
                  </td>
                  {row.values.slice(1).map((value, index) => (
                    <td key={index} className="border border-[#d5e0ea] px-1 py-0.5">
                      {value}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="border px-2 py-8 text-center text-slate-500">
                  자료가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 text-xs">
        {page > 1 ? (
          <a href={`${action}?${query}&pg=${page - 1}`} className="text-[#1d4f91] underline-offset-2 hover:underline">
            이전
          </a>
        ) : null}
        {page < pages ? (
          <a href={`${action}?${query}&pg=${page + 1}`} className="text-[#1d4f91] underline-offset-2 hover:underline">
            다음
          </a>
        ) : null}
      </div>
      {open ? <DetailModal title={label} columns={columns} values={open.values} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
