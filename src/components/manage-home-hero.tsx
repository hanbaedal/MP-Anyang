"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { HomeHeroSettings } from "@/lib/home-hero-types";

export function ManageHomeHero({ initial }: { initial: HomeHeroSettings }) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/home-hero");
    const json = (await res.json()) as { ok?: boolean; settings?: HomeHeroSettings };
    if (json.settings) setSettings(json.settings);
  }

  async function upload(kind: "video" | "audio" | "poster", file: File, label?: string) {
    setStatus("busy");
    setMessage("");
    const form = new FormData();
    form.set("kind", kind);
    form.set("file", file);
    if (label) form.set("label", label);
    try {
      const res = await fetch("/api/manage/home-hero", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; error?: string; settings?: HomeHeroSettings };
      if (!res.ok || !json.ok || !json.settings) {
        setStatus("error");
        setMessage(json.error || "업로드에 실패했습니다.");
        return;
      }
      setSettings(json.settings);
      setStatus("ok");
      setMessage(kind === "poster" ? "포스터를 바꿨습니다. 공개 메인에 반영됩니다." : "올렸고, 공개 메인에 바로 적용했습니다.");
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
      setMessage("선택한 영상·음악으로 공개 메인을 바꿨습니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <p className="text-sm text-muted-foreground">
        방문자는 메인에서 <strong>재생 버튼을 눌러야</strong> 영상과 음악이 함께 나옵니다. 파일은{" "}
        <code className="rounded bg-muted px-1">public/uploads/home-hero</code> 등에 저장됩니다. Render 무료 디스크는{" "}
        <strong>재배포 시 업로드 파일이 사라질 수</strong> 있으니, 중요한 파일은 로컬에도 보관해 주세요.
      </p>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">지금 공개 중</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">영상</p>
            <video src={settings.videoSrc} className="aspect-video w-full rounded-lg bg-muted object-cover" controls muted playsInline preload="metadata" />
            <p className="mt-1 truncate text-xs text-muted-foreground">{settings.videoSrc}</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">음악</p>
            <audio src={settings.audioSrc} className="w-full" controls preload="metadata" />
            <p className="mt-1 truncate text-xs text-muted-foreground">{settings.audioSrc}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">재생 전 포스터</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.posterSrc} alt="" className="max-h-40 rounded-lg object-cover" />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-medium">새 파일 올리기</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">동영상 (MP4·WebM, 25MB 이하)</span>
            <input
              type="file"
              accept="video/mp4,video/webm,.mp4,.webm"
              disabled={status === "busy"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload("video", file, file.name.replace(/\.[^.]+$/, ""));
                e.target.value = "";
              }}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">음악 (MP3·WAV·M4A, 12MB 이하)</span>
            <input
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,.mp3,.wav,.m4a"
              disabled={status === "busy"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload("audio", file, file.name.replace(/\.[^.]+$/, ""));
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">포스터 이미지 (JPG·PNG 등, 8MB 이하)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={status === "busy"}
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
          <h2 className="font-medium">영상 목록에서 선택</h2>
          <Button type="button" variant="outline" size="sm" disabled={status === "busy"} onClick={() => void refresh()}>
            새로고침
          </Button>
        </div>
        <ul className="space-y-2">
          {settings.videos.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                {item.label}
                {settings.videoSrc === item.src ? (
                  <span className="ml-2 text-xs font-medium text-primary">· 공개 중</span>
                ) : null}
              </span>
              <Button
                type="button"
                size="sm"
                variant={settings.videoSrc === item.src ? "secondary" : "default"}
                disabled={status === "busy" || settings.videoSrc === item.src}
                onClick={() => void applySelection({ videoSrc: item.src })}
              >
                이 영상 사용
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">음악 목록에서 선택</h2>
        <ul className="space-y-2">
          {settings.audios.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                {item.label}
                {settings.audioSrc === item.src ? (
                  <span className="ml-2 text-xs font-medium text-primary">· 공개 중</span>
                ) : null}
              </span>
              <Button
                type="button"
                size="sm"
                variant={settings.audioSrc === item.src ? "secondary" : "default"}
                disabled={status === "busy" || settings.audioSrc === item.src}
                onClick={() => void applySelection({ audioSrc: item.src })}
              >
                이 음악 사용
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {message ? (
        <p className={status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{message}</p>
      ) : null}
    </div>
  );
}
