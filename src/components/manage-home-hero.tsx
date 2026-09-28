"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HOME_HERO_SEASON_LABELS,
  type HomeHeroAsset,
  type HomeHeroAssetKind,
  type HomeHeroSeasonTag,
  type HomeHeroSettings,
} from "@/lib/home-hero-types";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function seasonLabel(season: HomeHeroSeasonTag) {
  if (!season) return "";
  return HOME_HERO_SEASON_LABELS[season as keyof typeof HOME_HERO_SEASON_LABELS] ?? "";
}

function AssetRow({
  item,
  kind,
  activeSrc,
  busy,
  onApply,
  onSaveMeta,
  onReplace,
  onDelete,
}: {
  item: HomeHeroAsset;
  kind: HomeHeroAssetKind;
  activeSrc: string;
  busy: boolean;
  onApply: () => void;
  onSaveMeta: (patch: { label: string; season: HomeHeroSeasonTag; memo: string }) => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(item.label);
  const [season, setSeason] = useState<HomeHeroSeasonTag>(item.season);
  const [memo, setMemo] = useState(item.memo);
  const isActive = activeSrc === item.src;
  const builtin = item.id === "builtin-video" || item.id === "builtin-audio";

  return (
    <li className="space-y-3 rounded-lg border px-3 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <input className={field} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="이름 (예: 2026 봄 전경)" />
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className={field}
              value={season}
              onChange={(e) => setSeason(e.target.value as HomeHeroSeasonTag)}
            >
              <option value="">계절 태그 없음</option>
              {(Object.keys(HOME_HERO_SEASON_LABELS) as Array<keyof typeof HOME_HERO_SEASON_LABELS>).map((key) => (
                <option key={key} value={key}>
                  {HOME_HERO_SEASON_LABELS[key]}
                </option>
              ))}
            </select>
            <input className={field} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모 (선택)" />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {item.src}
            {seasonLabel(season) ? ` · ${seasonLabel(season)}` : null}
            {isActive ? <span className="ml-2 font-medium text-primary">공개 중</span> : null}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onSaveMeta({ label, season, memo })}>
            저장
          </Button>
          <Button type="button" size="sm" variant={isActive ? "secondary" : "default"} disabled={busy || isActive} onClick={onApply}>
            공개에 사용
          </Button>
          {!builtin ? (
            <label className="cursor-pointer text-center text-xs text-primary underline-offset-2 hover:underline">
              파일 교체
              <input
                type="file"
                className="sr-only"
                accept={kind === "video" ? "video/mp4,video/webm,.mp4,.webm" : "audio/mpeg,.mp3,.wav,.m4a"}
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onReplace(file);
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
          {!builtin ? (
            <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={onDelete}>
              삭제
            </Button>
          ) : null}
        </div>
      </div>
      {kind === "video" ? (
        <video src={item.src} className="aspect-video max-h-48 w-full rounded-md bg-muted object-cover" controls muted playsInline preload="metadata" />
      ) : (
        <audio src={item.src} className="w-full" controls preload="metadata" />
      )}
    </li>
  );
}

export function ManageHomeHero({ initial }: { initial: HomeHeroSettings }) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [applyOnUpload, setApplyOnUpload] = useState(true);
  const [uploadSeason, setUploadSeason] = useState<HomeHeroSeasonTag>("");
  const [uploadLabel, setUploadLabel] = useState("");

  const sortedVideos = useMemo(() => sortAssets(settings.videos), [settings.videos]);
  const sortedAudios = useMemo(() => sortAssets(settings.audios), [settings.audios]);

  async function refresh() {
    const res = await fetch("/api/manage/home-hero");
    const json = (await res.json()) as { ok?: boolean; settings?: HomeHeroSettings };
    if (json.settings) setSettings(json.settings);
  }

  async function upload(kind: "video" | "audio" | "poster", file: File) {
    setStatus("busy");
    setMessage("");
    const form = new FormData();
    form.set("action", "create");
    form.set("kind", kind);
    form.set("file", file);
    form.set("applyPublic", applyOnUpload ? "1" : "0");
    if (uploadLabel.trim()) form.set("label", uploadLabel.trim());
    if (uploadSeason) form.set("season", uploadSeason);
    try {
      const res = await fetch("/api/manage/home-hero", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "업로드에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setUploadLabel("");
      setStatus("ok");
      setMessage(
        kind === "poster"
          ? "포스터를 바꿨습니다."
          : applyOnUpload
            ? "라이브러리에 추가하고 공개 메인에 적용했습니다."
            : "라이브러리에만 추가했습니다. 「공개에 사용」으로 골라 주세요.",
      );
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function replaceFile(kind: HomeHeroAssetKind, assetId: string, file: File) {
    setStatus("busy");
    setMessage("");
    const form = new FormData();
    form.set("action", "replace");
    form.set("kind", kind);
    form.set("assetId", assetId);
    form.set("file", file);
    try {
      const res = await fetch("/api/manage/home-hero", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "교체에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setStatus("ok");
      setMessage("파일을 교체했습니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function saveMeta(kind: HomeHeroAssetKind, id: string, patch: { label: string; season: HomeHeroSeasonTag; memo: string }) {
    setStatus("busy");
    setMessage("");
    try {
      const res = await fetch("/api/manage/home-hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kind, ...patch }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "저장에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setStatus("ok");
      setMessage("항목 정보를 저장했습니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function applySelection(patch: { videoSrc?: string; audioSrc?: string }) {
    setStatus("busy");
    setMessage("");
    try {
      const res = await fetch("/api/manage/home-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, posterSrc: settings.posterSrc }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "저장에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setStatus("ok");
      setMessage("공개 메인에 반영했습니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function removeAsset(kind: HomeHeroAssetKind, id: string) {
    if (!confirm("이 항목을 목록에서 삭제할까요? 업로드 파일도 지웁니다.")) return;
    setStatus("busy");
    setMessage("");
    try {
      const res = await fetch(`/api/manage/home-hero?id=${encodeURIComponent(id)}&kind=${kind}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "삭제에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setStatus("ok");
      setMessage("삭제했습니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  const busy = status === "busy";

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <strong>DB(MongoDB)</strong>에는 파일 경로·이름·계절 태그·공개 중인 조합만 저장됩니다. 실제 mp4/mp3는 서버 디스크(
        <code className="rounded bg-muted px-1">uploads/home-hero</code>)에 두며, Render 재배포 시 업로드분이 사라질 수 있어{" "}
        <strong>계절별 파일은 PC에도 보관</strong>해 두는 것이 좋습니다. 봄·여름 영상을 미리 올려 두고, 계절이 되면 「공개에 사용」만
        바꾸면 됩니다.
      </p>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">지금 공개 중</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">영상</p>
            <video src={settings.videoSrc} className="aspect-video w-full rounded-lg bg-muted object-cover" controls muted playsInline preload="metadata" />
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">음악</p>
            <audio src={settings.audioSrc} className="w-full" controls preload="metadata" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">재생 전 포스터</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.posterSrc} alt="" className="max-h-40 rounded-lg object-cover" />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-medium">새로 등록 (Create)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">표시 이름 (선택)</span>
            <input className={field} value={uploadLabel} onChange={(e) => setUploadLabel(e.target.value)} placeholder="예: 2026 가을 드론" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">계절 태그</span>
            <select className={field} value={uploadSeason} onChange={(e) => setUploadSeason(e.target.value as HomeHeroSeasonTag)}>
              <option value="">없음</option>
              {(Object.keys(HOME_HERO_SEASON_LABELS) as Array<keyof typeof HOME_HERO_SEASON_LABELS>).map((key) => (
                <option key={key} value={key}>
                  {HOME_HERO_SEASON_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={applyOnUpload} onChange={(e) => setApplyOnUpload(e.target.checked)} />
          올린 직후 공개 메인에 바로 적용
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">동영상 (25MB 이하)</span>
            <input
              type="file"
              accept="video/mp4,video/webm,.mp4,.webm"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload("video", file);
                e.target.value = "";
              }}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">음악 (12MB 이하)</span>
            <input
              type="file"
              accept="audio/mpeg,.mp3,.wav,.m4a"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload("audio", file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">포스터 이미지</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload("poster", file);
              e.target.value = "";
            }}
          />
        </label>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">영상 라이브러리 (Read · Update · Delete)</h2>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void refresh()}>
            새로고침
          </Button>
        </div>
        <ul className="space-y-3">
          {sortedVideos.map((item) => (
            <AssetRow
              key={item.id}
              item={item}
              kind="video"
              activeSrc={settings.videoSrc}
              busy={busy}
              onApply={() => void applySelection({ videoSrc: item.src })}
              onSaveMeta={(patch) => void saveMeta("video", item.id, patch)}
              onReplace={(file) => void replaceFile("video", item.id, file)}
              onDelete={() => void removeAsset("video", item.id)}
            />
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">음악 라이브러리 (Read · Update · Delete)</h2>
        <ul className="space-y-3">
          {sortedAudios.map((item) => (
            <AssetRow
              key={item.id}
              item={item}
              kind="audio"
              activeSrc={settings.audioSrc}
              busy={busy}
              onApply={() => void applySelection({ audioSrc: item.src })}
              onSaveMeta={(patch) => void saveMeta("audio", item.id, patch)}
              onReplace={(file) => void replaceFile("audio", item.id, file)}
              onDelete={() => void removeAsset("audio", item.id)}
            />
          ))}
        </ul>
      </section>

      {message ? (
        <p className={status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{message}</p>
      ) : null}
    </div>
  );
}

const SEASON_ORDER: HomeHeroSeasonTag[] = ["spring", "summer", "autumn", "winter", "year_round", ""];

function sortAssets(list: HomeHeroAsset[]) {
  return [...list].sort((a, b) => {
    const sa = SEASON_ORDER.indexOf(a.season);
    const sb = SEASON_ORDER.indexOf(b.season);
    if (sa !== sb) return sa - sb;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
