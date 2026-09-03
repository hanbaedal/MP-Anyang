"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { VolumeIcon } from "./icons";

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

  if (entered) return <>{children}</>;

  return (
    <div className="intro" style={{ backgroundImage: "url(/images/intro-sky.png)" }}>
      <audio ref={audioRef} src="/audio/intro.mp3" loop />
      <div className="intro-body" onClick={enter}>
        <h1>안양공원묘지</h1>
        <p>하늘이 고요해지는 시간, 그리움을 오래 품는 자리를 준비합니다.</p>
        <div className="intro-hint">클릭하거나 잠시 기다리면 입장합니다</div>
      </div>
      <button className="btn mute-toggle" onClick={() => setMuted((v) => !v)}>
        <VolumeIcon muted={muted} />
        {muted ? "음소거됨" : "소리 켜짐"}
      </button>
      <div className="sns-bar">
        <a href="#" aria-label="페이스북">
          f
        </a>
        <a href="#" aria-label="인스타그램">
          ◎
        </a>
        <a href="#" aria-label="유튜브">
          ▶
        </a>
        <a href="#" aria-label="네이버카페">
          N
        </a>
      </div>
    </div>
  );
}
