import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MemorialCheckoutClient } from "../../../../components/MemorialCheckoutClient";
import { readSession } from "../../../../lib/auth";
import { billingMode } from "../../../../lib/memorial-billing";
import { ensureMemberMemorialHalls } from "../../../../lib/memorial-store";
import { findUserById } from "../../../../lib/store";
import type { Relation } from "../../../../lib/store";

export default async function MemorialCheckoutPage() {
  const session = await readSession();
  if (!session) redirect("/login?next=/memorial/checkout");

  const doc = await findUserById(session.id);
  if (!doc) redirect("/login");

  const relations = (doc.relations as Relation[] | undefined) || [];
  const plotNo = String(doc.plotNo || "");
  const allRels =
    relations.length > 0 ? relations : plotNo ? [{ deceasedName: "", relation: "본인", plotNo }] : [];

  const halls = (await ensureMemberMemorialHalls(session.id, allRels)).map((h) => ({
    code: String(h.code),
    deceasedName: String(h.deceasedName ?? ""),
    plotNo: String(h.plotNo ?? ""),
  }));

  return (
    <article className="article memorial-checkout-page">
      <p className="kicker">사이버 추모관</p>
      <h1>연간권 결제</h1>
      <p className="lead">선택한 추모관 1개에 1년 이용권이 적용됩니다.</p>

      <Suspense fallback={<p className="meta">불러오는 중…</p>}>
        <MemorialCheckoutClient halls={halls} billingMode={billingMode()} />
      </Suspense>

      <p className="meta memorial-checkout-note">
        실제 카드·계좌 결제(PG) 연동은 <code>MEMORIAL_BILLING_MODE=pg</code> 설정 후 진행합니다.
      </p>
    </article>
  );
}
