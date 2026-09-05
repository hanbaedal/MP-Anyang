"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPhone } from "../../../../lib/phone";
import type { TicketRow, TicketStatus } from "../../../../lib/tickets";

type Props = {
  rows: TicketRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  statusFilter: string;
  replyAction: (formData: FormData) => Promise<void>;
  statusAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
};

function statusLabel(status: string) {
  if (status === "done") return "답변완료";
  if (status === "in_progress") return "처리중";
  return "접수";
}

function pageHref(page: number, query: string, statusFilter: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query.trim()) params.set("q", query.trim());
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  const qs = params.toString();
  return qs ? `/admin/inquiries?${qs}` : "/admin/inquiries";
}

export function AdminInquiriesClient({
  rows,
  total,
  page,
  pageSize,
  totalPages,
  query,
  statusFilter,
  replyAction,
  statusAction,
  removeAction,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<TicketStatus>("pending");

  const openRow = (row: TicketRow) => {
    setSelected(row);
    setReply(row.reply || "");
    setStatus(row.status);
  };

  return (
    <>
      <form method="get" className="admin-member-toolbar panel admin-inquiry-toolbar">
        <label className="admin-member-search">
          검색
          <input type="search" name="q" defaultValue={query} placeholder="이름, 연락처, 내용" />
        </label>
        <label className="admin-inquiry-status-filter">
          상태
          <select name="status" defaultValue={statusFilter}>
            <option value="all">전체</option>
            <option value="pending">접수</option>
            <option value="in_progress">처리중</option>
            <option value="done">답변완료</option>
          </select>
        </label>
        <button type="submit" className="btn btn-sm">
          조회
        </button>
        <p className="meta admin-member-count">
          총 {total.toLocaleString()}건 · {page}/{totalPages}페이지 (페이지당 {pageSize}건)
        </p>
      </form>

      <div className="table-wrap admin-member-table-wrap">
        <table className="data-table admin-member-table">
          <thead>
            <tr>
              <th>접수일</th>
              <th>유형</th>
              <th>분류</th>
              <th>이름</th>
              <th>연락처</th>
              <th>상태</th>
              <th>담당</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="admin-inquiry-row" onClick={() => openRow(row)}>
                <td>{new Date(row.createdAt).toLocaleString("ko-KR")}</td>
                <td>{row.sourceLabel}</td>
                <td>{row.category}</td>
                <td>{row.name}</td>
                <td>{formatPhone(row.phone) || row.phone}</td>
                <td>
                  <span className={`admin-inquiry-status admin-inquiry-status-${row.status}`}>{statusLabel(row.status)}</span>
                </td>
                <td>{row.assignee || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="alert">등록된 문의·상담이 없습니다.</p>}
      </div>

      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="문의 페이지">
          {page > 1 ? (
            <Link href={pageHref(page - 1, query, statusFilter)} className="btn btn-sm">
              이전
            </Link>
          ) : (
            <span className="btn btn-sm disabled">이전</span>
          )}
          <span className="meta">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1, query, statusFilter)} className="btn btn-sm">
              다음
            </Link>
          ) : (
            <span className="btn btn-sm disabled">다음</span>
          )}
        </nav>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal admin-inquiry-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.sourceLabel}</h2>
            <dl className="memorial-diff-dl">
              <div>
                <dt>접수일</dt>
                <dd>{new Date(selected.createdAt).toLocaleString("ko-KR")}</dd>
              </div>
              <div>
                <dt>이름 · 연락처</dt>
                <dd>
                  {selected.name} · {formatPhone(selected.phone) || selected.phone}
                </dd>
              </div>
              <div>
                <dt>분류</dt>
                <dd>{selected.category}</dd>
              </div>
              <div>
                <dt>문의 내용</dt>
                <dd className="admin-inquiry-message">{selected.message}</dd>
              </div>
              {selected.reply ? (
                <div>
                  <dt>기존 답변</dt>
                  <dd>{selected.reply}</dd>
                </div>
              ) : null}
            </dl>

            <form
              action={statusAction}
              className="form-grid admin-inquiry-status-form"
              onSubmit={() => setTimeout(() => router.refresh(), 0)}
            >
              <input type="hidden" name="id" value={selected.id} />
              <label>
                처리 상태
                <select name="status" value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
                  <option value="pending">접수</option>
                  <option value="in_progress">처리중</option>
                  <option value="done">답변완료</option>
                </select>
              </label>
              <button type="submit" className="btn btn-sm">
                상태 저장
              </button>
            </form>

            <form
              action={replyAction}
              className="form-grid"
              onSubmit={() => {
                setTimeout(() => setSelected(null), 0);
              }}
            >
              <input type="hidden" name="id" value={selected.id} />
              <label>
                관리자 답변
                <textarea name="reply" value={reply} onChange={(e) => setReply(e.target.value)} required rows={5} />
              </label>
              <div className="memorial-modal-actions">
                <button type="button" className="btn" onClick={() => setSelected(null)}>
                  닫기
                </button>
                <button type="submit" className="btn btn-primary">
                  답변 저장 (완료 처리)
                </button>
              </div>
            </form>

            <form action={removeAction} className="admin-inquiry-delete">
              <input type="hidden" name="id" value={selected.id} />
              <button type="submit" className="btn btn-danger btn-sm">
                삭제
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
