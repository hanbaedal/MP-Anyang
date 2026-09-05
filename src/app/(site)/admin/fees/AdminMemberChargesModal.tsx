"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPhone } from "../../../../lib/phone";
import {
  CHARGE_STATUS_LABELS,
  CHARGE_TYPE_LABELS,
  type ChargeStatus,
  type ChargeType,
  type MemberChargeRow,
} from "../../../../lib/member-charges-types";

type MemberBrief = {
  id: string;
  name: string;
  username: string;
  phone: string;
  plotNo: string;
};

type Props = {
  member: MemberBrief | null;
  onClose: () => void;
  loadChargesAction: (memberId: string) => Promise<MemberChargeRow[]>;
  addChargeAction: (formData: FormData) => Promise<void>;
  updateChargeAction: (formData: FormData) => Promise<void>;
  deleteChargeAction: (formData: FormData) => Promise<void>;
  syncChargesAction: (formData: FormData) => Promise<void>;
};

const CHARGE_TYPES: ChargeType[] = ["sale", "annual_fee", "memorial", "other"];
const CHARGE_STATUSES: ChargeStatus[] = ["pending", "paid", "partial", "cancelled"];

export function AdminMemberChargesModal({
  member,
  onClose,
  loadChargesAction,
  addChargeAction,
  updateChargeAction,
  deleteChargeAction,
  syncChargesAction,
}: Props) {
  const router = useRouter();
  const [charges, setCharges] = useState<MemberChargeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const reload = async (memberId: string) => {
    setLoading(true);
    try {
      setCharges(await loadChargesAction(memberId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (member) void reload(member.id);
    else setCharges([]);
  }, [member]);

  if (!member) return null;

  const editRow = editId ? charges.find((c) => c.id === editId) : null;

  const afterSubmit = () => {
    setEditId(null);
    void reload(member.id);
    router.refresh();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-admin-member modal-member-charges" onClick={(e) => e.stopPropagation()}>
        <div className="modal-admin-head">
          <h2>비용 원장</h2>
          <button type="button" className="btn btn-sm btn-ghost modal-close" onClick={onClose}>
            닫기
          </button>
        </div>
        <p className="meta modal-sub">
          {member.name} · {formatPhone(member.phone) || member.username} · 묘역 {member.plotNo || "-"}
        </p>

        <form
          action={syncChargesAction}
          className="admin-charges-sync"
          onSubmit={() => setTimeout(afterSubmit, 0)}
        >
          <input type="hidden" name="memberId" value={member.id} />
          <button type="submit" className="btn btn-sm">
            회원정보 → 원장 동기화
          </button>
          <span className="meta">분양가·관리비·추모 구독을 원장에 반영</span>
        </form>

        {loading ? (
          <p className="meta">불러오는 중…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table admin-charges-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>항목</th>
                  <th>금액</th>
                  <th>납부</th>
                  <th>상태</th>
                  <th aria-label="관리" />
                </tr>
              </thead>
              <tbody>
                {charges.map((row) => (
                  <tr key={row.id}>
                    <td>{CHARGE_TYPE_LABELS[row.chargeType]}</td>
                    <td>{row.title}</td>
                    <td>{row.amount.toLocaleString()}</td>
                    <td>{row.paidAmount.toLocaleString()}</td>
                    <td>{CHARGE_STATUS_LABELS[row.status]}</td>
                    <td>
                      <button type="button" className="btn btn-sm" onClick={() => setEditId(row.id)}>
                        수정
                      </button>
                      <form
                        action={deleteChargeAction}
                        className="inline-form"
                        onSubmit={() => setTimeout(afterSubmit, 0)}
                      >
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <button type="submit" className="btn btn-danger btn-sm">
                          삭제
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {charges.length === 0 && <p className="meta admin-member-empty">등록된 비용 항목이 없습니다.</p>}
          </div>
        )}

        <h3>{editRow ? "항목 수정" : "항목 추가"}</h3>
        <form
          action={editRow ? updateChargeAction : addChargeAction}
          className="form-grid modal-form-compact"
          onSubmit={() => setTimeout(afterSubmit, 0)}
        >
          <input type="hidden" name="memberId" value={member.id} />
          {editRow ? <input type="hidden" name="id" value={editRow.id} /> : null}
          <label>
            구분
            <select name="chargeType" defaultValue={editRow?.chargeType || "annual_fee"} required>
              {CHARGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CHARGE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label>
            항목명
            <input name="title" defaultValue={editRow?.title || ""} required placeholder="2025년 연관리비" />
          </label>
          <label>
            청구액
            <input name="amount" type="number" min="0" defaultValue={editRow?.amount ?? 0} required />
          </label>
          <label>
            납부액
            <input name="paidAmount" type="number" min="0" defaultValue={editRow?.paidAmount ?? 0} />
          </label>
          <label>
            상태
            <select name="status" defaultValue={editRow?.status || "pending"}>
              {CHARGE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CHARGE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            연도
            <input name="periodYear" defaultValue={editRow?.periodYear || ""} placeholder="2025" />
          </label>
          <label className="modal-field-full">
            비고
            <input name="memo" defaultValue={editRow?.memo || ""} />
          </label>
          <div className="modal-actions modal-field-full">
            {editRow ? (
              <button type="button" className="btn" onClick={() => setEditId(null)}>
                추가 모드
              </button>
            ) : null}
            <button type="submit" className="btn btn-primary">
              {editRow ? "수정 저장" : "항목 추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
