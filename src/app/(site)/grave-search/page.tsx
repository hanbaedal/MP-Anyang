import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readSession } from "../../../lib/auth";
import { createGrave, deleteGrave, searchGrave, toId } from "../../../lib/store";

async function addGrave(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await createGrave({
    plotNo: String(formData.get("plotNo") || ""),
    deceasedName: String(formData.get("deceasedName") || ""),
    familyName: String(formData.get("familyName") || ""),
    zone: String(formData.get("zone") || ""),
    type: String(formData.get("type") || ""),
    buriedAt: String(formData.get("buriedAt") || ""),
  });
  revalidatePath("/grave-search");
  redirect("/grave-search");
}

async function removeGrave(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await deleteGrave(String(formData.get("id")));
  revalidatePath("/grave-search");
  redirect("/grave-search");
}

export default async function GraveSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await readSession();
  const isAdmin = user?.role === "admin";
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
        <button className="btn btn-primary" type="submit">검색</button>
      </form>

      {isAdmin && (
        <form action={addGrave} className="panel form-grid admin-form">
          <p className="admin-badge">관리자 — 묘역 등록</p>
          <label>묘번<input name="plotNo" required placeholder="A-101" /></label>
          <label>고인 성함<input name="deceasedName" required /></label>
          <label>성씨<input name="familyName" required /></label>
          <label>구역<input name="zone" required placeholder="A구역" /></label>
          <label>형태
            <select name="type">
              <option>봉안묘</option>
              <option>수목장</option>
              <option>매장묘</option>
              <option>평장묘</option>
            </select>
          </label>
          <label>안치일<input name="buriedAt" type="date" required /></label>
          <button className="btn btn-primary" type="submit">묘역 등록</button>
        </form>
      )}

      {q ? (
        <div className="list">
          {results.length ? (
            results.map((item) => (
              <div className="list-item" key={String(item._id)}>
                <h3>{String(item.deceasedName)} · {String(item.plotNo)}</h3>
                <p>구역: {String(item.zone)} / 형태: {String(item.type)}</p>
                <div className="meta">안치일: {String(item.buriedAt)}</div>
                {isAdmin && (
                  <div className="admin-actions">
                    <form action={removeGrave}>
                      <input type="hidden" name="id" value={toId(item._id)} />
                      <button className="btn btn-danger btn-sm" type="submit">삭제</button>
                    </form>
                  </div>
                )}
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
