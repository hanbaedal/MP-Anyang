export type ProductKind = "매장묘" | "평장묘" | "봉안묘" | "리모델링";

export type ProductCard = {
  title: string;
  href: string;
  image: string;
  summary: string;
};

export const PRODUCT_OVERVIEW: ProductCard[] = [
  {
    title: "매장묘",
    href: "/lots/burial",
    image: "/images/burial.jpg",
    summary: "단장묘(1인), 합장묘(부부단·부부 합장), 쌍분묘(부부 각자)",
  },
  {
    title: "평장묘",
    href: "/lots/lawn",
    image: "/images/lawn.jpg",
    summary: "2위부터 대가족까지. 그 이상 위수는 상담으로 안내합니다.",
  },
  {
    title: "봉안묘",
    href: "/lots/columbarium",
    image: "/images/columbarium.jpg",
    summary: "봉안묘 2~8위, 12~24위. 전경은 둘러보기에서 볼 수 있습니다.",
  },
];

export const BURIAL = [
  {
    title: "단장묘",
    caption: "1인 고인의 묘",
    image: "/images/burial.jpg",
  },
  {
    title: "합장묘",
    caption: "부부단 — 부부 합장",
    image: "/images/burial-2.jpg",
  },
  {
    title: "쌍분묘",
    caption: "부부 각자의 묘",
    image: "/images/gallery-mound.jpg",
  },
];

export const LAWN = [
  { title: "고급평장묘 2위", image: "/images/lawn-2.jpg" },
  { title: "평장묘 2위", image: "/images/lawn.jpg" },
  { title: "평장묘 4·6·8위", image: "/images/lawn-3.jpg" },
  { title: "평장묘 12·16위", image: "/images/lawn-4.jpg" },
  { title: "평장묘 24위", image: "/images/plots.jpg" },
  { title: "가로평장묘 16위", image: "/images/lawn-3.jpg" },
  { title: "대가족 평장묘", image: "/images/lawn.jpg" },
];

export const COLUMBARIUM = [
  { title: "봉안묘 2~8위", image: "/images/columbarium-2.jpg" },
  { title: "봉안묘 12~24위", image: "/images/columbarium.jpg" },
  { title: "봉안묘 전경", image: "/images/columbarium-3.jpg" },
];

export const REMODEL_TYPES = [
  {
    title: "서구매장 리모델링",
    text: "기존 봉분을 다듬어 가족 묘역으로 바꿉니다.",
    image: "/images/remodel-before.jpg",
  },
  {
    title: "가로형 리모델링",
    text: "옆으로 이어 쓰는 가족묘 형태입니다.",
    image: "/images/remodel-2.jpg",
  },
  {
    title: "표준형 리모델링",
    text: "표준 규격으로 단장해 청결과 안전을 도모합니다.",
    image: "/images/remodel.jpg",
  },
];

export type GalleryTag = "전경" | "매장묘" | "평장묘" | "봉안묘" | "리모델링";

export type GalleryItem = {
  src: string;
  alt: string;
  tags: GalleryTag[];
};

export const GALLERY: GalleryItem[] = [
  { src: "/images/hero.jpg", alt: "언덕 묘역과 진입로 전경", tags: ["전경"] },
  { src: "/images/park-overview.jpg", alt: "공원 주차장과 묘역 전경", tags: ["전경"] },
  { src: "/images/gallery-mound.jpg", alt: "잔디 봉분 매장묘", tags: ["매장묘", "전경"] },
  { src: "/images/burial.jpg", alt: "단장 매장묘", tags: ["매장묘"] },
  { src: "/images/burial-2.jpg", alt: "합장 매장묘", tags: ["매장묘"] },
  { src: "/images/lawn.jpg", alt: "가족 평장묘", tags: ["평장묘"] },
  { src: "/images/lawn-2.jpg", alt: "평장묘 2위", tags: ["평장묘"] },
  { src: "/images/lawn-3.jpg", alt: "여러 위 평장묘", tags: ["평장묘"] },
  { src: "/images/plots.jpg", alt: "평장·봉안 구역", tags: ["평장묘", "봉안묘"] },
  { src: "/images/columbarium.jpg", alt: "봉안묘", tags: ["봉안묘"] },
  { src: "/images/columbarium-2.jpg", alt: "봉안묘 열", tags: ["봉안묘"] },
  { src: "/images/columbarium-4.jpg", alt: "봉안묘 전경", tags: ["봉안묘", "전경"] },
  { src: "/images/remodel.jpg", alt: "리모델링한 가족묘", tags: ["리모델링"] },
  { src: "/images/remodel-before.jpg", alt: "손질 전 봉분", tags: ["리모델링"] },
  { src: "/images/remodel-2.jpg", alt: "가로형 가족묘", tags: ["리모델링", "평장묘"] },
  { src: "/images/gallery-4.jpg", alt: "공원 묘역 풍경", tags: ["전경"] },
];

export const SERVICES = [
  {
    title: "이장·개장",
    paragraphs: [
      "직원이 이장과 개장을 돕습니다. 개장 뒤에는 미니관에 모셔 유족께 드립니다.",
      "미납 관리비와 개장비, 관공서 개장신청증명서, 화장 일정은 사무실에서 순서대로 안내합니다. 공원에 오시기만 하면 끝난다고 단정하지 않습니다.",
    ],
  },
  {
    title: "석축",
    paragraphs: [
      "묘와 묘 근처의 낡은 자리를 석축으로 보강합니다. 침하와 산사태로부터 자리를 지키고, 묘지 공간이 넓어지는 효과도 있습니다.",
    ],
  },
  {
    title: "잔디 식재",
    paragraphs: [
      "봉분·바닥·활개에 잔디를 심습니다. 공원에서 쓰는 식재 방식으로 오래가도록 돕습니다.",
    ],
  },
  {
    title: "특별관리(벌초)",
    paragraphs: [
      "벌초와 잡초 제거를 포함한 특별관리로, 방문하실 때 자리가 정갈하도록 살핍니다.",
    ],
  },
  {
    title: "묘지 디자인",
    paragraphs: [
      "자리에 맞는 맞춤 묘를 공원에서 직접 디자인합니다. 규모와 석물은 상담으로 정합니다.",
    ],
  },
];
