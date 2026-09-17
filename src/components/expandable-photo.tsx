"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { ImageLightboxDialog } from "@/components/image-lightbox-dialog";

export function ExpandablePhoto({
  src,
  alt,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "relative block w-full cursor-zoom-in overflow-hidden rounded-xl bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
        onClick={() => setOpen(true)}
        aria-label={alt ? `${alt} 원본 보기` : "사진 원본 보기"}
      >
        <Image src={mediaUrl(src)} alt={alt} fill className="object-cover" sizes={sizes} priority={priority} />
      </button>
      <ImageLightboxDialog open={open} onOpenChange={setOpen} src={src} alt={alt} />
    </>
  );
}
