/** 인트로 BGM — 로고 클릭(사용자 제스처)에서 priming, IntroGate에서 이어받기 */
let primed: HTMLAudioElement | null = null;

export function primeIntroAudio() {
  if (typeof window === "undefined") return;
  if (!primed) {
    primed = new Audio("/audio/intro.mp3");
    primed.preload = "auto";
  }
  primed.volume = 0.55;
  primed.muted = false;
  primed.currentTime = 0;
  void primed.play().catch(() => {
    if (!primed) return;
    primed.muted = true;
    void primed.play().catch(() => undefined);
  });
}

export function consumePrimedIntroAudio(): HTMLAudioElement | null {
  const audio = primed;
  primed = null;
  return audio;
}

export function createIntroAudio(): HTMLAudioElement {
  const audio = new Audio("/audio/intro.mp3");
  audio.preload = "auto";
  return audio;
}
