"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Photo } from "@/components/page-hero";
import { cn } from "@/lib/utils";

const BGM_SESSION_KEY = "anyang-home-hero-bgm";

type Props = {
  videoSrc: string;
  audioSrc: string;
  posterSrc: string;
};

export function HomeHeroMedia({ videoSrc, audioSrc, posterSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [showBgmPrompt, setShowBgmPrompt] = useState(true);

  const startVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    try {
      await video.play();
      setVideoReady(true);
      setVideoError(false);
    } catch {
      setVideoError(true);
    }
  }, []);

  const startBgm = useCallback(async () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;
    try {
      if (video.paused) await startVideo();
      await audio.play();
      setMusicOn(true);
      setShowBgmPrompt(false);
      sessionStorage.setItem(BGM_SESSION_KEY, "1");
    } catch {
      setShowBgmPrompt(true);
    }
  }, [startVideo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    setVideoReady(false);
    void startVideo();
  }, [reduceMotion, videoSrc, startVideo]);

  useEffect(() => {
    if (reduceMotion || sessionStorage.getItem(BGM_SESSION_KEY) !== "1") return;
    setShowBgmPrompt(false);
    void startBgm();
  }, [reduceMotion, audioSrc, startBgm]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) void audio.play().catch(() => setMusicOn(false));
    else audio.pause();
  }, [musicOn, audioSrc]);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      audioRef.current?.pause();
    };
  }, []);

  if (reduceMotion) {
    return (
      <Photo
        src={posterSrc}
        alt="(재)안양공원묘원 언덕 묘역 전경"
        className="absolute inset-0 h-full w-full rounded-none"
        sizes="100vw"
        priority
      />
    );
  }

  return (
    <>
      {videoError ? (
        <Photo
          src={posterSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full rounded-none"
          sizes="100vw"
          priority
        />
      ) : null}
      <video
        key={videoSrc}
        ref={videoRef}
        className={cn("absolute inset-0 h-full w-full object-cover", videoReady || videoError ? "opacity-100" : "opacity-0")}
        src={videoSrc}
        poster={posterSrc}
        muted
        autoPlay
        playsInline
        loop
        preload="auto"
        onLoadedData={() => setVideoReady(true)}
        onError={() => setVideoError(true)}
      />
      <audio key={audioSrc} ref={audioRef} src={audioSrc} loop preload="metadata" />
      {showBgmPrompt && videoReady && !videoError ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[20] flex justify-center px-4 md:bottom-32">
          <button
            type="button"
            onClick={() => void startBgm()}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-black/60"
            aria-label="배경음악 재생"
          >
            <Volume2 className="size-4" aria-hidden />
            배경음악 재생
          </button>
        </div>
      ) : null}
      {musicOn ? (
        <button
          type="button"
          onClick={() => setMusicOn((on) => !on)}
          className="absolute right-3 top-3 z-[20] inline-flex size-10 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-black/55 sm:right-4 sm:top-4"
          aria-label="음악 끄기"
          title="음악 끄기"
        >
          <Volume2 className="size-5" aria-hidden />
        </button>
      ) : null}
      {!musicOn && !showBgmPrompt && videoReady ? (
        <button
          type="button"
          onClick={() => void startBgm()}
          className="absolute right-3 top-3 z-[20] inline-flex size-10 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-black/55 sm:right-4 sm:top-4"
          aria-label="배경음악 켜기"
          title="배경음악 켜기"
        >
          <VolumeX className="size-5" aria-hidden />
        </button>
      ) : null}
    </>
  );
}
