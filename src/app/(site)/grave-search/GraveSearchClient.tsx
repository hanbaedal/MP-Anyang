"use client";

import { useMemo, useState } from "react";
import { GraveModal, type GraveView } from "../../../components/GraveModal";

type Props = {
  memberPlots: GraveView[];
  parkPhotos: { title: string; imageUrl: string; season?: string }[];
  searchResults: GraveView[];
  query: string;
  loggedIn: boolean;
};

export function GraveSearchClient({ memberPlots, parkPhotos, searchResults, query, loggedIn }: Props) {
  const [selected, setSelected] = useState<GraveView | null>(null);
  const list = useMemo(() => (query ? searchResults : memberPlots), [query, searchResults, memberPlots]);

  return (
    <>
      {!loggedIn && !query && (
        <p className="alert">로그인하면 등록된 묘역을 바로 확인할 수 있습니다.</p>
      )}

      {loggedIn && !query && memberPlots.length > 0 && (
        <p className="ok">회원님께 등록된 묘역 {memberPlots.length}건</p>
      )}

      <div className="list">
        {list.length ? list.map((item) => (
          <button type="button" key={item._id} className="list-item list-btn" onClick={() => setSelected(item)}>
            <h3>{item.deceasedName} · {item.plotNo}</h3>
            <p>구역: {item.zone} / 형태: {item.type}</p>
            <div className="meta">안치일: {item.buriedAt}</div>
          </button>
        )) : query ? (
          <p className="alert">검색 결과가 없습니다.</p>
        ) : loggedIn ? (
          <p className="alert">등록된 묘역이 없습니다. 내정보에서 묘역번호를 확인해 주세요.</p>
        ) : null}
      </div>

      {selected && <GraveModal grave={selected} parkPhotos={parkPhotos} onClose={() => setSelected(null)} />}
    </>
  );
}
