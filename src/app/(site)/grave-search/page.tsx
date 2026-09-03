import { readSession } from "../../../lib/auth";
import { findUserById, getGravesByPlotNos, getParkPhotos, searchGrave, serializeDoc, toId } from "../../../lib/store";
import type { Relation } from "../../../lib/store";
import { GraveSearchClient } from "./GraveSearchClient";

export default async function GraveSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await readSession();
  const parkPhotos = (await getParkPhotos()).map((p) => ({
    title: String(p.title),
    imageUrl: String(p.imageUrl),
    season: p.season ? String(p.season) : undefined,
  }));

  let memberPlots: ReturnType<typeof serializeDoc>[] = [];
  if (user && user.role === "member") {
    const doc = await findUserById(user.id);
    const plotNos = [
      String(doc?.plotNo || ""),
      ...((doc?.relations as Relation[] | undefined) || []).map((r) => r.plotNo),
    ].filter(Boolean);
    memberPlots = (await getGravesByPlotNos(plotNos)).map(serializeDoc);
  }

  const searchResults = q ? (await searchGrave(q)).map(serializeDoc) : [];

  return (
    <article className="article">
      <p className="kicker">서비스</p>
      <h1>묘역찾기</h1>
      <p className="lead">로그인 후 등록 묘역을 확인하거나, 성함·묘번으로 검색할 수 있습니다.</p>

      <form className="panel form-grid" method="GET">
        <label>
          검색어
          <input name="q" defaultValue={q} placeholder="예: 김 / A-101 / 김○○" />
        </label>
        <button className="btn btn-primary" type="submit">검색</button>
      </form>

      <GraveSearchClient
        memberPlots={memberPlots as never[]}
        parkPhotos={parkPhotos}
        searchResults={searchResults as never[]}
        query={q}
        loggedIn={Boolean(user)}
      />
    </article>
  );
}
