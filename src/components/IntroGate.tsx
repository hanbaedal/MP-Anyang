"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FacebookIcon, InstagramIcon, NaverCafeIcon, VolumeIcon, YoutubeIcon } from "./icons";

type Props = {
  children: React.ReactNode;
};

export function IntroGate({ children }: Props) {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedAt = useMemo(() => Date.now(), []);

  const enter = async () => {
    setEntered(true);
    const audio = audioRef.current;
    if (!audio || muted) return;
    try {
      await audio.play();
    } catch {
      // 브라우저 자동재생 제한이 있어도 진입은 허용한다.
    }
  };

  useEffect(() => {
    if (entered || Date.now() - startedAt > 9000) return;
    const timer = setTimeout(() => setEntered(true), 8500);
    return () => clearTimeout(timer);
  }, [entered, startedAt]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (muted) audio.pause();
  }, [muted]);

  if (entered) return <>{children}</>;

  return (
    <div className="intro" style={{ backgroundImage: "url(/images/intro-sky.png)" }}>
      <audio ref={audioRef} src="/audio/intro.mp3" loop preload="auto" />
      <div className="intro-body" onClick={enter}>
        <h1>안양공원묘지</h1>
        <p>하늘이 고요해지는 시간, 그리움을 오래 품는 자리를 준비합니다.</p>
        <div className="intro-hint">클릭하거나 잠시 기다리면 입장합니다</div>
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
        <div className="sns-bar">
          <a href="#" aria-label="페이스북"><FacebookIcon /></a>
          <a href="#" aria-label="인스타그램"><InstagramIcon /></a>
          <a href="#" aria-label="유튜브"><YoutubeIcon /></a>
          <a href="#" aria-label="네이버카페"><NaverCafeIcon /></a>
        </div>
        <p className="intro-footer-info">
          경기도 의왕시 청계동 산 8-5 일원 · 관리사무실 031-421-9165
        </p>
      </footer>
    </div>
  );
}
