"use client";

import Image from "next/image";
import { useState } from "react";

export type GraveView = {
  _id: string;
  plotNo: string;
  deceasedName: string;
  familyName: string;
  zone: string;
  type: string;
  buriedAt: string;
  mapNote?: string;
  mapImage?: string;
  photos?: string[];
  lastInspectedAt?: string;
  inspectNote?: string;
};

type ParkPhoto = { title: string; imageUrl: string; season?: string };

export function GraveModal({
  grave,
  parkPhotos,
  onClose,
}: {
  grave: GraveView;
  parkPhotos: ParkPhoto[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"info" | "map" | "park" | "grave">("info");
  const photos = (grave.photos || []).filter(Boolean);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>{grave.plotNo} · {grave.deceasedName}</h2>
        <div className="tab-row">
          <button type="button" className={`tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>묘역 정보</button>
          <button type="button" className={`tab ${tab === "map" ? "active" : ""}`} onClick={() => setTab("map")}>약도</button>
          <button type="button" className={`tab ${tab === "park" ? "active" : ""}`} onClick={() => setTab("park")}>공원 풍광</button>
          <button type="button" className={`tab ${tab === "grave" ? "active" : ""}`} onClick={() => setTab("grave")}>묘역 사진</button>
        </div>

        {tab === "info" && (
          <div className="form-grid">
            <p><strong>구역:</strong> {grave.zone}</p>
            <p><strong>형태:</strong> {grave.type}</p>
            <p><strong>성씨:</strong> {grave.familyName}</p>
            <p><strong>안치일:</strong> {grave.buriedAt}</p>
            {grave.lastInspectedAt ? <p><strong>최근 점검:</strong> {grave.lastInspectedAt}</p> : null}
            {grave.inspectNote ? <p><strong>점검 메모:</strong> {grave.inspectNote}</p> : null}
          </div>
        )}

        {tab === "map" && (
          <div className="form-grid">
            <p>{grave.mapNote || "약도 안내가 등록되지 않았습니다."}</p>
            {grave.mapImage ? (
              <Image src={grave.mapImage} alt={`${grave.plotNo} 약도`} width={800} height={500} className="modal-image" unoptimized />
            ) : (
              <p className="meta">관리자가 약도 이미지를 등록하면 여기에 표시됩니다.</p>
            )}
          </div>
        )}

        {tab === "park" && (
          <div className="gallery-grid">
            {parkPhotos.length ? parkPhotos.map((p, i) => (
              <figure key={i}>
                <Image src={p.imageUrl} alt={p.title} width={400} height={260} unoptimized />
                <figcaption>{p.title}{p.season ? ` (${p.season})` : ""}</figcaption>
              </figure>
            )) : <p className="meta">등록된 공원 풍광이 없습니다.</p>}
          </div>
        )}

        {tab === "grave" && (
          <div className="gallery-grid">
            {photos.length ? photos.map((src, i) => (
              <figure key={i}>
                <Image src={src} alt={`${grave.plotNo} 사진 ${i + 1}`} width={400} height={260} unoptimized />
                <figcaption>{grave.plotNo} — {i + 1}번 사진</figcaption>
              </figure>
            )) : <p className="meta">등록된 묘역 사진이 없습니다. 명절 전후 관리자 점검 사진이 업데이트됩니다.</p>}
          </div>
        )}

        <button type="button" className="btn btn-sm" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
