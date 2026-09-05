import { hash } from "bcryptjs";
import type { Db } from "mongodb";

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
  }
}

/** @deprecated use ensureAdmins + ensureSampleData */
export async function ensureSeed(db: Db) {
  await ensureAdmins(db);
  await ensureSampleData(db);
}
