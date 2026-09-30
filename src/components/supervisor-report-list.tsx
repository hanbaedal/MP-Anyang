"use client";

import { useState } from "react";
import type { ReportCopy } from "@/lib/cemetery-parse";

function ReportModal({ row, onClose }: { row: ReportCopy; onClose: () => void }) {
  const tasks = row.tasks ?? [];
  const plans = row.plans ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="업무일지"
        className="w-full max-w-4xl border border-[#7aa2c4] bg-[#f7fbfe] text-slate-800 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#7aa2c4] bg-[#d7ebfb] px-3 py-2">
          <h2 className="text-sm font-semibold">업무일지 {row.date}</h2>
          <button type="button" onClick={onClose} className="h-7 bg-[#6b7280] px-3 text-xs text-white">
            닫기
          </button>
        </div>
        <div className="space-y-3 p-3 text-xs">
          <section className="border border-[#9db7d0]">
            <h3 className="border-b border-[#9db7d0] bg-[#d7ebfb] px-2 py-1 font-semibold">업무사항</h3>
            <table className="w-full border-collapse">
              <thead className="bg-[#e8f2fb]">
                <tr>
                  {["묘지번호", "진행사항", "결과"].map((header) => (
                    <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.length ? (
                  tasks.map((task, index) => (
                    <tr key={index} className="odd:bg-white">
                      <td className="border border-[#d5e0ea] px-1 py-0.5">{task.tombNo}</td>
                      <td className="border border-[#d5e0ea] px-1 py-0.5">{task.progress}</td>
                      <td className="border border-[#d5e0ea] px-1 py-0.5">{task.result}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="border px-2 py-3 text-center text-slate-500">
                      업무사항이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <section className="border border-[#9db7d0]">
            <h3 className="border-b border-[#9db7d0] bg-[#d7ebfb] px-2 py-1 font-semibold">예정사항</h3>
            <table className="w-full border-collapse">
              <thead className="bg-[#e8f2fb]">
                <tr>
                  {["묘지번호", "예정사항"].map((header) => (
                    <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.length ? (
                  plans.map((plan, index) => (
                    <tr key={index}>
                      <td className="border border-[#d5e0ea] px-1 py-0.5">{plan.tombNo}</td>
                      <td className="border border-[#d5e0ea] px-1 py-0.5">{plan.note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="border px-2 py-3 text-center text-slate-500">
                      예정사항이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-1">
            {(
              [
                ["청구자재", row.claimMaterial],
                ["입고자재", row.inboundMaterial],
                ["특기사항", row.note],
                ["출근현황", row.attendance ?? ""],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="contents">
                <div className="flex items-center bg-[#e8f2fb] px-1">{label}</div>
                <div className="min-h-8 border border-[#b7c6d6] bg-white px-1 py-1 whitespace-pre-wrap">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupervisorReportList({ rows }: { rows: ReportCopy[] }) {
  const [open, setOpen] = useState<ReportCopy | null>(null);
  return (
    <div className="mx-auto max-w-[90rem] space-y-3 px-3 py-4 pb-16 text-slate-800">
      <h1 className="font-serif text-xl text-primary">업무보고/현황</h1>
      <p className="text-[11px] text-slate-500">{rows.length.toLocaleString("ko-KR")}건</p>
      <div className="overflow-x-auto border border-[#9db7d0]">
        <table className="w-full min-w-[48rem] border-collapse text-xs">
          <thead className="bg-[#d7ebfb]">
            <tr>
              {["작성일자", "처리건수", "청구자재", "입고자재", "특기사항", "출근현황"].map((header) => (
                <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={`${row.date}-${row.reportNo ?? ""}`} className="odd:bg-white even:bg-slate-50">
                  <td className="border border-[#d5e0ea] px-1 py-0.5">
                    <button type="button" className="text-[#1d4f91] underline-offset-2 hover:underline" onClick={() => setOpen(row)}>
                      {row.date}
                    </button>
                  </td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{row.handledCount.toLocaleString("ko-KR")}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{row.claimMaterial}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{row.inboundMaterial}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{row.note}</td>
                  <td className="border border-[#d5e0ea] px-1 py-0.5">{row.attendance ?? ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border px-2 py-8 text-center text-slate-500">
                  업무보고가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {open ? <ReportModal row={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
