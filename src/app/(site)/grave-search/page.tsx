import { searchGrave } from "../../../lib/store";

export default async function GraveSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchGrave(q);

  return (
    <article className="article">
      <p className="kicker">서비스</p>
      <h1>묘역찾기</h1>
      <p className="lead">고인 성함, 성씨, 묘번으로 검색할 수 있습니다.</p>

      <form className="panel form-grid" method="GET">
        <label>
          검색어
          <input name="q" defaultValue={q} placeholder="예: 김 / A-101 / 김○○" />
        </label>
        <button className="btn btn-primary" type="submit">
          검색
        </button>
      </form>

      {q ? (
        <div className="list">
          {results.length ? (
            results.map((item) => (
              <div className="list-item" key={String(item._id)}>
                <h3>{String(item.deceasedName)} · {String(item.plotNo)}</h3>
                <p>
                  구역: {String(item.zone)} / 형태: {String(item.type)}
                </p>
                <div className="meta">안치일: {String(item.buriedAt)}</div>
              </div>
            ))
          ) : (
            <p className="alert">검색 결과가 없습니다. 성함 일부 또는 묘번으로 다시 검색해 주세요.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
