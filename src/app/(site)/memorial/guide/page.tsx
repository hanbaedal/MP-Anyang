import Link from "next/link";
import { MEMORIAL_HOWTO_STEPS, MEMORIAL_VS_AGENCY } from "../../../../lib/memorial-info";

export default function MemorialGuidePage() {
  return (
    <article className="article memorial-guide-page">
      <p className="kicker">사이버 추모관</p>
      <h1>이용 방법</h1>

      <section className="panel memorial-guide-compact">
        <h2 className="memorial-guide-section-title">4단계 이용 흐름</h2>
        <div className="memorial-steps memorial-steps-compact">
          {MEMORIAL_HOWTO_STEPS.map((step) => (
            <div key={step.n} className="memorial-step">
              <span className="memorial-step-n">{step.n}</span>
              <div className="memorial-step-body">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel memorial-guide-compact">
        <h2 className="memorial-guide-section-title">추모 대행과의 차이</h2>
        <dl className="memorial-diff-dl memorial-diff-compact">
          {MEMORIAL_VS_AGENCY.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.text}</dd>
            </div>
          ))}
        </dl>
        <Link href="/services/memorial" className="btn btn-sm">
          추모 대행 안내
        </Link>
      </section>
    </article>
  );
}
