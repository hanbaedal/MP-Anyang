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
  /** 저장은 영상 등록이 필수. 음악은 선택(없으면 공란). */
  const canSave = Boolean(pendingVideo);

  async function saveToDb() {
    if (!canSave || !pendingVideo) return;
    setStatus("busy");
    setMessage("");
    const form = new FormData();
    form.set("video", pendingVideo);
    if (pendingAudio) form.set("audio", pendingAudio);
    try {
      const res = await fetch("/api/manage/home-hero", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "저장에 실패했습니다.");
        return;
      }
      const clearedAudio = !pendingAudio;
      setSettings(json.settings);
      setPendingVideo(null);
      setPendingAudio(null);
      setStatus("ok");
      setMessage(
        clearedAudio
          ? "MongoDB에 저장했습니다. 이전 영상·음악을 지우고, 음악은 공란으로 두었습니다."
          : "MongoDB에 저장했습니다. 이전 영상·음악을 지우고 새 파일로 바꿨습니다.",
      );
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  const hasPublicAudio = Boolean(settings.audioSrc);
  const videoLabel = settings.videos[0]?.label || "영상";
  const audioLabel = hasPublicAudio ? settings.audios[0]?.label || "음악" : "없음(공란)";

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-3 py-6 sm:px-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        「MongoDB 저장」을 누르면 기존 영상·음악을 지운 뒤, 이번에 등록한 파일만 남깁니다. 음악 등록이 없으면 음악은
        공란입니다(영상에 사운드가 들어 있는 경우).
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
            {hasPublicAudio ? (
              <>
                <p className="truncate text-[11px] text-muted-foreground">{settings.audioSrc}</p>
                <audio key={settings.audioSrc} src={settings.audioSrc} className="w-full" controls preload="metadata" />
              </>
            ) : (
              <p className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                음악 없음(공란) · 홈에서 별도 BGM 버튼을 숨깁니다
              </p>
            )}
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
          영상 필수(25MB 이하) · 음악 선택(12MB 이하) · 저장 전 미리보기만, 홈 반영은 저장 후
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
                <p className="text-xs text-muted-foreground">영상: 미등록(저장하려면 영상 필요)</p>
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
                <p className="text-xs text-muted-foreground">음악: 미등록 → 저장 시 공란</p>
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
