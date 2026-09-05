import { hash } from "bcryptjs";
import type { Db } from "mongodb";
import { DEMO_FAMILY_MEMBER, DEMO_MEMORIAL_HALLS, DEMO_MEMORIAL_VIDEO } from "./memorial-demo";

const ADMINS = [
  { username: "MP-Anyang-00", plainPw: "MPA000!", name: "슈퍼바이저" },
  { username: "MP-Anyang-01", plainPw: "MPA001", name: "관리자" },
];

const SAMPLE_IMAGE = "/images/park-panorama.png";

const PARK_DEMO_PHOTOS = [
  { title: "공원 전경", imageUrl: "/images/park-panorama.png", season: "사계절" },
  { title: "추모 정원", imageUrl: "/images/facility-garden.png", season: "봄" },
  { title: "숲길 산책로", imageUrl: "/images/lot-tree.png", season: "여름" },
  { title: "공원 카페", imageUrl: "/images/facility-cafe.png", season: "사계절" },
  { title: "식당 · 휴게", imageUrl: "/images/facility-restaurant.png", season: "가을" },
];

const GRAVE_DEMO_PHOTOS = [
  "/images/lot-columbarium.png",
  "/images/facility-garden.png",
  "/images/park-panorama.png",
  "/images/lot-flat.png",
  "/images/facility-garden.png",
];

const DEMO_GRAVE_PLOTS = ["A-101", "B-205", "C-310"];

const DEMO_INSPECTED_AT = "2026-03-01";

export async function ensureAdmins(db: Db) {
  const users = db.collection("users");

  for (const a of ADMINS) {
    const passwordHash = await hash(a.plainPw, 12);
    await users.updateOne(
      { username: a.username },
      {
        $set: {
          username: a.username,
          passwordHash,
          name: a.name,
          role: "admin",
        },
        $unset: { password: "" },
        $setOnInsert: { phone: "", email: "", createdAt: new Date() },
      },
      { upsert: true },
    );
  }
}

export async function ensureSampleData(db: Db) {
  if ((await db.collection("notices").countDocuments()) === 0) {
    await db.collection("notices").insertMany([
      { title: "안양공원묘지 홈페이지가 새롭게 단장되었습니다.", content: "새로운 홈페이지를 통해 더 편리한 서비스를 제공하겠습니다.", author: "관리자", createdAt: new Date() },
      { title: "추석 연휴 운영시간 안내", content: "추석 연휴 기간에는 08:00~19:00까지 연장 운영합니다.", author: "관리자", createdAt: new Date() },
    ]);
  }

  if ((await db.collection("faqs").countDocuments()) === 0) {
    await db.collection("faqs").insertMany([
      { question: "봉안묘 분양 절차는 어떻게 되나요?", answer: "전화 또는 방문 상담 후 계약을 진행합니다. 상담신청 페이지를 이용해 주세요.", order: 1 },
      { question: "주차 공간이 있나요?", answer: "네, 무료 주차장을 운영하고 있습니다.", order: 2 },
      { question: "운영시간은 어떻게 되나요?", answer: "매일 08:00~18:00 (동절기 08:00~17:30) 입니다.", order: 3 },
    ]);
  }

  if ((await db.collection("gallery").countDocuments()) === 0) {
    await db.collection("gallery").insertMany([
      { title: "안양공원묘지 전경", imageUrl: SAMPLE_IMAGE, createdAt: new Date() },
      { title: "정원 풍경", imageUrl: SAMPLE_IMAGE, createdAt: new Date() },
    ]);
  }

  if ((await db.collection("parkPhotos").countDocuments()) === 0) {
    await db.collection("parkPhotos").insertMany(
      PARK_DEMO_PHOTOS.map((photo) => ({ ...photo, createdAt: new Date() })),
    );
  }

  if ((await db.collection("Anyang").countDocuments()) === 0) {
    await db.collection("Anyang").insertMany([
      {
        plotNo: "A-101",
        deceasedName: "홍길동",
        familyName: "홍",
        zone: "A구역",
        type: "봉안묘",
        capacity: "2기",
        buriedAt: "2020-03-15",
        photos: [...GRAVE_DEMO_PHOTOS],
        mapNote: "정문 입구 → 왼쪽 소나무길 200m → A구역 안내판",
        lastInspectedAt: "",
        inspectNote: "",
        createdAt: new Date(),
      },
      {
        plotNo: "B-205",
        deceasedName: "김철수",
        familyName: "김",
        zone: "B구역",
        type: "매장묘",
        capacity: "합장형",
        buriedAt: "2019-11-22",
        photos: [...GRAVE_DEMO_PHOTOS],
        mapNote: "제2주차장 → 언덕길 → B구역 205번",
        lastInspectedAt: "",
        inspectNote: "",
        createdAt: new Date(),
      },
      {
        plotNo: "C-310",
        deceasedName: "이영희",
        familyName: "이",
        zone: "C구역",
        type: "수목장",
        capacity: "1기",
        buriedAt: "2021-05-01",
        photos: [...GRAVE_DEMO_PHOTOS],
        mapNote: "카페 옆 산책로 → 수목장 C열",
        lastInspectedAt: "",
        inspectNote: "",
        createdAt: new Date(),
      },
    ]);
  }
}

/** 기존 DB에 데모 풍광·묘역 사진이 비어 있으면 5장 보강 */
export async function ensureDemoMedia(db: Db) {
  const park = db.collection("parkPhotos");
  const parkCount = await park.countDocuments();
  if (parkCount < 5) {
    if (parkCount > 0) await park.deleteMany({});
    await park.insertMany(PARK_DEMO_PHOTOS.map((photo) => ({ ...photo, createdAt: new Date() })));
  }

  const graves = db.collection("Anyang");
  for (const plotNo of DEMO_GRAVE_PLOTS) {
    const grave = await graves.findOne({ plotNo });
    if (!grave) continue;
    const photos = (grave.photos as string[] | undefined) || [];
    if (photos.filter(Boolean).length === 0) {
      await graves.updateOne({ plotNo }, { $set: { photos: [...GRAVE_DEMO_PHOTOS] } });
    }
    const capacityByPlot: Record<string, string> = {
      "A-101": "2기",
      "B-205": "합장형",
      "C-310": "1기",
    };
    if (!grave.capacity && capacityByPlot[plotNo]) {
      await graves.updateOne({ plotNo }, { $set: { capacity: capacityByPlot[plotNo] } });
    }
    if (!grave.lastInspectedAt) {
      await graves.updateOne(
        { plotNo },
        { $set: { lastInspectedAt: DEMO_INSPECTED_AT, inspectNote: "데모 점검 — 추모관 연동용" } },
      );
    }
  }
}

/** 데모 회원·추모관·타임라인 샘플 */
export async function ensureDemoMemorial(db: Db) {
  try {
    await ensureDemoMemorialInner(db);
  } catch (error) {
    console.error("[seed] ensureDemoMemorial failed:", error);
  }
}

async function ensureDemoMemorialInner(db: Db) {
  const users = db.collection("users");
  const halls = db.collection("memorialHalls");
  const entries = db.collection("memorialEntries");
  const jobs = db.collection("memorialJobs");

  const passwordHash = await hash(DEMO_FAMILY_MEMBER.password, 12);
  const memberResult = await users.findOneAndUpdate(
    { username: DEMO_FAMILY_MEMBER.username },
    {
      $set: {
        username: DEMO_FAMILY_MEMBER.username,
        passwordHash,
        name: DEMO_FAMILY_MEMBER.name,
        phone: DEMO_FAMILY_MEMBER.phone,
        email: DEMO_FAMILY_MEMBER.email,
        plotNo: DEMO_FAMILY_MEMBER.plotNo,
        role: "member",
        relations: [{ deceasedName: "홍길동", relation: "자", plotNo: "A-101" }],
        registeredAt: "2024-01-01",
        feeStatus: "완납",
        annualFee: 120000,
        smsConsent: true,
        marketingSmsConsent: false,
      },
      $setOnInsert: { feeHistory: [], createdAt: new Date() },
    },
    { upsert: true, returnDocument: "after" },
  );
  const memberRaw = memberResult as unknown as { value?: { _id?: unknown } | null; _id?: unknown } | null;
  const memberDoc = memberRaw && "value" in memberRaw && memberRaw.value !== undefined ? memberRaw.value : memberRaw;
  const memberId = memberDoc?._id ? String(memberDoc._id) : "";

  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    return d;
  };

  type EntrySeed = {
    demoKey: string;
    hallCode: string;
    type: "photo" | "video" | "text" | "grave_snapshot" | "event" | "edited_video";
    title: string;
    body: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    eventKind?: string;
    eventDate?: string;
    authorName: string;
    daysAgo: number;
  };

  const entrySeeds: EntrySeed[] = [
    {
      demoKey: "intro-text",
      hallCode: "DEMO-A101",
      type: "text",
      title: "아버지를 그리며",
      body: "demo:intro-text\n청계산 자락을 함께 걸으며 나누었던 이야기들. 사이버 추모관에 마음을 모아 둡니다.",
      authorName: "최창길",
      daysAgo: 120,
    },
    {
      demoKey: "family-photo",
      hallCode: "DEMO-A101",
      type: "photo",
      title: "1985년 가족 여행",
      body: "demo:family-photo",
      mediaUrl: "/images/facility-garden.png",
      mediaType: "image",
      eventKind: "family",
      authorName: "최창길",
      daysAgo: 90,
    },
    {
      demoKey: "grave-snap",
      hallCode: "DEMO-A101",
      type: "grave_snapshot",
      title: "A-101 묘역 현황",
      body: "demo:grave-snap",
      mediaUrl: "/images/lot-columbarium.png",
      mediaType: "image",
      eventKind: "grave_inspection",
      eventDate: DEMO_INSPECTED_AT,
      authorName: "안양공원",
      daysAgo: 14,
    },
    {
      demoKey: "memorial-event",
      hallCode: "DEMO-A101",
      type: "event",
      title: "기일 추모의 날",
      body: "demo:memorial-event\n홍길동님의 기일에 맞춰 추모관이 갱신되었습니다.",
      eventKind: "memorial_day",
      eventDate: "2026-03-15",
      authorName: "추모 이벤트",
      daysAgo: 7,
    },
    {
      demoKey: "edited-video",
      hallCode: "DEMO-A101",
      type: "edited_video",
      title: "2026년 설날 추모 영상 (샘플)",
      body: "demo:edited-video\n운영팀이 가족 자료를 바탕으로 편집한 추모 영상 예시입니다.",
      mediaUrl: DEMO_MEMORIAL_VIDEO,
      mediaType: "video",
      eventKind: "staff_edit",
      authorName: "관리자",
      daysAgo: 3,
    },
    {
      demoKey: "b-family",
      hallCode: "DEMO-B205",
      type: "photo",
      title: "언덕길을 함께 오르던 날",
      body: "demo:b-family",
      mediaUrl: "/images/lot-burial.png",
      mediaType: "image",
      authorName: "김가족",
      daysAgo: 60,
    },
    {
      demoKey: "b-grave",
      hallCode: "DEMO-B205",
      type: "grave_snapshot",
      title: "B-205 묘역 현황",
      body: "demo:b-grave",
      mediaUrl: "/images/lot-flat.png",
      mediaType: "image",
      eventKind: "grave_inspection",
      eventDate: DEMO_INSPECTED_AT,
      authorName: "안양공원",
      daysAgo: 14,
    },
    {
      demoKey: "c-tree",
      hallCode: "DEMO-C310",
      type: "text",
      title: "수목 아래에서",
      body: "demo:c-tree\n봄마다 찾아뵙던 수목장. 바람과 향기가 그리운 계절입니다.",
      authorName: "이가족",
      daysAgo: 45,
    },
    {
      demoKey: "c-photo",
      hallCode: "DEMO-C310",
      type: "photo",
      title: "손주와 함께한 봄날",
      body: "demo:c-photo",
      mediaUrl: "/images/lot-tree.png",
      mediaType: "image",
      authorName: "이가족",
      daysAgo: 30,
    },
  ];

  for (const hall of DEMO_MEMORIAL_HALLS) {
    const memberIds = hall.code === "DEMO-A101" && memberId ? [memberId] : [];
    await halls.updateOne(
      { code: hall.code },
      {
        $set: {
          code: hall.code,
          plotNo: hall.plotNo,
          deceasedName: hall.deceasedName,
          memberIds,
          visibility: hall.visibility,
          deathDate: hall.deathDate,
          coverUrl: hall.coverUrl,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const seed of entrySeeds) {
    const exists = await entries.findOne({ hallCode: seed.hallCode, body: { $regex: `^demo:${seed.demoKey}` } });
    if (exists) continue;
    const createdAt = day(seed.daysAgo);
    await entries.insertOne({
      hallCode: seed.hallCode,
      type: seed.type,
      title: seed.title,
      body: seed.body.startsWith("demo:") ? seed.body : `demo:${seed.demoKey}\n${seed.body}`,
      mediaUrl: seed.mediaUrl,
      mediaType: seed.mediaType,
      eventKind: seed.eventKind,
      eventDate: seed.eventDate,
      authorId: seed.authorName === "관리자" ? "admin-demo" : memberId || "demo",
      authorName: seed.authorName,
      status: "published",
      createdAt,
    });
  }

  await entries.updateMany({ hallCode: "DEMO-A101", authorName: "홍길순" }, { $set: { authorName: DEMO_FAMILY_MEMBER.name } });
  await jobs.updateMany({ hallCode: "DEMO-A101", requesterName: "홍길순" }, { $set: { requesterName: DEMO_FAMILY_MEMBER.name } });
  await entries.updateMany(
    { body: { $regex: "^demo:edited-video" } },
    { $set: { mediaUrl: DEMO_MEMORIAL_VIDEO, mediaType: "video", type: "edited_video" } },
  );

  const jobExists = await jobs.findOne({ hallCode: "DEMO-A101", note: { $regex: "데모 편집" } });
  if (!jobExists && memberId) {
    await jobs.insertOne({
      hallCode: "DEMO-A101",
      deceasedName: "홍길동",
      plotNo: "A-101",
      requestedBy: memberId,
      requesterName: DEMO_FAMILY_MEMBER.name,
      status: "in_progress",
      note: "데모 편집 — 2026년 가족 추억 영상 요청",
      staffNote: "샘플 데이터 — 편집 중",
      createdAt: day(5),
      updatedAt: day(1),
    });
  }
}

/** @deprecated use ensureAdmins + ensureSampleData */
export async function ensureSeed(db: Db) {
  await ensureAdmins(db);
  await ensureSampleData(db);
}
