"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const enteringRef = useRef(false);
  const musicStartedRef = useRef(false);

  const finishEnter = useCallback(() => {
    setEntered(true);
    if (replayIntro) router.replace("/", { scroll: false });
  }, [replayIntro, router]);

  useEffect(() => {
    if (!replayIntro) return;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setEntered(false);
    setLeaving(false);
    setMusicPlaying(false);
    enteringRef.current = false;
    musicStartedRef.current = false;
  }, [replayIntro]);

  /** 클릭/터치 제스처 안에서 동기적으로 play() 호출 (브라우저 자동재생 정책) */
  const tryPlay = useCallback(() => {
    if (muted) return false;
    const audio = audioRef.current;
    if (!audio) return false;

    audio.volume = INTRO_VOLUME;
    audio.muted = false;

    if (!musicStartedRef.current) {
      audio.currentTime = 0;
    }

    const result = audio.play();
    musicStartedRef.current = true;
    setMusicPlaying(true);

    if (result && typeof result.catch === "function") {
      result.catch(() => {
        musicStartedRef.current = false;
        setMusicPlaying(false);
      });
    }
    return true;
  }, [muted]);

  const enter = useCallback(() => {
    if (enteringRef.current) return;
    enteringRef.current = true;
    setLeaving(true);

    const audio = audioRef.current;
    const finish = () => finishEnter();

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
      audio.pause();
      audio.volume = startVol;
      finish();
    };
    requestAnimationFrame(tick);
  }, [muted, finishEnter]);

  useEffect(() => {
    if (entered) return;
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => enter();
    const onPause = () => {
      if (!audio.ended) setMusicPlaying(false);
    };
    const onPlay = () => setMusicPlaying(true);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [entered, enter]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.pause();
      setMusicPlaying(false);
      return;
    }
    audio.muted = false;
    if (musicStartedRef.current) {
      void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
  }, [muted]);

  const onIntroPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".mute-toggle")) return;
    tryPlay();
  };

  const onIntroClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".mute-toggle")) return;
    if (!musicStartedRef.current) {
      tryPlay();
      return;
    }
    enter();
  };

  if (entered) return <>{children}</>;

  return (
    <div
      className={`intro${leaving ? " intro-leaving" : ""}`}
      style={{ backgroundImage: "url(/images/intro-sky.png)" }}
      onPointerDown={onIntroPointerDown}
    >
      <audio ref={audioRef} src="/audio/intro.mp3" preload="auto" playsInline />
      <div className="intro-body" onClick={onIntroClick}>
        <h1>안양공원묘원</h1>
        <p>하늘이 고요해지는 시간, 그리움을 오래 품는 자리를 준비합니다.</p>
        <div className="intro-hint">
          {musicPlaying
            ? "음악이 끝나면 자동 입장 · 다시 누르면 건너뛰기"
            : "화면을 눌러 음악을 시작하세요"}
        </div>
      </div>
      <button
        type="button"
        className="btn mute-toggle"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setMuted((v) => {
            const next = !v;
            if (!next) tryPlay();
            return next;
          });
        }}
      >
        <VolumeIcon muted={muted} />
        {muted ? "음소거됨" : musicPlaying ? "재생 중" : "소리 켜짐"}
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
