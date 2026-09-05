import Link from "next/link";
import { readSession } from "../../../lib/auth";
import { DEMO_FAMILY_MEMBER, DEMO_MEMORIAL_HALLS, demoHallHref } from "../../../lib/memorial-demo";

const STEPS = [
  { n: "1", title: "묘역 연결", text: "회원가입 시 등록한 묘역번호·망자 정보로 고인별 추모관이 생성됩니다." },
  { n: "2", title: "추억 수집", text: "유족이 생전 사진·가족 동영상·추모 글을 올리고, 운영팀 편집 영상도 함께 쌓입니다." },
  { n: "3", title: "시점별 갱신", text: "기일·설·추석·생일 등 추모 시점에 묘역 현황과 맞춤 콘텐츠가 타임라인에 추가됩니다." },
  { n: "4", title: "지속적 누적", text: "일회성이 아니라 같은 추모관에 시간순으로 기억이 쌓이는 디지털 공간입니다." },
];

const DIFF = [
  "추모 대행(현장 헌화·사진)과 연동 — 묘역 점검 사진이 추모관에 자동 반영",
  "가족 업로드 + 운영 편집 영상 요청",
  "추후 독립 사이트·앱으로 분리 가능한 모듈 구조",
];

export default async function MemorialIntroPage() {
  const user = await readSession();

  return (
    <article className="article memorial-intro-page">
      <p className="kicker">사이버 추모관</p>
      <h1>추억을 되살리는 디지털 추모공간</h1>
      <p className="lead">
        생전 모습과 가족·형제가 함께했던 시간을 사진·동영상으로 모으고, 기일·명절마다 묘역과 함께 추모합니다.
      </p>

      <div className="memorial-intro-cta panel">
        {user ? (
          <Link href="/memorial/my" className="btn btn-primary">
            내 추모관 보기
          </Link>
        ) : (
          <Link href="/login?next=/memorial/my" className="btn btn-primary">
            로그인 후 이용
          </Link>
        )}
        <Link href="/services/memorial" className="btn">
          추모 대행 안내
        </Link>
      </div>

      <section className="panel memorial-demo-panel">
        <h2>데모 체험</h2>
        <p className="meta">배포 환경에서 바로 확인할 수 있는 샘플 추모관입니다.</p>
        <div className="memorial-demo-grid">
          {DEMO_MEMORIAL_HALLS.map((hall) => (
            <Link key={hall.code} href={demoHallHref(hall.code)} className="memorial-demo-card">
              <p className="kicker">{hall.plotNo}</p>
              <h3>{hall.deceasedName}님</h3>
              <p className="meta">
                {hall.visibility === "public" ? "누구나 열람" : "로그인 후 열람"} · {hall.code}
              </p>
            </Link>
          ))}
        </div>
        <div className="memorial-demo-login">
          <p>
            <strong>데모 유족 계정</strong> — 아이디 <code>{DEMO_FAMILY_MEMBER.username}</code> · 비밀번호{" "}
            <code>{DEMO_FAMILY_MEMBER.password}</code>
          </p>
          <p className="meta">최창길님 계정으로 홍길동님(DEMO-A101) 추모관 업로드·편집 요청을 테스트할 수 있습니다.</p>
          <Link href={`/login?next=${encodeURIComponent("/memorial/my")}`} className="btn btn-sm">
            데모 계정으로 로그인
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>어떻게 이용하나요?</h2>
        <div className="memorial-steps">
          {STEPS.map((step) => (
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
        <ul className="memorial-diff-list">
          {DIFF.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel memorial-split-note">
        <h2>독립 사이트 분리</h2>
        <p>
          정식 서비스 시 사이버 추모관은 별도 도메인·앱으로 분리할 수 있도록 설계되어 있습니다. 묘역번호·회원·미디어
          API만 공유하면 공원묘지 메인과 추모관을 각각 운영할 수 있습니다.
        </p>
      </section>
    </article>
  );
}
