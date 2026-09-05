import Link from "next/link";
import { readSession } from "../../../../lib/auth";
import { MEMORIAL_BILLING_NOTE, MEMORIAL_PLANS } from "../../../../lib/memorial-info";

export default async function MemorialPlansPage() {
  const user = await readSession();

  return (
    <article className="article memorial-plans-page">
      <p className="kicker">사이버 추모관</p>
      <h1>요금·플랜</h1>
      <p className="lead">{MEMORIAL_BILLING_NOTE}</p>

      <div className="memorial-plans-grid">
        {MEMORIAL_PLANS.map((plan) => (
          <section
            key={plan.id}
            className={`panel memorial-plan-card${plan.highlight ? " memorial-plan-highlight" : ""}${plan.available ? " memorial-plan-available" : ""}`}
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
            {plan.available ? (
              user ? (
                <Link href="/memorial/my" className="btn btn-primary btn-sm">
                  내 추모관 이용
                </Link>
              ) : (
                <Link href="/login?next=/memorial/my" className="btn btn-primary btn-sm">
                  로그인 후 체험
                </Link>
              )
            ) : (
              <Link href="/consult" className="btn btn-sm">
                출시 알림·상담
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
              네. 「추모」는 현장 헌화·묘역 관리 대행입니다. 사이버 추모관은 디지털 추억 보관·타임라인 서비스로 별도
              요금이 적용됩니다.
            </dd>
          </div>
          <div>
            <dt>언제 결제가 시작되나요?</dt>
            <dd>정식 오픈 일정은 별도 공지 예정입니다. 현재는 데모 체험과 상담을 통해 기능을 확인하실 수 있습니다.</dd>
          </div>
          <div>
            <dt>묘역이 여러 개면?</dt>
            <dd>망자(추모관)별로 플랜이 적용됩니다. 가족 묘역이 여러 개인 경우 상담을 통해 안내해 드립니다.</dd>
          </div>
        </dl>
        <Link href="/memorial/guide" className="btn btn-sm">
          이용 방법 보기
        </Link>
      </section>
    </article>
  );
}
