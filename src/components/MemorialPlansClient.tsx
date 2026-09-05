"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MEMORIAL_MY_HALL } from "../lib/memorial-demo";
import type { MemorialPlan, MemorialPlanId } from "../lib/memorial-info";
import { MemorialCheckoutModal } from "./MemorialCheckoutModal";

type HallOption = { code: string; deceasedName: string; plotNo: string };

type Props = {
  plans: MemorialPlan[];
  loggedIn: boolean;
  halls: HallOption[];
  billingMode: "mock" | "pg";
};

export function MemorialPlansClient({ plans, loggedIn, halls, billingMode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkoutPlan, setCheckoutPlan] = useState<MemorialPlan | null>(null);

  useEffect(() => {
    const planId = searchParams.get("plan") as MemorialPlanId | null;
    if (!planId || !loggedIn) return;
    const plan = plans.find((p) => p.id === planId && p.purchasable);
    if (plan) setCheckoutPlan(plan);
  }, [searchParams, loggedIn, plans]);

  const onCardClick = (plan: MemorialPlan) => {
    if (!plan.purchasable) {
      router.push(`/memorial/${MEMORIAL_MY_HALL}`);
      return;
    }
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/memorial/plans?plan=${plan.id}`)}`);
      return;
    }
    setCheckoutPlan(plan);
  };

  return (
    <>
      <div className="memorial-plans-grid">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`panel memorial-plan-card memorial-plan-card-btn${plan.highlight ? " memorial-plan-highlight" : ""}${!plan.purchasable ? " memorial-plan-demo" : ""}`}
            onClick={() => onCardClick(plan)}
          >
            {plan.badge ? <span className="memorial-plan-badge">{plan.badge}</span> : null}
            <h2>{plan.name}</h2>
            <p className="memorial-plan-price">
              <strong>{plan.priceLabel}</strong>
              <span className="meta">{plan.period}</span>
            </p>
            <ul className="memorial-plan-features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <span className="memorial-plan-card-cta meta">
              {plan.purchasable ? (loggedIn ? "클릭하여 결제" : "로그인 후 결제") : "데모 추mo관 보기"}
            </span>
          </button>
        ))}
      </div>

      {checkoutPlan && (
        <MemorialCheckoutModal
          plan={checkoutPlan}
          halls={halls}
          billingMode={billingMode}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </>
  );
}
