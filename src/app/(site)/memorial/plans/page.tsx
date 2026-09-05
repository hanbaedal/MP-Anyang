import { Suspense } from "react";
import { readSession } from "../../../../lib/auth";
import { billingMode } from "../../../../lib/memorial-billing";
import { MEMORIAL_BILLING_NOTE, MEMORIAL_PLANS } from "../../../../lib/memorial-info";
import { ensureMemberMemorialHalls } from "../../../../lib/memorial-store";
import { findUserById } from "../../../../lib/store";
import type { Relation } from "../../../../lib/store";
import { MemorialPlansClient } from "../../../../components/MemorialPlansClient";
import Link from "next/link";

export default async function MemorialPlansPage() {
  const user = await readSession();
  const mode = billingMode();
  let halls: { code: string; deceasedName: string; plotNo: string }[] = [];

  if (user) {
    const doc = await findUserById(user.id);
    if (doc) {
      const relations = (doc.relations as Relation[] | undefined) || [];
      const plotNo = String(doc.plotNo || "");
      const allRels =
        relations.length > 0 ? relations : plotNo ? [{ deceasedName: "", relation: "본인", plotNo }] : [];
      halls = (await ensureMemberMemorialHalls(user.id, allRels)).map((h) => ({
        code: String(h.code),
        deceasedName: String(h.deceasedName ?? ""),
        plotNo: String(h.plotNo ?? ""),
      }));
    }
  }

  return (
    <article className="article memorial-plans-page">
      <p className="kicker">사이버 추모관</p>
      <h1>요금·플랜</h1>
      <p className="lead">{MEMORIAL_BILLING_NOTE}</p>
      {mode === "mock" && (
        <p className="meta memorial-billing-mode-note">
          현재 테스트 결제 모드 — 실제 과금 없이 연간권을 발급해 기능을 확인할 수 있습니다.
        </p>
      )}

      <Suspense fallback={<p className="meta">불러오는 중…</p>}>
        <MemorialPlansClient plans={MEMORIAL_PLANS} loggedIn={Boolean(user)} halls={halls} billingMode={mode} />
      </Suspense>

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
              플랜 카드를 클릭 → 추모관 지정 → 결제(현재는 테스트 모드) → 1년 이용. 실제 PG 연동은 추후
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
