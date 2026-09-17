"use client";

import { MAP, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function DirectionsMap({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={MAP.naverDirections} target="_blank" rel="noreferrer">
            {t("map.naver")}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={MAP.kakaoDirections} target="_blank" rel="noreferrer">
            {t("map.kakao")}
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={MAP.naverSearch} target="_blank" rel="noreferrer">
            {t("map.view")}
          </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {SITE.address} · {t("phone")}{" "}
        <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
          {SITE.phone}
        </a>
      </p>
      <iframe
        title={`${SITE.legalName} ${t("directions")}`}
        src={MAP.osmEmbed}
        className={compact ? "h-56 w-full rounded-xl border" : "h-80 w-full rounded-xl border md:h-96"}
        loading="lazy"
      />
    </div>
  );
}
