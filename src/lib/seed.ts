import bcrypt from "bcryptjs";
import type { Db } from "mongodb";

export async function ensureSeed(db: Db) {
  const users = db.collection("users");
  const adminName = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "AnyangPark2026!";
  const existing = await users.findOne({ username: adminName });
  if (!existing) {
    await users.insertOne({
      username: adminName,
      name: "관리자",
      role: "admin",
      passwordHash: await bcrypt.hash(adminPass, 10),
      createdAt: new Date(),
    });
  }

  const notices = db.collection("notices");
  if ((await notices.countDocuments()) === 0) {
    await notices.insertMany([
      {
        title: "홈페이지를 열었습니다",
        content:
          "안양공원묘지 누리집을 열었습니다. 묘역찾기와 상담신청, 고객센터 게시판을 이용해 주십시오. 전화 상담은 031-421-9165입니다.",
        author: "관리자",
        createdAt: new Date(),
      },
      {
        title: "성묘철 주차 안내",
        content:
          "한식·추석 전후 3일은 하단 주차장과 임시 주차장을 함께 엽니다. 셔틀은 관리사무실 앞에서 운행합니다. 가급적 대중교통을 이용해 주십시오.",
        author: "관리자",
        createdAt: new Date(),
      },
    ]);
  }

  const faqs = db.collection("faqs");
  if ((await faqs.countDocuments()) === 0) {
    await faqs.insertMany([
      {
        question: "방문 가능 시간은 언제인가요?",
        answer: "묘역은 일출부터 일몰까지, 관리사무실은 매일 08:00–18:00(동절기 17:30) 엽니다.",
        order: 1,
      },
      {
        question: "묘 위치를 모르면 어떻게 찾나요?",
        answer:
          "우측 하단 ‘묘역찾기’에서 고인 성함 또는 묘번을 검색하거나, 사무실 031-421-9165로 연락 주십시오.",
        order: 2,
      },
      {
        question: "상담신청과 문의사항은 무엇이 다른가요?",
        answer:
          "상담신청은 분양·상조·리모델링을 빠르게 접수하는 서식입니다. 문의사항은 글과 답변이 남는 게시판입니다.",
        order: 3,
      },
      {
        question: "자유게시판은 누구나 쓰나요?",
        answer: "읽기는 누구나, 글쓰기는 로그인 후 가능합니다. 상업 홍보·비방은 관리자가 내립니다.",
        order: 4,
      },
    ]);
  }

  const graves = db.collection("Anyang");
  if ((await graves.countDocuments()) === 0) {
    await graves.insertMany([
      {
        plotNo: "A-101",
        zone: "청계 1단지",
        type: "봉안묘",
        deceasedName: "김○○",
        familyName: "김",
        buriedAt: "2016-03-12",
      },
      {
        plotNo: "A-214",
        zone: "청계 1단지",
        type: "봉안묘",
        deceasedName: "이○○",
        familyName: "이",
        buriedAt: "2018-11-02",
      },
      {
        plotNo: "B-033",
        zone: "솔숲 수목장",
        type: "수목장",
        deceasedName: "박○○",
        familyName: "박",
        buriedAt: "2021-05-20",
      },
      {
        plotNo: "C-012",
        zone: "남향 매장",
        type: "매장묘",
        deceasedName: "최○○",
        familyName: "최",
        buriedAt: "2009-09-18",
      },
      {
        plotNo: "D-088",
        zone: "잔디 평장",
        type: "평장묘",
        deceasedName: "정○○",
        familyName: "정",
        buriedAt: "2019-04-07",
      },
      {
        plotNo: "D-089",
        zone: "잔디 평장",
        type: "평장묘",
        deceasedName: "한○○",
        familyName: "한",
        buriedAt: "2022-10-15",
      },
    ]);
  }

  const gallery = db.collection("gallery");
  if ((await gallery.countDocuments()) === 0) {
    await gallery.insertMany([
      { title: "공원 전경", imageUrl: "/images/park-panorama.png", createdAt: new Date() },
      { title: "추모 정원", imageUrl: "/images/facility-garden.png", createdAt: new Date() },
      { title: "수목장", imageUrl: "/images/lot-tree.png", createdAt: new Date() },
      { title: "봉안묘", imageUrl: "/images/lot-columbarium.png", createdAt: new Date() },
    ]);
  }

  await users.createIndex({ username: 1 }, { unique: true });
  await graves.createIndex({ plotNo: 1 });
  await graves.createIndex({ deceasedName: 1 });
  await graves.createIndex({ familyName: 1 });
}
