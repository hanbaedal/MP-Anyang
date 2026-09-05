import Link from "next/link";
import { readSession } from "../../../lib/auth";
import { DEMO_FAMILY_MEMBER, DEMO_MEMORIAL_HALLS, demoHallHref } from "../../../lib/memorial-demo";

export default async function MemorialIntroPage() {
  const user = await readSession();

  return (
    <article className="article memorial-intro-page">
      <p className="kicker">사이버 추모관</p>
      <h1>추억을 되살리는 디지털 추모공간</h1>
      <p className="lead">
        생전 모습과 가족·형제가 함께했던 시간을 사진·동영상으로 모으고, 기일·명절마다 묘역과 함께 추모합니다. 서비스상품과
        별도로 운영되는 유료 디지털 서비스입니다.
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
        <Link href="/memorial/guide" className="btn">
          이용 방법
        </Link>
        <Link href="/memorial/plans" className="btn">
          요금·플랜
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

      <section className="panel memorial-split-note">
        <h2>서비스상품과의 구분</h2>
        <p>
          「추모 대행」(현장 헌화·관리)은 <Link href="/services/memorial">서비스상품 &gt; 추모</Link>에서 안내합니다.
          사이버 추모관은 디지털 보관·타임라인 서비스로, 탐색기 「사이버 추모관」 메뉴와 우측 단축키(로그인 후)에서
          이용하실 수 있습니다.
        </p>
      </section>
    </article>
  );
}
