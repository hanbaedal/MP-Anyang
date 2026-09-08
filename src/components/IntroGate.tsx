"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { consumeGesturePrimed, primeIntroAudio, stopIntroAudio } from "../lib/intro-audio";
import { SITE } from "../lib/site";
import { useI18n } from "./I18nProvider";
import { SocialBar } from "./SocialBar";
import { VolumeIcon } from "./icons";

type Props = {
  children: React.ReactNode;
};

const INTRO_VOLUME = 0.55;
const INTRO_LEAVE_MS = 400;
const INTRO_SKIP_KEY = "ap_intro_skipped";

export function IntroGate({ children }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const replayIntro = searchParams.get("intro") === "1";
  const replayToken = searchParams.get("r");
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [userMuted, setUserMuted] = useState(false);
  const [awaitingSoundUnlock, setAwaitingSoundUnlock] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enteringRef = useRef(false);
  const lastReplayTokenRef = useRef<string | null>(null);

  const haltAudio = useCallback(() => {
    stopIntroAudio(audioRef.current);
  }, []);

  const finishEnter = useCallback(() => {
    haltAudio();
    setEntered(true);
    setLeaving(false);
    enteringRef.current = false;
    setAwaitingSoundUnlock(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INTRO_SKIP_KEY, "1");
    }
    if (replayIntro) {
      router.replace("/", { scroll: false });
    }
  }, [haltAudio, replayIntro, router]);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || userMuted || entered) return;

    audio.currentTime = 0;
    audio.volume = INTRO_VOLUME;

    const tryMutedFallback = () => {
      audio.muted = true;
      setAwaitingSoundUnlock(true);
      void audio.play().catch(() => undefined);
    };

    if (consumeGesturePrimed()) {
      audio.muted = false;
      setAwaitingSoundUnlock(false);
      void audio.play().catch(tryMutedFallback);
      return;
    }

    audio.muted = false;
    void audio.play().then(() => {
      setAwaitingSoundUnlock(false);
    }).catch(tryMutedFallback);
  }, [entered, userMuted]);

  const unlockSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || userMuted) return;
    primeIntroAudio();
    audio.muted = false;
    audio.volume = INTRO_VOLUME;
    setAwaitingSoundUnlock(false);
    void audio.play().catch(() => undefined);
  }, [userMuted]);

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
    setAwaitingSoundUnlock(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(INTRO_SKIP_KEY);
    }
    haltAudio();
  }, [replayIntro, replayToken, haltAudio]);

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

  /** 규칙 1: 인트로 화면 + audio 마운트 후 음악 재생 */
  useEffect(() => {
    if (!hydrated || entered || !audioRef.current) return;
    startPlayback();
  }, [hydrated, entered, startPlayback, replayToken]);

  /** 규칙 2: 메인 입장 시 음악 완전 중단 */
  useEffect(() => {
    if (entered) haltAudio();
  }, [entered, haltAudio]);

  useEffect(() => () => haltAudio(), [haltAudio]);

  /** 규칙 2: 클릭 → 음악 중단 → 메인 입장 */
  const enter = useCallback(() => {
    if (enteringRef.current || entered) return;
    enteringRef.current = true;
    setLeaving(true);
    haltAudio();
    window.setTimeout(finishEnter, INTRO_LEAVE_MS);
  }, [entered, finishEnter, haltAudio]);

  const onIntroClick = useCallback(() => {
    if (awaitingSoundUnlock && !userMuted) {
      unlockSound();
      return;
    }
    enter();
  }, [awaitingSoundUnlock, enter, unlockSound, userMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || entered) return;
    if (userMuted) {
      audio.pause();
      return;
    }
    audio.muted = false;
    audio.volume = INTRO_VOLUME;
    void audio.play().catch(() => {
      audio.muted = true;
      setAwaitingSoundUnlock(true);
      void audio.play().catch(() => undefined);
    });
  }, [entered, userMuted]);

  const hint = awaitingSoundUnlock ? t("intro.hintSound") : t("intro.hintEnter");
  const muteLabel = userMuted ? t("intro.muteOn") : awaitingSoundUnlock ? t("intro.soundOff") : t("intro.soundOn");

  if (!hydrated) return null;
  if (entered) return <>{children}</>;

  return (
    <div
      className={`intro${leaving ? " intro-leaving" : ""}`}
      style={{ backgroundImage: "url(/images/intro-sky.png)" }}
    >
      <audio
        className="intro-audio"
        ref={audioRef}
        src="/audio/intro.mp3"
        preload="auto"
        playsInline
        autoPlay
        muted={awaitingSoundUnlock || userMuted}
      />
      <div className="intro-body" onClick={onIntroClick}>
        <h1>{t("site.shortName")}</h1>
        <p>{t("intro.tagline")}</p>
        <div className="intro-hint">{hint}</div>
      </div>
      <button
        type="button"
        className="btn mute-toggle"
        onClick={(e) => {
          e.stopPropagation();
          if (awaitingSoundUnlock && !userMuted) {
            unlockSound();
            return;
          }
          setUserMuted((v) => !v);
        }}
      >
        <VolumeIcon muted={userMuted || awaitingSoundUnlock} />
        {muteLabel}
      </button>
      <footer className="intro-footer">
        <SocialBar />
        <p className="intro-footer-info">
          {t("site.addressShort")} · {t("footer.office")} {SITE.phone}
        </p>
        {locale !== "ko" ? (
          <p className="intro-footer-official">{SITE.addressShort}</p>
        ) : null}
      </footer>
    </div>
  );
}
