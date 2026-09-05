import Link from "next/link";

export default async function MemorialBillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ hall?: string; plan?: string; expires?: string }>;
}) {
  const { hall, plan, expires } = await searchParams;
  const expiresLabel = expires ? new Date(expires).toLocaleDateString("ko-KR") : "—";

  return (
    <article className="article memorial-billing-success">
      <p className="kicker">사이버 추모관</p>
      <h1>연간권이 발급되었습니다</h1>
      <p className="ok">결제가 완료되었습니다. 선택하신 추모관에서 업로드·편집 요청을 이용하실 수 있습니다.</p>

      <section className="panel">
        <dl className="memorial-diff-dl">
          <div>
            <dt>추모관</dt>
            <dd><code>{hall || "—"}</code></dd>
          </div>
          <div>
            <dt>플랜</dt>
            <dd>{plan === "premium" ? "프리미엄 연간권" : plan === "standard" ? "스탠다드 연간권" : plan || "—"}</dd>
          </div>
          <div>
            <dt>만료일</dt>
            <dd>{expiresLabel}</dd>
          </div>
        </dl>
        <div className="memorial-guide-actions">
          {hall ? (
            <Link href={`/memorial/${hall}`} className="btn btn-primary btn-sm">
              추모관으로
            </Link>
          ) : null}
          <Link href="/memorial/my" className="btn btn-sm">
            내 추모관
          </Link>
        </div>
      </section>
    </article>
  );
}
