"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

const shellClassName =
  "fixed inset-0 z-50 !top-0 !left-0 flex h-[100dvh] w-screen max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-black/92 p-0 shadow-none sm:max-w-none [&_[data-slot=dialog-overlay]]:bg-black/92 [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:z-10 [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/20";

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) setLoaded(false);
  }, [open, src]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={shellClassName} showCloseButton>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <figure className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pt-12 pb-4">
          <div className="relative flex h-[calc(100dvh-5rem)] w-full max-w-[100vw] items-center justify-center">
            {!loaded ? (
              <p className="absolute text-sm text-white/70" aria-live="polite">
                원본 불러오는 중…
              </p>
            ) : null}
            <Image
              key={src}
              src={mediaUrl(src)}
              alt={alt}
              width={2400}
              height={1800}
              quality={90}
              priority
              sizes="100vw"
              onLoad={() => setLoaded(true)}
              className={cn(
                "max-h-[calc(100dvh-5rem)] w-auto max-w-[min(100vw-1rem,2400px)] object-contain transition-opacity duration-200",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
          {alt ? (
            <figcaption className="mt-2 max-w-[min(100vw-2rem,48rem)] px-2 text-center text-sm text-white/90">{alt}</figcaption>
          ) : null}
        </figure>
      </DialogContent>
    </Dialog>
  );
}
