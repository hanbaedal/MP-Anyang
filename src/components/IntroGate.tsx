"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  consumeGesturePrimed,
  createIntroAudio,
  stopIntroAudio,
} from "../lib/intro-audio";
import { SocialBar } from "./SocialBar";
import { VolumeIcon } from "./icons";

type Props = {
  children: React.ReactNode;
};

const INTRO_VOLUME = 0.55;
const INTRO_LEAVE_MS = 400;
const INTRO_SKIP_KEY = "ap_intro_skipped";

export function IntroGate({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replayIntro = searchParams.get("intro") === "1";
  const replayToken = searchParams.get("r");
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enteringRef = useRef(false);
  const lastReplayTokenRef = useRef<string | null>(null);

  const haltAudio = useCallback(() => {
    stopIntroAudio(audioRef.current);
    audioRef.current = null;
  }, []);

  const finishEnter = useCallback(() => {
    haltAudio();
    setEntered(true);
    setLeaving(false);
    enteringRef.current = false;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INTRO_SKIP_KEY, "1");
    }
    if (replayIntro) {
      router.replace("/", { scroll: false });
    }
  }, [haltAudio, replayIntro, router]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = createIntroAudio();
    }
    return audioRef.current;
  }, []);

  const startPlayback = useCallback(() => {
    if (muted || entered) return;
    const audio = ensureAudio();
    audio.currentTime = 0;
    audio.volume = INTRO_VOLUME;
    audio.muted = false;
    void audio.play().catch(() => {
      if (consumeGesturePrimed()) {
        void audio.play().catch(() => undefined);
        return;
      }
      audio.muted = true;
      void audio.play().catch(() => undefined);
    });
  }, [ensureAudio, entered, muted]);

  /** 로고 재진입: 인트로 + 음악 다시 시작 */
  useEffect(() => {
    if (!replayIntro) {
      lastReplayTokenRef.current = null;
      return;
    }
    const token = replayToken || "0";
    if (token === lastReplayTokenRef.current) return;
    lastReplayTokenRef.current = token;
    enteringRef.current = false;
    setLeaving(false);
    setEntered(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(INTRO_SKIP_KEY);
    }
    haltAudio();
    startPlayback();
  }, [replayIntro, replayToken, haltAudio, startPlayback]);

  /** 세션 내 메인 재방문 시 인트로 생략 (로고 클릭 제외) */
  useEffect(() => {
    if (replayIntro) {
      setHydrated(true);
      return;
    }
    if (typeof window !== "undefined" && sessionStorage.getItem(INTRO_SKIP_KEY) === "1") {
      setEntered(true);
    }
    setHydrated(true);
  }, [replayIntro]);

  /** 규칙 1: 인트로 화면이면 음악 재생 */
  useEffect(() => {
    if (!hydrated || entered) return;
    startPlayback();
  }, [hydrated, entered, startPlayback]);

  /** 규칙 2: 메인 입장 시 음악 완전 중단 */
  useEffect(() => {
    if (entered) haltAudio();
  }, [entered, haltAudio]);

  useEffect(() => () => haltAudio(), [haltAudio]);

  /** 규칙 2: 클릭 → 음악 즉시 중단 → 메인 입장 */
  const enter = useCallback(() => {
    if (enteringRef.current || entered) return;
    enteringRef.current = true;
    setLeaving(true);
    haltAudio();
    window.setTimeout(finishEnter, INTRO_LEAVE_MS);
  }, [entered, finishEnter, haltAudio]);

  useEffect(() => {
    if (entered) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.pause();
      return;
    }
    audio.muted = false;
    audio.volume = INTRO_VOLUME;
    void audio.play().catch(() => undefined);
  }, [entered, muted]);

  if (!hydrated) return null;
  if (entered) return <>{children}</>;

  return (
    <div
      className={`intro${leaving ? " intro-leaving" : ""}`}
      style={{ backgroundImage: "url(/images/intro-sky.png)" }}
    >
      <div className="intro-body" onClick={() => enter()}>
        <h1>안양공원묘원</h1>
        <p>하늘이 고요해지는 시간, 그리움을 오래 품는 자리를 준비합니다.</p>
        <div className="intro-hint">클릭하면 입장</div>
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
