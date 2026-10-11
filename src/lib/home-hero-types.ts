/** 홈 메인에 올릴 수 있는 영상·음악 세트 상한 */
export const HOME_HERO_MAX_SETS = 8;

/** 영상(+선택 음악) 한 세트 */
export type HomeHeroSet = {
  id: string;
  /** 카드에 보이는 짧은 이름 */
  label: string;
  videoSrc: string;
  /** 공란이면 홈에서 영상 트랙 소리 사용 */
  audioSrc: string;
  videoLabel: string;
  audioLabel: string;
  createdAt: string;
};

export type HomeHeroSettings = {
  sets: HomeHeroSet[];
  /** 홈에 공개 중인 세트 */
  activeSetId: string;
  posterSrc: string;
  updatedAt: string;
  /** active 세트에서 파생(홈·호환용) */
  videoSrc: string;
  audioSrc: string;
};
