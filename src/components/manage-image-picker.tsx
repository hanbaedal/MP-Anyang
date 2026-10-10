"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { thumbUrl } from "@/lib/media";

export function ManageImagePicker({
  src,
  disabled,
  label = "이미지 선택",
  onFile,
}: {
  src: string;
  disabled?: boolean;
  label?: string;
  onFile: (file: File) => void | Promise<void>;
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (!src) return;
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [src]);

  const preview = localPreview || (src ? thumbUrl(src) : "");

  return (
    <div className="flex gap-3">
      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md border bg-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-center text-[11px] leading-tight text-muted-foreground">
            선택한 이미지
            <br />
            미리보기
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <Button type="button" variant="outline" size="sm" className="w-fit" disabled={disabled} asChild>
          <label className="cursor-pointer">
            {src || localPreview ? "다른 이미지" : label}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={disabled}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLocalPreview((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return URL.createObjectURL(file);
                });
                void onFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </Button>
        {src ? <p className="truncate text-[10px] text-muted-foreground">{src}</p> : null}
      </div>
    </div>
  );
}
