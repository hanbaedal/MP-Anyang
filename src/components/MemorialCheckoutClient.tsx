"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getPaidPlan } from "../lib/memorial-info";

type HallOption = { code: string; deceasedName: string; plotNo: string };

type Props = {
  halls: HallOption[];
  billingMode: "mock" | "pg";
};

export function MemorialCheckoutClient({ halls, billingMode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const plan = useMemo(() => getPaidPlan(planParam || ""), [planParam]);

  const [hallCode, setHallCode] = useState(halls[0]?.code || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!plan) {
    return (
      <section className="panel">
        <p className="alert">유효한 연간권 플랜을 선택해 주세요.</p>
        <Link href="/memorial/plans" className="btn btn-sm">
          요금·플랜으로
        </Link>
      </section>
    );
  }

  const onPay = async () => {
    if (!hallCode) {
      setMsg("추모관을 선택해 주세요.");
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
    <section className="panel memorial-checkout-panel">
      <h2>{plan.name} 연간권</h2>
      <p className="memorial-plan-price">
        <strong>{plan.priceLabel}</strong>
        <span className="meta">{plan.period}</span>
      </p>
      <ul className="memorial-plan-features">
        {plan.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {!halls.length ? (
        <p className="alert">연결된 추모관이 없습니다. 내정보에서 묘역·망자를 등록해 주세요.</p>
      ) : (
        <label className="memorial-checkout-field">
          연간권 적용 추모관
          <select value={hallCode} onChange={(e) => setHallCode(e.target.value)}>
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

      <div className="memorial-guide-actions">
        <button type="button" className="btn btn-primary" disabled={busy || !halls.length} onClick={onPay}>
          {busy ? "처리 중…" : billingMode === "mock" ? "테스트 결제 (연간권 발급)" : "결제하기"}
        </button>
        <Link href="/memorial/plans" className="btn btn-sm">
          플랜 다시 보기
        </Link>
      </div>
    </section>
  );
}
