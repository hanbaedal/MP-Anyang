"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ParkMapIllustration } from "./ParkMapIllustration";

export type GallerySlide = {
  src: string;
  alt: string;
  caption?: string;
};

export type LightboxItem =
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "gallery"; items: GallerySlide[]; index: number }
  | { kind: "map"; zone: string; plotNo: string; caption?: string };

type Props = {
  item: LightboxItem;
  onClose: () => void;
};

export function ImageLightbox({ item, onClose }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(item.kind === "gallery" ? item.index : 0);

  useEffect(() => {
    if (item.kind !== "gallery") return;
    setActiveIndex(item.index);
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[item.index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "instant", inline: "start", block: "nearest" });
  }, [item]);

  const onGalleryScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(index);
  };

  const scrollGallery = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  const galleryItems = item.kind === "gallery" ? item.items : [];
  const galleryCount = galleryItems.length;
  const currentCaption =
    item.kind === "gallery"
      ? galleryItems[activeIndex]?.caption
      : item.kind === "image"
        ? item.caption
        : item.caption;

  return (
    <div
      className="lightbox-backdrop lightbox-fs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="크게 보기"
    >
      <div className="lightbox lightbox-panel-fs" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-head">
          <div className="lightbox-head-meta">
            {currentCaption ? <p className="lightbox-caption">{currentCaption}</p> : null}
            {item.kind === "gallery" && galleryCount > 1 ? (
              <p className="lightbox-counter">
                {activeIndex + 1} / {galleryCount}
              </p>
            ) : null}
          </div>
          <button type="button" className="btn btn-sm lightbox-close" onClick={onClose}>
            닫기
          </button>
        </div>

        {item.kind === "map" ? (
          <div className="lightbox-map-wrap">
            <ParkMapIllustration zone={item.zone} plotNo={item.plotNo} />
          </div>
        ) : item.kind === "gallery" ? (
          <div className="lightbox-gallery-shell">
            {galleryCount > 1 ? (
              <button
                type="button"
                className="lightbox-nav lightbox-nav-prev"
                onClick={() => scrollGallery(-1)}
                aria-label="이전 사진"
                disabled={activeIndex === 0}
              >
                ‹
              </button>
            ) : null}
            <div ref={trackRef} className="lightbox-gallery-track" onScroll={onGalleryScroll}>
              {galleryItems.map((slide) => (
                <figure key={slide.src + slide.alt} className="lightbox-gallery-slide">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={1600}
                    height={1200}
                    className="lightbox-image lightbox-image-fs"
                    unoptimized
                  />
                </figure>
              ))}
            </div>
            {galleryCount > 1 ? (
              <button
                type="button"
                className="lightbox-nav lightbox-nav-next"
                onClick={() => scrollGallery(1)}
                aria-label="다음 사진"
                disabled={activeIndex >= galleryCount - 1}
              >
                ›
              </button>
            ) : null}
          </div>
        ) : (
          <Image
            src={item.src}
            alt={item.alt}
            width={1600}
            height={1200}
            className="lightbox-image lightbox-image-fs"
            unoptimized
          />
        )}
      </div>
    </div>
  );
}
