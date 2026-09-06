"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { consumePrimedIntroAudio, createIntroAudio } from "../lib/intro-audio";
import { SocialBar } from "./SocialBar";
import { VolumeIcon } from "./icons";

type Props = {
  children: React.ReactNode;
};

const INTRO_FADE_MS = 1400;
const INTRO_VOLUME = 0.55;

export function IntroGate({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replayIntro = searchParams.get("intro") === "1";
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enteringRef = useRef(false);

  const finishEnter = useCallback(() => {
    setEntered(true);
    if (replayIntro) router.replace("/", { scroll: false });
  }, [replayIntro, router]);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    audioRef.current = consumePrimedIntroAudio() ?? createIntroAudio();
    return audioRef.current;
  }, []);

  const startPlayback = useCallback(() => {
    if (muted) return;
    const audio = ensureAudio();
    audio.volume = INTRO_VOLUME;
    audio.muted = false;
    if (audio.paused) {
      void audio.play().catch(() => {
        audio.muted = true;
        void audio.play().catch(() => undefined);
      });
    }
  }, [ensureAudio, muted]);

  useEffect(() => {
    if (entered) return;
    startPlayback();
  }, [entered, startPlayback]);

  useEffect(() => {
    if (!replayIntro || entered) return;
    setEntered(false);
    setLeaving(false);
    enteringRef.current = false;
    const audio = audioRef.current;
    if (audio) audio.currentTime = 0;
    startPlayback();
  }, [replayIntro, entered, startPlayback]);

  const enter = useCallback(() => {
    if (enteringRef.current) return;
    enteringRef.current = true;
    setLeaving(true);

    const audio = audioRef.current;
    const finish = () => {
      audio?.pause();
      finishEnter();
    };

    if (!audio || muted || audio.paused || audio.ended) {
      window.setTimeout(finish, 400);
      return;
    }

    const startVol = audio.volume;
    const t0 = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - t0) / INTRO_FADE_MS);
      audio.volume = startVol * (1 - progress);
      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }
      finish();
    };
    requestAnimationFrame(tick);
  }, [muted, finishEnter]);

  useEffect(() => {
    if (entered) return;
    const audio = ensureAudio();
    const onEnded = () => enter();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [entered, enter, ensureAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.pause();
      return;
    }
    audio.muted = false;
    audio.volume = INTRO_VOLUME;
    void audio.play().catch(() => undefined);
  }, [muted]);

  if (entered) return <>{children}</>;

  return (
    <div
      className={`intro${leaving ? " intro-leaving" : ""}`}
      style={{ backgroundImage: "url(/images/intro-sky.png)" }}
    >
      <div className="intro-body" onClick={() => enter()}>
        <h1>안양공원묘원</h1>
        <p>하늘이 고요해지는 시간, 그리움을 오래 품는 자리를 준비합니다.</p>
        <div className="intro-hint">클릭하면 입장 · 음악이 끝나면 자동 입장</div>
      </div>
      <button
        type="button"
        className="btn mute-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setMuted((v) => !v);
        }}
      >
        <VolumeIcon muted={muted} />
        {muted ? "음소거됨" : "소리 켜짐"}
      </button>
      <footer className="intro-footer">
        <SocialBar />
        <p className="intro-footer-info">
          경기도 의왕시 청계동 산 8-5 일원 · 관리사무실 031-421-9165
        </p>
      </footer>
    </div>
  );
}
