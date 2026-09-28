"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Photo } from "@/components/page-hero";
import { cn } from "@/lib/utils";

const SESSION_KEY = "anyang-home-hero-media";

type Props = {
  videoSrc: string;
  audioSrc: string;
  posterSrc: string;
};

export function HomeHeroMedia({ videoSrc, audioSrc, posterSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [started, setStarted] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [showPrompt, setShowPrompt] = useState(true);

  const syncPlay = useCallback(async () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return false;
    video.muted = true;
    try {
      await video.play();
      if (musicOn) await audio.play();
      else audio.pause();
      sessionStorage.setItem(SESSION_KEY, "1");
      setStarted(true);
      setShowPrompt(false);
      return true;
    } catch {
      return false;
    }
  }, [musicOn]);

  const startFromClick = useCallback(() => {
    void syncPlay();
  }, [syncPlay]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    if (sessionStorage.getItem(SESSION_KEY) !== "1") return;
    setShowPrompt(false);
    void syncPlay();
  }, [reduceMotion, syncPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !started) return;
    if (musicOn) void audio.play().catch(() => {});
    else audio.pause();
  }, [musicOn, started]);

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
      {!started ? (
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
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          started ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        src={videoSrc}
        poster={posterSrc}
        muted
        playsInline
        loop
        preload="metadata"
      />
      <audio ref={audioRef} src={audioSrc} loop preload="metadata" />
      {showPrompt ? (
        <>
          <div className="pointer-events-none absolute inset-0 z-[5] bg-black/30" aria-hidden />
          <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center px-6">
            <button
              type="button"
              onClick={startFromClick}
              className="pointer-events-auto flex cursor-pointer flex-col items-center gap-3 rounded-2xl bg-black/40 px-8 py-6 text-center text-primary-foreground ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="영상과 음악 재생"
            >
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40">
                <svg viewBox="0 0 24 24" className="ml-1 size-7 fill-current" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </span>
              <span className="max-w-xs text-sm font-medium tracking-wide sm:text-base">
                클릭하면 영상과 음악이
                <br />
                함께 재생됩니다
              </span>
            </button>
          </div>
        </>
      ) : null}
      {started ? (
        <button
          type="button"
          onClick={() => setMusicOn((on) => !on)}
          className="absolute right-3 top-3 z-[6] inline-flex size-10 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-4 sm:top-4"
          aria-label={musicOn ? "음악 끄기" : "음악 켜기"}
          title={musicOn ? "음악 끄기" : "음악 켜기"}
        >
          {musicOn ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5" aria-hidden />}
        </button>
      ) : null}
    </>
  );
}
