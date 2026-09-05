"use client";

import Image from "next/image";
import { ParkMapIllustration } from "./ParkMapIllustration";

export type LightboxItem =
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "map"; zone: string; plotNo: string; caption?: string };

type Props = {
  item: LightboxItem;
  onClose: () => void;
};

export function ImageLightbox({ item, onClose }: Props) {
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
          {item.caption ? <p className="lightbox-caption">{item.caption}</p> : <span />}
          <button type="button" className="btn btn-sm lightbox-close" onClick={onClose}>
            닫기
          </button>
        </div>
        {item.kind === "map" ? (
          <div className="lightbox-map-wrap">
            <ParkMapIllustration zone={item.zone} plotNo={item.plotNo} />
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
