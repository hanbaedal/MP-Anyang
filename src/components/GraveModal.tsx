"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getGraveTypeImage } from "../lib/grave-types";
import { ImageLightbox, type GallerySlide, type LightboxItem } from "./ImageLightbox";
import { ParkMapIllustration } from "./ParkMapIllustration";

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

function GalleryThumb({
  src,
  alt,
  caption,
  onOpen,
}: {
  src: string;
  alt: string;
  caption: string;
  onOpen: () => void;
}) {
  return (
    <figure className="gallery-thumb">
      <button type="button" className="gallery-thumb-btn" onClick={onOpen} aria-label={`${caption} 크게 보기`}>
        <Image src={src} alt={alt} width={400} height={260} unoptimized />
      </button>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

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
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const photos = (grave.photos || []).filter(Boolean).slice(0, 5);
  const parkList = parkPhotos.slice(0, 5);
  const typeImage = getGraveTypeImage(grave.type);

  const parkSlides = useMemo<GallerySlide[]>(
    () =>
      parkList.map((p) => ({
        src: p.imageUrl,
        alt: p.title,
        caption: `${p.title}${p.season ? ` (${p.season})` : ""}`,
      })),
    [parkList],
  );

  const graveSlides = useMemo<GallerySlide[]>(
    () =>
      photos.map((src, i) => ({
        src,
        alt: `${grave.plotNo} 사진 ${i + 1}`,
        caption: `${grave.plotNo} — ${i + 1}번 사진`,
      })),
    [photos, grave.plotNo],
  );

  const openGallery = (items: GallerySlide[], index: number) => {
    setLightbox({ kind: "gallery", items, index });
  };

  const openMapFullscreen = () => {
    setLightbox({
      kind: "map",
      zone: grave.zone,
      plotNo: grave.plotNo,
      caption: `${grave.plotNo} · ${grave.deceasedName} 약도`,
    });
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal-wide grave-modal" onClick={(e) => e.stopPropagation()}>
          <h2>
            {grave.plotNo} · {grave.deceasedName}
          </h2>
          <div className="tab-row">
            <button type="button" className={`tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>
              묘역 정보
            </button>
            <button type="button" className={`tab ${tab === "map" ? "active" : ""}`} onClick={() => setTab("map")}>
              약도
            </button>
            <button type="button" className={`tab ${tab === "park" ? "active" : ""}`} onClick={() => setTab("park")}>
              공원 풍광
            </button>
            <button type="button" className={`tab ${tab === "grave" ? "active" : ""}`} onClick={() => setTab("grave")}>
              묘역 사진
            </button>
          </div>

          <div className={`grave-modal-body ${tab === "map" ? "grave-modal-body--map" : ""}`}>
            {tab === "info" && (
              <div className="grave-info-panel">
                <div className="grave-info-fields form-grid">
                  <p>
                    <strong>구역:</strong> {grave.zone}
                  </p>
                  <p>
                    <strong>형태:</strong> {grave.type}
                  </p>
                  <p>
                    <strong>성씨:</strong> {grave.familyName}
                  </p>
                  <p>
                    <strong>안치일:</strong> {grave.buriedAt}
                  </p>
                  {grave.lastInspectedAt ? (
                    <p>
                      <strong>최근 점검:</strong> {grave.lastInspectedAt}
                    </p>
                  ) : null}
                  {grave.inspectNote ? (
                    <p>
                      <strong>점검 메모:</strong> {grave.inspectNote}
                    </p>
                  ) : null}
                </div>
                <figure className="grave-type-visual">
                  <Image
                    src={typeImage.src}
                    alt={typeImage.alt}
                    width={280}
                    height={220}
                    className="grave-type-image"
                    unoptimized
                  />
                </figure>
              </div>
            )}

            {tab === "map" && (
              <div className="grave-map-panel">
                {grave.mapNote ? <p className="grave-map-note">{grave.mapNote}</p> : null}
                <button type="button" className="park-map-click" onClick={openMapFullscreen}>
                  <ParkMapIllustration zone={grave.zone} plotNo={grave.plotNo} />
                  <span className="park-map-hint">약도 클릭 · 전체 화면</span>
                </button>
                {grave.mapImage ? (
                  <button
                    type="button"
                    className="grave-map-detail-link"
                    onClick={() =>
                      setLightbox({
                        kind: "image",
                        src: grave.mapImage!,
                        alt: `${grave.plotNo} 상세 약도`,
                        caption: `${grave.plotNo} 상세 약도`,
                      })
                    }
                  >
                    상세 약도 보기
                  </button>
                ) : null}
              </div>
            )}

            {tab === "park" && (
              <div className="gallery-grid">
                {parkSlides.length ? (
                  parkSlides.map((slide, index) => (
                    <GalleryThumb
                      key={slide.src + slide.alt}
                      src={slide.src}
                      alt={slide.alt}
                      caption={slide.caption || slide.alt}
                      onOpen={() => openGallery(parkSlides, index)}
                    />
                  ))
                ) : (
                  <p className="meta">등록된 공원 풍광이 없습니다.</p>
                )}
              </div>
            )}

            {tab === "grave" && (
              <div className="gallery-grid">
                {graveSlides.length ? (
                  graveSlides.map((slide, index) => (
                    <GalleryThumb
                      key={slide.src + index}
                      src={slide.src}
                      alt={slide.alt}
                      caption={slide.caption || slide.alt}
                      onOpen={() => openGallery(graveSlides, index)}
                    />
                  ))
                ) : (
                  <p className="meta">등록된 묘역 사진이 없습니다. 명절 전후 관리자 점검 사진이 업데이트됩니다.</p>
                )}
              </div>
            )}
          </div>

          <div className="grave-modal-footer">
            <button type="button" className="btn btn-sm" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>

      {lightbox ? <ImageLightbox item={lightbox} onClose={() => setLightbox(null)} /> : null}
    </>
  );
}
