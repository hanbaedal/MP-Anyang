import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "../../../../lib/auth";
import { listMemberSubscriptions, subscriptionLabel } from "../../../../lib/memorial-billing";
import { ensureMemberMemorialHalls, syncHall } from "../../../../lib/memorial-store";
import { findUserById } from "../../../../lib/store";
import type { Relation } from "../../../../lib/store";

export default async function MyMemorialPage() {
  const session = await readSession();
  if (!session) redirect("/login?next=/memorial/my");

  const doc = await findUserById(session.id);
  if (!doc) redirect("/login");

  const relations = (doc.relations as Relation[] | undefined) || [];
  const plotNo = String(doc.plotNo || "");
  const allRels =
    relations.length > 0
      ? relations
      : plotNo
        ? [{ deceasedName: "", relation: "본인", plotNo }]
        : [];

  const halls = await ensureMemberMemorialHalls(session.id, allRels);
  for (const hall of halls) {
    await syncHall(hall);
  }

  const subs = await listMemberSubscriptions(session.id);
  const subByHall = new Map(subs.map((s) => [s.hallCode, s]));

  return (
    <article className="article">
      <p className="kicker">사이버 추모관</p>
      <h1>내 추모관</h1>
      <p className="lead">등록하신 망자·묘역번호에 연결된 디지털 추모공간입니다.</p>

      {!halls.length ? (
        <section className="panel">
          <p className="meta">연결된 묘역이 없습니다. 내정보에서 망자·묘역번호를 등록해 주세요.</p>
          <Link href="/mypage" className="btn btn-primary">
            내정보 수정
          </Link>
        </section>
      ) : (
        <div className="memorial-my-grid">
          {halls.map((hall) => {
            const sub = subByHall.get(String(hall.code));
            return (
              <Link key={hall.code} href={`/memorial/${hall.code}`} className="panel memorial-my-card">
                <p className="kicker">{hall.plotNo || "묘역"}</p>
                <h2>{hall.deceasedName}님</h2>
                {sub ? (
                  <p className="meta memorial-sub-active">
                    {subscriptionLabel(sub.planId)} · ~{new Date(sub.expiresAt).toLocaleDateString("ko-KR")}
                  </p>
                ) : String(hall.code).startsWith("DEMO-") ? (
                  <p className="meta">데모 추모관</p>
                ) : (
                  <p className="meta memorial-sub-none">
                    연간권 없음 · <Link href="/memorial/plans">구매</Link>
                  </p>
                )}
                <p className="meta">추모관 바로가기 →</p>
              </Link>
            );
          })}
        </div>
      )}

      <section className="panel memorial-intro-steps">
        <h2>이용 안내</h2>
        <ol>
          <li>연간권 구매 후 사진·동영상·추모 글을 올리면 타임라인에 쌓입니다.</li>
          <li>기일·설·추석 등 추모 시점에 묘역 사진과 함께 자동 갱신됩니다.</li>
          <li>편집 추모영상 요청(프리미엄) 시 운영팀이 생전·가족 자료로 영상을 제작합니다.</li>
        </ol>
        <div className="memorial-guide-actions">
          <Link href="/memorial/plans" className="btn btn-primary btn-sm">
            연간권 구매
          </Link>
          <Link href="/memorial/guide" className="btn btn-sm">
            이용 방법
          </Link>
        </div>
      </section>
    </article>
  );
}
