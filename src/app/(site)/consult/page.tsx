import { ConsultFormClient } from "./ConsultFormClient";

export default async function ConsultPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; source?: string; type?: string }>;
}) {
  const { ok, source, type } = await searchParams;
  const lotDefault = type === "memorial" ? "추모 대행" : "봉안묘";
  const sourceValue = source || (type === "memorial" ? "memorial" : "consult");

  return (
    <article className="article">
      <p className="kicker">서비스</p>
      <h1>상담신청</h1>
      <p className="lead">분양, 상조, 추모, 리모델링 상담을 남겨 주시면 담당자가 연락드립니다.</p>
      <p className="meta">
        묘역 유형을 선택하면 <a href="/lots/fees">임시 요금표</a> 기준 분양가·연관리비가 표시됩니다.
      </p>
      {ok === "1" && <p className="ok">상담 신청이 접수되었습니다. 담당자가 연락드리겠습니다.</p>}
      <ConsultFormClient lotDefault={lotDefault} sourceValue={sourceValue} />
    </article>
  );
}
