import Link from "next/link";
import { MEMORIAL_HOWTO_STEPS, MEMORIAL_VS_AGENCY } from "../../../../lib/memorial-info";

export default function MemorialGuidePage() {
  return (
    <article className="article memorial-guide-page">
      <p className="kicker">사이버 추모관</p>
      <h1>이용 방법</h1>
      <p className="lead">묘역번호와 망자 정보를 연결한 뒤, 추억을 모아 디지털 타임라인으로 남깁니다.</p>

      <section className="panel">
        <h2>4단계 이용 흐름</h2>
        <div className="memorial-steps">
          {MEMORIAL_HOWTO_STEPS.map((step) => (
            <div key={step.n} className="memorial-step">
              <span className="memorial-step-n">{step.n}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>추모 대행과의 차이</h2>
        <dl className="memorial-diff-dl">
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

      <section className="panel memorial-split-note">
        <h2>독립 운영·유료화</h2>
        <p>
          사이버 추모관은 서비스상품(추모 대행·상조 등)과 별도로 운영되며, 정식 출시 시 요금 플랜이 적용됩니다. 별도
          도메인·앱으로 분리할 수 있도록 설계되어 있습니다.
        </p>
        <div className="memorial-guide-actions">
          <Link href="/memorial/plans" className="btn btn-primary btn-sm">
            요금·플랜 보기
          </Link>
          <Link href="/memorial/my" className="btn btn-sm">
            내 추모관
          </Link>
        </div>
      </section>
    </article>
  );
}
