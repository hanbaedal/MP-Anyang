"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { HomeHeroSettings } from "@/lib/home-hero-types";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** 서버·클라이언트 타임존이 달라도 hydration 어긋나지 않게, 마운트 후에만 포맷 */
function useSeoulDateLabel(iso: string | undefined) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!iso) {
      setLabel("");
      return;
    }
    setLabel(
      new Date(iso).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    );
  }, [iso]);
  return label;
}

export function ManageHomeHero({ initial }: { initial: HomeHeroSettings }) {
  const [settings, setSettings] = useState(initial);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [pendingAudio, setPendingAudio] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const savedAtLabel = useSeoulDateLabel(settings.updatedAt);

  const pendingVideoUrl = useMemo(
    () => (pendingVideo ? URL.createObjectURL(pendingVideo) : null),
    [pendingVideo],
  );
  const pendingAudioUrl = useMemo(
    () => (pendingAudio ? URL.createObjectURL(pendingAudio) : null),
    [pendingAudio],
  );

  useEffect(() => {
    return () => {
      if (pendingVideoUrl) URL.revokeObjectURL(pendingVideoUrl);
    };
  }, [pendingVideoUrl]);
  useEffect(() => {
    return () => {
      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    };
  }, [pendingAudioUrl]);

  const busy = status === "busy";
  const canSave = Boolean(pendingVideo || pendingAudio);

  async function saveToDb() {
    if (!canSave) return;
    setStatus("busy");
    setMessage("");
    const form = new FormData();
    if (pendingVideo) form.set("video", pendingVideo);
    if (pendingAudio) form.set("audio", pendingAudio);
    try {
      const res = await fetch("/api/manage/home-hero", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "저장에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setPendingVideo(null);
      setPendingAudio(null);
      setStatus("ok");
      setMessage("MongoDB에 저장했습니다. 이전 업로드 파일은 교체·삭제되었습니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  const videoLabel = settings.videos[0]?.label || "영상";
  const audioLabel = settings.audios[0]?.label || "음악";

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-3 py-6 sm:px-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        영상·음악은 각각 1개만 보관됩니다. 새로 등록해 저장하면 이전 파일이 바뀌며 삭제됩니다. 영상만, 또는 영상+음악을
        함께 저장할 수 있습니다.
      </p>

      <section className="space-y-3 rounded-lg border-2 border-primary/25 bg-card p-3 sm:p-4">
        <h2 className="text-sm font-medium">현재 등록·공개 중</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">영상 · {videoLabel}</p>
            <p className="truncate text-[11px] text-muted-foreground">{settings.videoSrc}</p>
            <video
              key={settings.videoSrc}
              src={settings.videoSrc}
              className="aspect-video w-full rounded-lg bg-muted object-cover"
              controls
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">음악 · {audioLabel}</p>
            <p className="truncate text-[11px] text-muted-foreground">{settings.audioSrc}</p>
            <audio key={settings.audioSrc} src={settings.audioSrc} className="w-full" controls preload="metadata" />
          </div>
        </div>
        {savedAtLabel ? (
          <p className="text-[11px] text-muted-foreground">마지막 저장: {savedAtLabel}</p>
        ) : settings.updatedAt ? (
          <p className="text-[11px] text-muted-foreground">마지막 저장: …</p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-3 sm:p-4">
        <h2 className="text-sm font-medium">새 파일 등록</h2>
        <div className="flex flex-wrap gap-2">
          <label>
            <Button type="button" size="sm" variant="outline" disabled={busy} asChild>
              <span>1. 영상 등록</span>
            </Button>
            <input
              type="file"
              accept="video/mp4,video/webm,.mp4,.webm"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPendingVideo(file);
                setMessage("");
                e.target.value = "";
              }}
            />
          </label>
          <label>
            <Button type="button" size="sm" variant="outline" disabled={busy} asChild>
              <span>2. 음악 등록</span>
            </Button>
            <input
              type="file"
              accept="audio/mpeg,.mp3,.wav,.m4a"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPendingAudio(file);
                setMessage("");
                e.target.value = "";
              }}
            />
          </label>
          <Button type="button" size="sm" disabled={busy || !canSave} onClick={() => void saveToDb()}>
            {busy ? "저장 중…" : "3. MongoDB 저장"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          영상 25MB · 음악 12MB 이하 · 저장 전에는 아래에만 미리 보이며, 홈에는 반영되지 않습니다.
        </p>

        {pendingVideo || pendingAudio ? (
          <div className="space-y-3 rounded-md border border-dashed border-primary/30 bg-muted/40 p-3">
            <p className="text-xs font-medium text-primary">저장 대기</p>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingVideo && pendingVideoUrl ? (
                <div className="space-y-2">
                  <p className="truncate text-xs">
                    영상: {pendingVideo.name} ({formatBytes(pendingVideo.size)})
                  </p>
                  <video
                    src={pendingVideoUrl}
                    className="aspect-video w-full rounded-md bg-muted object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setPendingVideo(null)}>
                    영상 선택 취소
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">영상: 변경 없음 (현재 공개 유지)</p>
              )}
              {pendingAudio && pendingAudioUrl ? (
                <div className="space-y-2">
                  <p className="truncate text-xs">
                    음악: {pendingAudio.name} ({formatBytes(pendingAudio.size)})
                  </p>
                  <audio src={pendingAudioUrl} className="w-full" controls preload="metadata" />
                  <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setPendingAudio(null)}>
                    음악 선택 취소
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">음악: 변경 없음 (현재 공개 유지)</p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {message ? (
        <p className={status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{message}</p>
      ) : null}
    </div>
  );
}
