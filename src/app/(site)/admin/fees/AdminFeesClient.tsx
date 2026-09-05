"use client";

import { useMemo, useState } from "react";
import { formatPhone } from "../../../../lib/phone";
import type { FeeRecord } from "../../../../lib/store";

export type AdminFeeRow = {
  id: string;
  username: string;
  name: string;
  phone: string;
  plotNo: string;
  annualFee: number;
  feeStatus: string;
  feeHistory: FeeRecord[];
};

type Props = {
  members: AdminFeeRow[];
  updateFeeAction: (formData: FormData) => Promise<void>;
};

const STATUS_OPTIONS = ["완납", "미납", "분납"] as const;

function emptyHistoryRow(): FeeRecord {
  return { year: "", amount: 0, paid: false, memo: "" };
}

export function AdminFeesClient({ members, updateFeeAction }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editTarget, setEditTarget] = useState<AdminFeeRow | null>(null);
  const [historyRows, setHistoryRows] = useState<FeeRecord[]>([]);

  const stats = useMemo(() => {
    const counts = { 완납: 0, 미납: 0, 분납: 0 };
    for (const m of members) {
      const key = m.feeStatus as keyof typeof counts;
      if (key in counts) counts[key] += 1;
    }
    return counts;
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return members.filter((m) => {
      if (statusFilter !== "all" && m.feeStatus !== statusFilter) return false;
      if (!q) return true;
      return m.name.includes(q) || m.username.includes(q) || m.plotNo.includes(q);
    });
  }, [members, query, statusFilter]);

  const openEdit = (member: AdminFeeRow) => {
    setEditTarget(member);
    const rows = member.feeHistory.length ? member.feeHistory.map((r) => ({ ...r })) : [emptyHistoryRow()];
    setHistoryRows(rows);
  };

  const addHistoryRow = () => {
    if (historyRows.length >= 10) return;
    setHistoryRows((prev) => [...prev, emptyHistoryRow()]);
  };

  return (
    <>
      <div className="admin-fee-stats panel">
        <p>
          <strong>완납</strong> {stats.완납}명 · <strong>미납</strong> {stats.미납}명 · <strong>분납</strong>{" "}
          {stats.분납}명
        </p>
      </div>

      <div className="admin-member-toolbar panel">
        <label className="admin-member-search">
          검색
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 아이디, 묘역번호"
          />
        </label>
        <label>
          납부 상태
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">전체</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <p className="meta admin-member-count">{filtered.length}명</p>
      </div>

      <div className="table-wrap admin-member-table-wrap">
        <table className="data-table admin-member-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>묘역</th>
              <th>연간 관리비</th>
              <th>납부 상태</th>
              <th>내역</th>
              <th aria-label="관리" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="admin-member-name">
                  {m.name}
                  <span className="meta">{m.username}</span>
                </td>
                <td>{m.plotNo || "-"}</td>
                <td>{m.annualFee.toLocaleString()}원</td>
                <td>
                  <span className={`fee-badge fee-${m.feeStatus}`}>{m.feeStatus}</span>
                </td>
                <td className="meta">{m.feeHistory.length ? `${m.feeHistory.length}건` : "없음"}</td>
                <td>
                  <button type="button" className="btn btn-sm" onClick={() => openEdit(m)}>
                    관리
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="alert admin-member-empty">조건에 맞는 회원이 없습니다.</p>}
      </div>

      {editTarget && (
        <div className="modal-backdrop" onClick={() => setEditTarget(null)}>
          <div className="modal modal-admin-member modal-admin-fee" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-head">
              <h2>관리비 등록</h2>
              <button type="button" className="btn btn-sm btn-ghost modal-close" onClick={() => setEditTarget(null)}>
                닫기
              </button>
            </div>
            <p className="meta modal-sub">
              {editTarget.name} · {formatPhone(editTarget.phone) || editTarget.username} · 묘역 {editTarget.plotNo || "-"}
            </p>

            <form action={updateFeeAction} className="modal-member-form">
              <input type="hidden" name="id" value={editTarget.id} />

              <div className="form-grid modal-form-compact">
                <label>
                  연간 관리비 (원)
                  <input name="annualFee" type="number" min="0" defaultValue={editTarget.annualFee} required />
                </label>
                <label>
                  납부 상태
                  <select name="feeStatus" defaultValue={editTarget.feeStatus}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <h3>연도별 납부 내역</h3>
              <p className="meta">회원 내 정보 화면에 표시됩니다. 최대 10건.</p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>연도</th>
                      <th>금액</th>
                      <th>납부</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <input name="feeYear" defaultValue={row.year} placeholder="2025" />
                        </td>
                        <td>
                          <input name="feeAmount" type="number" min="0" defaultValue={row.amount} />
                        </td>
                        <td>
                          <select name="feePaid" defaultValue={row.paid ? "1" : "0"}>
                            <option value="1">완납</option>
                            <option value="0">미납</option>
                          </select>
                        </td>
                        <td>
                          <input name="feeMemo" defaultValue={row.memo || ""} placeholder="비고" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {historyRows.length < 10 && (
                <button type="button" className="btn btn-sm" onClick={addHistoryRow}>
                  내역 행 추가
                </button>
              )}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setEditTarget(null)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
