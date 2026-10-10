"use client";

import { useState } from "react";
import { BASE_TABS } from "@/lib/base-book";

export type BaseRow = {
  key: string;
  values: string[];
  detail: { label: string; value: string; wide?: boolean }[];
};

function DetailForm({ title, detail }: { title: string; detail: BaseRow["detail"] | null }) {
  return (
    <aside className="border border-[#9db7d0] bg-[#f7fbfe] text-xs">
      <h2 className="border-b border-[#9db7d0] bg-[#d7ebfb] px-2 py-1 font-semibold">{title}</h2>
      {detail ? (
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-1 p-2">
          {detail.map((field) => (
            <div key={field.label} className="contents">
              <div className="flex items-center bg-[#e8f2fb] px-1">{field.label}</div>
              {field.wide ? (
                <textarea readOnly value={field.value} rows={field.label === "비고" ? 4 : 2} className="border border-[#b7c6d6] bg-white px-1 py-0.5" />
              ) : (
                <input readOnly value={field.value} className="h-7 border border-[#b7c6d6] bg-white px-1" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2 py-6 text-center text-slate-500">목록에서 항목을 선택하세요.</p>
      )}
    </aside>
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
  rows: BaseRow[];
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const spec = BASE_TABS.find((item) => item.kind === tab) ?? BASE_TABS[0];
  const open = rows.find((row) => row.key === openKey) ?? null;
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
        {spec.search ? (
          <label className="text-[11px] text-slate-600">
            {spec.search}
            <input name="tomb" defaultValue={tomb} className="mt-0.5 block h-7 w-40 border border-[#b7c6d6] bg-white px-2 text-xs" />
          </label>
        ) : null}
        {spec.search ? (
          <button type="submit" className="h-7 bg-[#6b7280] px-3 text-xs text-white">
            검색
          </button>
        ) : null}
        <a href={`${action}?tab=${tab}`} className="inline-flex h-7 items-center bg-[#6b7280] px-3 text-xs text-white">
          초기화
        </a>
        <span className="px-1 pb-1 text-[11px] text-slate-500">
          {total.toLocaleString("ko-KR")}건 · {page}/{pages}
        </span>
      </form>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)]">
        <div className="overflow-x-auto border border-[#9db7d0]">
          <table className="w-full min-w-[36rem] border-collapse text-xs">
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
                  <tr key={row.key} className={openKey === row.key ? "bg-[#d7ebfb]" : "odd:bg-white even:bg-slate-50"}>
                    <td className="border border-[#d5e0ea] px-1 py-0.5">
                      <button type="button" className="text-[#1d4f91] underline-offset-2 hover:underline" onClick={() => setOpenKey(row.key)}>
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
        <DetailForm title={spec.label} detail={open?.detail ?? null} />
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
    </div>
  );
}
