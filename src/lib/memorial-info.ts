export const MEMORIAL_HOWTO_STEPS = [
  { n: "1", title: "묘역 연결", text: "회원가입 시 등록한 묘역번호·망자 정보로 고인별 추모관이 생성됩니다." },
  { n: "2", title: "추억 수집", text: "유족이 생전 사진·가족 동영상·추모 글을 올리고, 운영팀 편집 영상도 함께 쌓입니다." },
  { n: "3", title: "시점별 갱신", text: "기일·설·추석·생일 등 추모 시점에 묘역 현황과 맞춤 콘텐츠가 타임라인에 추가됩니다." },
  { n: "4", title: "지속적 누적", text: "일회성이 아니라 같은 추모관에 시간순으로 기억이 쌓이는 디지털 공간입니다." },
] as const;

export const MEMORIAL_VS_AGENCY = [
  {
    label: "추모 대행",
    text: "현장 헌화·잔디 정돈·묘역 사진 전송 등, 이미 모신 자리에 대한 방문·관리 서비스입니다.",
  },
  {
    label: "사이버 추모관",
    text: "가족 사진·동영상·편집 영상을 모아 기일·명절마다 디지털 타임라인으로 남기는 공간입니다.",
  },
  {
    label: "연동",
    text: "추모 대행으로 촬영한 묘역 사진은 추모관 타임라인에 자동 반영될 수 있습니다. 두 서비스는 함께 쓰거나 각각 이용할 수 있습니다.",
  },
] as const;

/** 유료화 예정 플랜 — 결제 연동 전 placeholder */
export type MemorialPlanId = "demo" | "standard" | "premium";

export type MemorialPlan = {
  id: MemorialPlanId;
  name: string;
  priceLabel: string;
  period: string;
  badge?: string;
  highlight?: boolean;
  available: boolean;
  features: string[];
};

export const MEMORIAL_PLANS: MemorialPlan[] = [
  {
    id: "demo",
    name: "데모 체험",
    priceLabel: "무료",
    period: "체험 기간",
    badge: "현재 이용 가능",
    available: true,
    features: [
      "샘플 추모관 열람 (DEMO-A101 등)",
      "타임라인·추억 업로드 체험",
      "편집 영상 요청 UI 확인",
    ],
  },
  {
    id: "standard",
    name: "스탠다드",
    priceLabel: "월 9,900원",
    period: "1개 추모관",
    badge: "출시 예정",
    available: false,
    features: [
      "망자 1명 추모관 개설",
      "사진·동영상·글 무제한 업로드",
      "기일·명절 자동 타임라인 갱신",
      "묘역 점검 사진 연동",
    ],
  },
  {
    id: "premium",
    name: "프리미엄",
    priceLabel: "월 19,900원",
    period: "1개 추모관",
    badge: "출시 예정",
    highlight: true,
    available: false,
    features: [
      "스탠다드 기능 전체",
      "연 2회 편집 추모영상 제작",
      "가족 공유 링크 (비공개)",
      "우선 고객 지원",
    ],
  },
];

export const MEMORIAL_BILLING_NOTE =
  "정식 요금·결제는 추후 오픈 예정입니다. 현재는 데모 체험과 상담을 통해 이용 방법을 안내해 드립니다.";
