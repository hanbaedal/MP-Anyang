import Link from "next/link";
import { readSession } from "../../../../lib/auth";
import { MEMORIAL_BILLING_NOTE, MEMORIAL_PLANS } from "../../../../lib/memorial-info";
import { billingMode } from "../../../../lib/memorial-billing";

export default async function MemorialPlansPage() {
  const user = await readSession();
  const mode = billingMode();

  return (
    <article className="article memorial-plans-page">
      <p className="kicker">사이버 추모관</p>
      <h1>요금·플랜</h1>
      <p className="lead">{MEMORIAL_BILLING_NOTE}</p>
      {mode === "mock" && (
        <p className="meta memorial-billing-mode-note">현재 테스트 결제 모드 — 실제 과금 없이 연간권을 발급해 기능을 확인할 수 있습니다.</p>
      )}

      <div className="memorial-plans-grid">
        {MEMORIAL_PLANS.map((plan) => (
          <section
            key={plan.id}
            className={`panel memorial-plan-card${plan.highlight ? " memorial-plan-highlight" : ""}${!plan.purchasable ? " memorial-plan-demo" : ""}`}
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
            {plan.purchasable ? (
              user ? (
                <Link href={`/memorial/checkout?plan=${plan.id}`} className="btn btn-primary btn-sm">
                  연간권 구매
                </Link>
              ) : (
                <Link href={`/login?next=${encodeURIComponent(`/memorial/checkout?plan=${plan.id}`)}`} className="btn btn-primary btn-sm">
                  로그인 후 구매
                </Link>
              )
            ) : user ? (
              <Link href="/memorial/my" className="btn btn-sm">
                내 추모관 · 데모
              </Link>
            ) : (
              <Link href="/memorial/DEMO-A101" className="btn btn-sm">
                데모 추모관 보기
              </Link>
            )}
          </section>
        ))}
      </div>

      <section className="panel memorial-plan-faq">
        <h2>자주 묻는 질문</h2>
        <dl className="memorial-diff-dl">
          <div>
            <dt>서비스상품 「추모」와 다른가요?</dt>
            <dd>
              네. 「추모」는 현장 헌화·묘역 관리 대행입니다. 사이버 추모관 연간권은 디지털 추모관 1년 이용권입니다.
            </dd>
          </div>
          <div>
            <dt>결제는 어떻게 하나요?</dt>
            <dd>
              플랜 선택 → 추모관 지정 → 결제(현재는 테스트 모드) → 1년 이용. 실제 PG 연동은 추후
              <code> MEMORIAL_BILLING_MODE=pg</code> 로 전환합니다.
            </dd>
          </div>
          <div>
            <dt>묘역이 여러 개면?</dt>
            <dd>망자(추모관)별로 연간권을 각각 구매합니다.</dd>
          </div>
        </dl>
        <Link href="/memorial/guide" className="btn btn-sm">
          이용 방법 보기
        </Link>
      </section>
    </article>
  );
}
