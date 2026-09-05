"use client";

import { useCallback, useMemo, useState } from "react";
import { formatPhone } from "../../../../lib/phone";
import { formatSmsConsentAt } from "../../../../lib/sms-consent";
import type { Relation } from "../../../../lib/store";

export type AdminMemberRow = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  plotNo: string;
  annualFee: number;
  salePrice: number;
  feeStatus: string;
  smsConsent: boolean;
  marketingSmsConsent: boolean;
  smsConsentAt: string | null;
  relations: Relation[];
};

type Props = {
  members: AdminMemberRow[];
  updateMemberAction: (formData: FormData) => Promise<void>;
  removeMemberAction: (formData: FormData) => Promise<void>;
};

export function AdminMembersClient({ members, updateMemberAction, removeMemberAction }: Props) {
  const [query, setQuery] = useState("");
  const [editTarget, setEditTarget] = useState<AdminMemberRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMemberRow | null>(null);
  const [plotNoEdit, setPlotNoEdit] = useState("");
  const [annualFeeEdit, setAnnualFeeEdit] = useState(0);
  const [salePriceEdit, setSalePriceEdit] = useState(0);
  const [applyPlotFees, setApplyPlotFees] = useState(false);
  const [plotFeeHint, setPlotFeeHint] = useState("");
  const [plotSuggestedFee, setPlotSuggestedFee] = useState<number | null>(null);
  const [plotSuggestedSale, setPlotSuggestedSale] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return members;
    return members.filter((m) => m.name.includes(q) || m.username.includes(q));
  }, [members, query]);

  const lookupPlotFees = useCallback(async (plotNo: string) => {
    const key = plotNo.trim();
    if (!key) {
      setPlotFeeHint("");
      setPlotSuggestedFee(null);
      setPlotSuggestedSale(null);
      return;
    }
    try {
      const res = await fetch(`/api/plot-lookup?plotNo=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!data.found) {
        setPlotFeeHint("등록된 묘역번호가 없습니다.");
        setPlotSuggestedFee(null);
        setPlotSuggestedSale(null);
        return;
      }
      const fee = Number(data.annualFee) || 0;
      const sale = Number(data.salePrice) || 0;
      setPlotSuggestedFee(fee > 0 ? fee : null);
      setPlotSuggestedSale(sale > 0 ? sale : null);
      const src = data.feeSource === "plot" ? "묘역 개별" : "요금표";
      setPlotFeeHint(
        `${data.type} ${data.capacity} · ${src} — 분양 ${sale.toLocaleString()}원 / 연 ${fee.toLocaleString()}원`,
      );
    } catch {
      setPlotFeeHint("묘역 정보를 불러오지 못했습니다.");
      setPlotSuggestedFee(null);
      setPlotSuggestedSale(null);
    }
  }, []);

  const openEdit = (member: AdminMemberRow) => {
    setEditTarget(member);
    setPlotNoEdit(member.plotNo);
    setAnnualFeeEdit(member.annualFee);
    setSalePriceEdit(member.salePrice);
    setApplyPlotFees(false);
    setPlotFeeHint("");
    setPlotSuggestedFee(null);
    setPlotSuggestedSale(null);
    if (member.plotNo.trim()) void lookupPlotFees(member.plotNo);
  };

  const applySuggestedFees = () => {
    if (plotSuggestedFee != null) setAnnualFeeEdit(plotSuggestedFee);
    if (plotSuggestedSale != null) setSalePriceEdit(plotSuggestedSale);
    setApplyPlotFees(true);
  };

  return (
    <>
      <div className="admin-member-toolbar panel">
        <label className="admin-member-search">
          이름 검색
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="회원 이름 또는 아이디"
          />
        </label>
        <p className="meta admin-member-count">
          {query.trim() ? `검색 ${filtered.length}명` : `전체 ${members.length}명`} · 가나다순
        </p>
      </div>

      <div className="table-wrap admin-member-table-wrap">
        <table className="data-table admin-member-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>아이디</th>
              <th>전화</th>
              <th>묘역</th>
              <th>관리비</th>
              <th aria-label="관리" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="admin-member-name">{m.name}</td>
                <td>{m.username}</td>
                <td>{formatPhone(m.phone) || "-"}</td>
                <td>{m.plotNo || "-"}</td>
                <td>
                  {m.annualFee.toLocaleString()}원
                  <span className="meta"> / {m.feeStatus}</span>
                </td>
                <td>
                  <div className="admin-member-row-actions">
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(m)}>
                      수정
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(m)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="alert admin-member-empty">
            {query.trim() ? `"${query.trim()}" 검색 결과가 없습니다.` : "등록된 회원이 없습니다."}
          </p>
        )}
      </div>

      {editTarget && (
        <div className="modal-backdrop" onClick={() => setEditTarget(null)}>
          <div className="modal modal-admin-member" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-head">
              <h2>회원 수정</h2>
              <button type="button" className="btn btn-sm btn-ghost modal-close" onClick={() => setEditTarget(null)}>
                닫기
              </button>
            </div>
            <p className="meta modal-sub">
              {editTarget.name} ({editTarget.username})
            </p>

            <form action={updateMemberAction} className="modal-member-form">
              <input type="hidden" name="id" value={editTarget.id} />
              <input type="hidden" name="applyPlotFees" value={applyPlotFees ? "1" : "0"} />
              <div className="form-grid modal-form-compact">
                <label>
                  이름
                  <input name="name" defaultValue={editTarget.name} required />
                </label>
                <label>
                  전화
                  <input name="phone" defaultValue={editTarget.phone} required />
                </label>
                <label>
                  이메일
                  <input name="email" type="email" defaultValue={editTarget.email} />
                </label>
                <label>
                  묘역번호
                  <input
                    name="plotNo"
                    value={plotNoEdit}
                    onChange={(e) => {
                      setPlotNoEdit(e.target.value);
                      setApplyPlotFees(false);
                    }}
                    onBlur={() => void lookupPlotFees(plotNoEdit)}
                  />
                </label>
                <label>
                  분양가 (원)
                  <input
                    name="salePrice"
                    type="number"
                    min="0"
                    value={salePriceEdit}
                    onChange={(e) => {
                      setSalePriceEdit(Number(e.target.value));
                      setApplyPlotFees(false);
                    }}
                  />
                </label>
                <label>
                  연간 관리비 (원)
                  <input
                    name="annualFee"
                    type="number"
                    min="0"
                    value={annualFeeEdit}
                    onChange={(e) => {
                      setAnnualFeeEdit(Number(e.target.value));
                      setApplyPlotFees(false);
                    }}
                    required
                  />
                </label>
                <label>
                  납부 상태
                  <select name="feeStatus" defaultValue={editTarget.feeStatus}>
                    <option>완납</option>
                    <option>미납</option>
                    <option>분납</option>
                  </select>
                </label>
                <label className="modal-field-full">
                  새 비밀번호
                  <input name="password" type="password" placeholder="변경할 때만 입력" autoComplete="new-password" />
                </label>
              </div>

              {plotFeeHint ? (
                <p className="meta admin-plot-fee-hint">
                  {plotFeeHint}
                  {plotSuggestedFee != null || plotSuggestedSale != null ? (
                    <button type="button" className="link-btn" onClick={applySuggestedFees}>
                      요금표 적용
                    </button>
                  ) : null}
                </p>
              ) : null}

              <div className="modal-info-strip">
                <span>SMS 서비스: {editTarget.smsConsent ? "동의" : "미동의"}</span>
                <span>마케팅 SMS: {editTarget.marketingSmsConsent ? "동의" : "미동의"}</span>
                {editTarget.smsConsentAt ? <span>동의일 {formatSmsConsentAt(editTarget.smsConsentAt)}</span> : null}
                {editTarget.relations.length > 0 ? (
                  <span className="modal-field-full">
                    관계: {editTarget.relations.map((r) => `${r.deceasedName}(${r.relation})`).join(", ")}
                  </span>
                ) : null}
              </div>

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

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal-admin-member modal-admin-member-sm" onClick={(e) => e.stopPropagation()}>
            <h2>회원 삭제</h2>
            <p>
              <strong>{deleteTarget.name}</strong> ({deleteTarget.username}) 회원을 삭제할까요?
            </p>
            <p className="meta">삭제 후 복구할 수 없습니다.</p>
            <form action={removeMemberAction} className="modal-actions">
              <input type="hidden" name="id" value={deleteTarget.id} />
              <button type="button" className="btn" onClick={() => setDeleteTarget(null)}>
                취소
              </button>
              <button type="submit" className="btn btn-danger">
                삭제
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
