export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "timeline"; items: { year: string; text: string }[] }
  | { type: "image"; src: string; alt: string }
  | { type: "steps"; title?: string; items: { label: string; text: string }[] }
  | {
      type: "procGrid";
      items: { title: string; flow?: string; docs?: string[]; note?: string }[];
    }
  | { type: "cta"; phone?: string; links: { href: string; label: string; primary?: boolean }[] };

export type StaticPage = {
  section: string;
  slug: string;
  kicker: string;
  title: string;
  lead?: string;
  image?: { src: string; alt: string };
  blocks: ContentBlock[];
};

const pages: StaticPage[] = [
  {
    section: "about",
    slug: "intro",
    kicker: "재단소개",
    title: "안양공원 소개",
    lead: "청계산 자락, 하늘과 가까운 자리에서 고인을 모시고 유가족을 받듭니다.",
    image: { src: "/images/park-panorama.png", alt: "안양공원묘원 전경" },
    blocks: [
      {
        type: "p",
        text: "안양공원묘원은 경기도 의왕시 청계동 산 8-5 일원에 자리한 추모공원입니다. 안양과 맞닿은 청계산 기슭의 수려한 숲과 바람을 배경으로, 고인의 평안과 남겨진 분의 마음을 함께 살핍니다.",
      },
      {
        type: "p",
        text: "봉안묘·수목장·매장묘·평장묘를 한 공원 안에서 안내하며, 정원·카페·식당·관리사무실이 방문길을 돕습니다. 묘역찾기와 상담신청으로 멀리 계신 가족도 자리를 확인하고 예의를 갖출 수 있습니다.",
      },
      {
        type: "list",
        items: [
          "위치: 경기도 의왕시 청계동 산 8-5 일원 (안양 인접)",
          "안내전화: 031-421-9165",
          "조성 면적: 약 27만 ㎡의 숲과 묘역",
          "안장 형태: 봉안묘, 수목장, 매장묘, 평장묘",
        ],
      },
    ],
  },
  {
    section: "about",
    slug: "greeting",
    kicker: "재단소개",
    title: "대표 인삿말",
    lead: "그리움이 머무는 자리를 정갈하게 지키는 것이 저희의 본분입니다.",
    blocks: [
      {
        type: "quote",
        text: "떠나신 분을 모시는 일은 산 사람의 마음을 돌보는 일과 같습니다. 안양공원묘원은 그 마음을 서두르지 않고, 그러나 소홀히 하지 않겠습니다.",
        cite: "안양공원묘원 이사장",
      },
      {
        type: "p",
        text: "방문객 여러분, 이 자리에 와 주셔서 감사합니다. 공원은 묘역이기 전에 가족이 숨을 고르는 정원이어야 한다고 믿습니다. 돌길과 나무, 물 한 잔이 놓인 카페까지, 작은 편의가 위안이 되기를 바랍니다.",
      },
      {
        type: "p",
        text: "분양과 관리, 추모와 상조, 오래된 묘의 손질까지 한 창구에서 여쭈어 주십시오. 전화 한 통, 상담 한 장이 새로운 작별의 시작이 될 수 있습니다.",
      },
    ],
  },
  {
    section: "about",
    slug: "history",
    kicker: "재단소개",
    title: "안양공원 연혁",
    lead: "숲이 공원이 되고, 공원이 가족의 자리가 된 시간입니다.",
    blocks: [
      {
        type: "timeline",
        items: [
          {
            year: "1987",
            text: "청계 일원이 묘지공원으로 지정되며, 안양 시민과 가까운 추모 공간이 자리 잡기 시작했습니다.",
          },
          {
            year: "1990s",
            text: "봉분 묘역과 관리 동선을 정비하고, 성묘철 방문객을 위한 안내 체계를 갖추었습니다.",
          },
          {
            year: "2000s",
            text: "납골·평장 구역을 넓혀 다양한 안장 방식을 한 공원에서 선택할 수 있게 했습니다.",
          },
          {
            year: "2010s",
            text: "수목장과 추모 정원을 조성하고, 카페·식당 등 체류 시설을 보강했습니다.",
          },
          {
            year: "2020s",
            text: "온라인 묘역찾기와 상담신청을 열어, 멀리 계신 가족도 자리를 찾고 예를 갖출 수 있게 했습니다.",
          },
        ],
      },
    ],
  },
  {
    section: "about",
    slug: "guide",
    kicker: "재단소개",
    title: "이용안내",
    lead: "방문 전에 알아 두시면 성묘와 상담이 한결 편안합니다.",
    blocks: [
      {
        type: "p",
        text: "관리사무실은 매일 열며, 묘역은 일출부터 일몰까지 출입할 수 있습니다. 명절과 한식에는 안내 인원을 늘리고, 주차 유도에 힘을 씁니다.",
      },
      {
        type: "list",
        items: [
          "운영시간: 매일 08:00–18:00 (동절기 08:00–17:30)",
          "관리사무실: 031-421-9165",
          "주차: 공원 하단 주차장 이용, 성묘철 임시 주차 운영",
          "제례: 개별 묘역 및 공동 참배 공간 이용",
          "반입: 일회용 제수용품은 지정 수거함에, 화환은 사무실에 문의",
          "금지: 취사, 묘역 내 음주, 무단 촬영·상업 촬영",
        ],
      },
      {
        type: "p",
        text: "이장·개장·합장은 사전 상담 후 진행합니다. 필요 서류는 문의사항 게시판 또는 전화로 안내받으실 수 있습니다.",
      },
    ],
  },
  {
    section: "about",
    slug: "location",
    kicker: "재단소개",
    title: "오시는 길",
    lead: "지도, 대중교통, 자가용 이용 방법을 한눈에 안내합니다.",
    blocks: [
      {
        type: "p",
        text: "안양공원묘원은 경기도 의왕시 청계동 산 8-5 일원에 있습니다. 인덕원 생활권에서 접근하기 좋고, 성묘철에는 임시 주차장과 안내 인력을 늘립니다.",
      },
      {
        type: "list",
        items: [
          "대표 안내 전화: 031-421-9165",
          "주소: 경기도 의왕시 청계동 산 8-5",
          "성묘철 혼잡 시간: 오전 10시~오후 1시",
        ],
      },
    ],
  },
  {
    section: "lots",
    slug: "procedure",
    kicker: "분양안내",
    title: "분양절차",
    lead: "문의부터 묘역 사용까지, 필요한 순서와 서류를 한눈에 안내합니다.",
    blocks: [
      {
        type: "steps",
        title: "묘지 사용 계약",
        items: [
          { label: "1", text: "상담 문의" },
          { label: "2", text: "현장 방문" },
          { label: "3", text: "계약·계약금" },
          { label: "4", text: "잔금" },
          { label: "5", text: "묘역 사용" },
        ],
      },
      {
        type: "procGrid",
        items: [
          {
            title: "묘지 사용 계약",
            flow: "상담 → 현장 확인 → 계약금 → 잔금 → 사용",
            docs: ["계약자 신분증", "계약자 도장", "계약금 입금 확인(무통장)"],
          },
          {
            title: "석물·표석 설치",
            flow: "문의 → 모델 결정 → 계약 → 계약금 → 잔금 → 설치",
          },
          {
            title: "묘지 사용 통보",
            note: "매장·납골 작업 24시간 전 관리사무실로 통보해 주세요.",
            docs: ["계약자 성명", "묘역번호", "매장·납골 여부", "하관 일시", "연락처"],
          },
          {
            title: "매장",
            docs: [
              "사망진단서 또는 시검 안내문",
              "시체 매장 신고서(관리실 비치·대행 가능)",
              "신고자(상주) 주민등록등본",
              "도장",
            ],
          },
          {
            title: "납골",
            docs: [
              "화장신고필증(또는 화장증명서)",
              "납골증명서",
              "신고자(상주) 주민등록등본",
              "도장",
              "묘지사용 승낙서",
            ],
            note: "유골함 규격: 직경 21cm, 높이 25cm 이하",
          },
          {
            title: "개장(이장) — 매장",
            docs: [
              "개장신고필증",
              "시체 매장·화장신고서(관리실 대행)",
              "신고자(상주) 주민등록등본",
              "도장",
              "묘지사용 승낙서",
            ],
          },
          {
            title: "개장(이장) — 납골",
            docs: [
              "개장신고필증",
              "납골증명서",
              "신고자(상주) 주민등록등본",
              "도장",
              "묘지사용 승낙서",
            ],
          },
        ],
      },
      {
        type: "p",
        text: "봉안묘·수목장·매장묘·평장묘별 상세 안내는 각 분양 페이지와 상담을 통해 확인하실 수 있습니다.",
      },
      {
        type: "cta",
        phone: "031-421-9165",
        links: [{ href: "/consult", label: "상담신청", primary: true }],
      },
    ],
  },
  {
    section: "lots",
    slug: "columbarium",
    kicker: "분양안내",
    title: "봉안묘",
    lead: "돌과 바람 아래, 유골을 정갈하게 모시는 자리입니다.",
    image: { src: "/images/lot-columbarium.png", alt: "봉안묘 전경" },
    blocks: [
      {
        type: "p",
        text: "봉안묘는 화장 후 유골함을 석실 또는 봉안담에 모시는 방식입니다. 관리가 수월하고, 가족이 참배 동선을 짧게 가져갈 수 있습니다.",
      },
      {
        type: "list",
        items: [
          "2기·4기·8기·16기·24기·32기형 (개인·가족 봉안담)",
          "기수별 망자 등록 — 회원가입 시 묘역번호 연동",
          "실내·반실외 봉안담 선택",
          "주기적인 청소와 헌화 대행 가능",
          "분양 현황과 위치는 상담신청으로 안내",
        ],
      },
    ],
  },
  {
    section: "lots",
    slug: "tree",
    kicker: "분양안내",
    title: "수목장",
    lead: "나무 그늘에 이름을 남기고, 숲과 함께 쉬는 안장입니다.",
    image: { src: "/images/lot-tree.png", alt: "수목장 숲" },
    blocks: [
      {
        type: "p",
        text: "수목장은 지정된 나무 아래 유골을 묻고, 작은 표석만 두는 자연장입니다. 봉분을 원하지 않는 가족, 숲을 남기고 싶은 마음에 맞습니다.",
      },
      {
        type: "list",
        items: [
          "소나무·단풍 구역 선택",
          "표석은 낮은 자연석, 문구는 사무실과 상의",
          "벌초 부담이 적고 경관이 온화함",
          "합장·추가 안치는 수목 상태에 따라 협의",
        ],
      },
    ],
  },
  {
    section: "lots",
    slug: "burial",
    kicker: "분양안내",
    title: "매장묘",
    lead: "전통 봉분이 언덕을 따라 이어지는 자리입니다.",
    image: { src: "/images/lot-burial.png", alt: "매장묘 언덕" },
    blocks: [
      {
        type: "p",
        text: "매장묘는 봉분을 갖춘 전통 묘역입니다. 청계 능선의 향과 바람을 받도록 자리를 나누었으며, 벌초와 석물 관리는 연간 계약으로 맡기실 수 있습니다.",
      },
      {
        type: "list",
        items: [
          "단장형 · 합장형 · 쌍분형",
          "단장 1기 · 합장·쌍분 2기 안장",
          "비석·상석·혼유석 규격 안내",
          "성묘철 제초 및 헌화 대행",
          "이장·개장은 사전 신고 후 진행",
        ],
      },
    ],
  },
  {
    section: "lots",
    slug: "flat",
    kicker: "분양안내",
    title: "평장묘",
    lead: "잔디와 낮은 표석만 두는, 정돈된 잔디 묘역입니다.",
    image: { src: "/images/lot-flat.png", alt: "평장묘 잔디 묘역" },
    blocks: [
      {
        type: "p",
        text: "평장묘는 봉분 없이 잔디를 평평히 하고, 낮은 와비 또는 표석만 둡니다. 경관이 단정하고 보행이 편해 고령 방문객에게도 부담이 적습니다.",
      },
      {
        type: "list",
        items: [
          "4위 · 6위 · 8위 · 16위 잔디 평장",
          "화장 후 납골 평장이 일반적",
          "표석 규격은 공원 기준에 따름",
          "잔디 관리는 재단에서 일괄 실시",
          "배우자 합장 자리 사전 예약 가능",
        ],
      },
    ],
  },
  {
    section: "lots",
    slug: "composite",
    kicker: "분양안내",
    title: "복합묘",
    lead: "봉안과 매장·평장을 결합한 대형 가족 안치 공간입니다.",
    image: { src: "/images/lot-columbarium.png", alt: "복합묘 전경" },
    blocks: [
      {
        type: "p",
        text: "복합묘는 다기 안치가 필요한 가족묘역으로, 16기부터 24기까지 규모를 선택할 수 있습니다. 봉안·납골·합장 등 형태를 한 구역에서 유연하게 구성합니다.",
      },
      {
        type: "list",
        items: [
          "16기 · 20기 · 24기형",
          "가족·친족 대형 안치에 적합",
          "기수별 망자 등록 (회원가입 묘번 연동)",
          "석물·표석·관리는 상담 후 맞춤 설계",
          "분양 가능 구역은 상담신청으로 안내",
        ],
      },
    ],
  },
  {
    section: "facilities",
    slug: "garden",
    kicker: "시설안내",
    title: "정원",
    lead: "참배 전후에 숨을 고르는 추모 정원입니다.",
    image: { src: "/images/facility-garden.png", alt: "추모 정원" },
    blocks: [
      {
        type: "p",
        text: "돌등과 이끼, 소나무 사이로 난 작은 길이 정원의 뼈대입니다. 공동 참배석과 벤치를 두어, 묘역에 오르기 전 마음을 모으실 수 있습니다.",
      },
      {
        type: "list",
        items: ["사계절 초화와 소나무 경관", "휠체어가 닿는 완만한 산책로", "공동 헌화대, 휴지·오물 수거함"],
      },
    ],
  },
  {
    section: "facilities",
    slug: "cafe",
    kicker: "시설안내",
    title: "카페",
    lead: "창밖으로 숲이 보이는 조용한 휴식 공간입니다.",
    image: { src: "/images/facility-cafe.png", alt: "공원 카페" },
    blocks: [
      {
        type: "p",
        text: "성묘를 마치고 차 한 잔을 나누는 자리입니다. 큰 소리의 영업 없이, 따뜻한 음료와 간단한 다과만 둡니다.",
      },
      {
        type: "list",
        items: [
          "운영: 09:00–17:30 (월요일 휴무일은 별도 공지)",
          "좌석: 창가 테이블, 소규모 가족석",
          "포장 가능, 묘역 반입은 뚜껑 있는 잔만",
        ],
      },
    ],
  },
  {
    section: "facilities",
    slug: "restaurant",
    kicker: "시설안내",
    title: "식당",
    lead: "제례 전후, 가족이 둘러앉는 담백한 식사 공간입니다.",
    image: { src: "/images/facility-restaurant.png", alt: "공원 식당" },
    blocks: [
      {
        type: "p",
        text: "명절과 기일에는 예약이 밀립니다. 한식 중심의 간단한 차림이며, 제사 음식 반출은 위생 기준에 맞게 안내합니다.",
      },
      {
        type: "list",
        items: ["단체 예약: 사무실 031-421-9165", "좌석 약 80석", "성묘철 대기 번호 운영"],
      },
    ],
  },
  {
    section: "facilities",
    slug: "office",
    kicker: "시설안내",
    title: "사무실",
    lead: "분양·관리·이장 상담을 한곳에서 받으실 수 있습니다.",
    image: { src: "/images/facility-office.png", alt: "관리사무실" },
    blocks: [
      {
        type: "p",
        text: "관리사무실은 공원 진입 도로 초입에 있습니다. 묘역 위치 확인, 사용료, 개장 신고 안내, 온라인 상담의 후속 연락을 여기서 드립니다.",
      },
      {
        type: "list",
        items: [
          "전화: 031-421-9165",
          "운영: 매일 08:00–18:00",
          "준비물: 신분증, 고인과의 관계 서류(이장·합장 시)",
        ],
      },
    ],
  },
  {
    section: "services",
    slug: "memorial",
    kicker: "서비스상품",
    title: "추모",
    lead: "기일과 명절, 멀리 계신 가족을 대신해 예를 올립니다.",
    blocks: [
      {
        type: "p",
        text: "추모 대행은 헌화, 잔디 정돈, 묘역 사진 회신까지를 한 세트로 드립니다. 분양(자리 안내)과 달리, 이미 모신 자리에 대한 방문·관리 서비스입니다.",
      },
      {
        type: "list",
        items: ["기일·한식·추석 대행", "헌화 + 묘역 사진 전송", "연간 정기 추모 계약", "현장 점검 후 결과 안내"],
      },
      {
        type: "cta",
        links: [{ href: "/consult?type=memorial&source=memorial", label: "상담신청", primary: true }],
      },
    ],
  },
  {
    section: "services",
    slug: "sangjo",
    kicker: "서비스상품",
    title: "상조",
    lead: "갑작스러운 이별에도 절차가 흔들리지 않도록 돕습니다.",
    blocks: [
      {
        type: "p",
        text: "상조는 장례 절차와 안장 일정을 잇는 동행입니다. 협력 장례식장·화장장 안내부터 봉안·수목·평장 안치까지 한 담당자가 이어 받습니다.",
      },
      {
        type: "list",
        items: ["24시간 상담 연결", "안치 일정·차량·제례 조율", "기존 상조 회원 연계 상담"],
      },
    ],
  },
  {
    section: "services",
    slug: "grave",
    kicker: "서비스상품",
    title: "묘지",
    lead: "이미 모신 묘의 관리·이전·서류까지 맡기는 서비스입니다.",
    blocks: [
      {
        type: "p",
        text: "분양안내가 ‘새 자리’라면, 서비스상품의 묘지는 ‘있는 자리’를 돌보는 일입니다. 벌초, 석물 기울기 보정, 이장 대행, 폐쇄 신고를 맡습니다.",
      },
      {
        type: "list",
        items: ["연 2회 기본 벌초", "석물·잔디 보수", "타 지역 이장 주선"],
      },
    ],
  },
  {
    section: "services",
    slug: "remodel",
    kicker: "서비스상품",
    title: "리모델링",
    lead: "오래된 봉분과 석물을 단정히 다시 세웁니다.",
    blocks: [
      {
        type: "p",
        text: "비가 스민 봉분, 기운 비석, 무너진 둘레석을 공원 경관 기준에 맞게 손봅니다. 시공 전 사진과 견적을 드리고, 끝난 뒤에도 사진을 남깁니다.",
      },
      {
        type: "list",
        items: ["봉분 재적·잔디 입히기", "비석·상석 교체 및 각명", "평장·와비 교체", "가족 묘역 동선 정비"],
      },
    ],
  },
];

export function getPage(section: string, slug: string): StaticPage | undefined {
  return pages.find((page) => page.section === section && page.slug === slug);
}

export function slugsOf(section: string): { slug: string }[] {
  return pages.filter((page) => page.section === section).map((page) => ({ slug: page.slug }));
}
