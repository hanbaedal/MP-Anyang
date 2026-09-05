"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MemorialPlan } from "../lib/memorial-info";

type HallOption = { code: string; deceasedName: string; plotNo: string };

type Props = {
  plan: MemorialPlan;
  halls: HallOption[];
  billingMode: "mock" | "pg";
  onClose: () => void;
};

export function MemorialCheckoutModal({ plan, halls, billingMode, onClose }: Props) {
  const router = useRouter();
  const [hallCode, setHallCode] = useState(halls[0]?.code || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onPay = async () => {
    if (!hallCode) {
      setMsg("추mo관을 선택해 주세요.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const checkoutRes = await fetch("/api/memorial/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, hallCode }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || "주문 생성 실패");

      if (billingMode === "pg") {
        setMsg("PG 결제 연동 준비 중입니다. 관리자에게 문의해 주세요.");
        return;
      }

      const confirmRes = await fetch("/api/memorial/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: checkoutData.orderId }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || "결제 확인 실패");

      onClose();
      router.push(
        `/memorial/billing/success?hall=${encodeURIComponent(hallCode)}&plan=${plan.id}&expires=${encodeURIComponent(confirmData.expiresAt)}`,
      );
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "결제 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <div className="modal memorial-checkout-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{plan.name} 연간권</h2>
        <p className="memorial-plan-price">
          <strong>{plan.priceLabel}</strong>
          <span className="meta">{plan.period}</span>
        </p>
        <ul className="memorial-plan-features memorial-plan-features-modal">
          {plan.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        {!halls.length ? (
          <p className="alert">연결된 추mo관이 없습니다. 내정보에서 묘역·망자를 등록해 주세요.</p>
        ) : (
          <label className="memorial-checkout-field">
            연간권 적용 추mo관
            <select value={hallCode} onChange={(e) => setHallCode(e.target.value)} disabled={busy}>
              {halls.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.deceasedName}님 · {h.plotNo || h.code}
                </option>
              ))}
            </select>
          </label>
        )}

        {billingMode === "mock" && (
          <p className="meta memorial-checkout-mock">테스트 모드 — 실제 결제 없이 연간권이 발급됩니다.</p>
        )}

        {msg && <p className="alert">{msg}</p>}

        <div className="memorial-modal-actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            취소
          </button>
          <button type="button" className="btn btn-primary" disabled={busy || !halls.length} onClick={onPay}>
            {busy ? "처리 중…" : billingMode === "mock" ? "테스트 결제" : "결제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
