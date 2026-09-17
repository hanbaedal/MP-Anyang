"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { mediaUrl } from "@/lib/media";

const dialogClassName =
  "w-[min(calc(100vw-1rem),72rem)] max-w-none border-none bg-transparent p-0 shadow-none sm:w-[min(calc(100vw-2.5rem),72rem)] sm:max-w-none [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/20";

const imageClassName =
  "max-h-[min(78dvh,calc(100vw-1.5rem))] w-auto max-w-full object-contain sm:max-h-[min(85dvh,calc(100vw-3rem))]";

export function ImageLightboxDialog({
  open,
  onOpenChange,
  src,
  alt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <figure className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full items-center justify-center rounded-xl bg-black/80 p-1 sm:p-2">
            <Image
              src={mediaUrl(src)}
              alt={alt}
              width={1920}
              height={1440}
              className={imageClassName}
              sizes="(max-width: 640px) 100vw, 72rem"
            />
          </div>
          {alt ? (
            <figcaption className="max-w-full px-1 text-center text-sm text-white drop-shadow-sm">{alt}</figcaption>
          ) : null}
        </figure>
      </DialogContent>
    </Dialog>
  );
}
