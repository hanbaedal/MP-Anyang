import { MAP, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function DirectionsMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={MAP.naverDirections} target="_blank" rel="noreferrer">
            네이버 길찾기
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={MAP.kakaoDirections} target="_blank" rel="noreferrer">
            카카오 길찾기
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={MAP.naverSearch} target="_blank" rel="noreferrer">
            지도에서 보기
          </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {SITE.address} · 전화{" "}
        <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
          {SITE.phone}
        </a>
      </p>
      <iframe
        title="(재)안양공원묘원 위치"
        src={MAP.osmEmbed}
        className={compact ? "h-56 w-full rounded-xl border" : "h-80 w-full rounded-xl border md:h-96"}
        loading="lazy"
      />
    </div>
  );
}
