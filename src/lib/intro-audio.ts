/** 인트로 BGM — IntroGate에서만 재생·정지 */
let primed: HTMLAudioElement | null = null;
let gesturePrimed = false;

/** 로고 클릭 등 — 재생은 IntroGate에서만 (다른 페이지에서 소리 나지 않음) */
export function primeIntroAudio() {
  if (typeof window === "undefined") return;
  gesturePrimed = true;
}

export function consumeGesturePrimed() {
  const v = gesturePrimed;
  gesturePrimed = false;
  return v;
}

export function consumePrimedIntroAudio(): HTMLAudioElement | null {
  const audio = primed;
  primed = null;
  return audio;
}

export function createIntroAudio(): HTMLAudioElement {
  return new Audio("/audio/intro.mp3");
}

export function stopIntroAudio(audio?: HTMLAudioElement | null) {
  if (primed) {
    primed.pause();
    primed.currentTime = 0;
    primed.src = "";
    primed.load();
    primed = null;
  }
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    audio.load();
  }
  gesturePrimed = false;
}
