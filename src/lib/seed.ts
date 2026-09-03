import { hash } from "bcryptjs";
import type { Db } from "mongodb";

export async function ensureSeed(db: Db) {
  const users = db.collection("users");
  if ((await users.countDocuments()) > 0) return;

  const pw = await hash("admin1234", 12);
  await users.insertOne({
    username: "admin",
    password: pw,
    name: "관리자",
    role: "admin",
    createdAt: new Date(),
  });

  await db.collection("notices").insertMany([
    { title: "안양공원묘지 홈페이지가 새롭게 단장되었습니다.", content: "새로운 홈페이지를 통해 더 편리한 서비스를 제공하겠습니다.", createdAt: new Date() },
    { title: "추석 연휴 운영시간 안내", content: "추석 연휴 기간에는 08:00~19:00까지 연장 운영합니다.", createdAt: new Date() },
  ]);

  await db.collection("faqs").insertMany([
    { question: "봉안묘 분양 절차는 어떻게 되나요?", answer: "전화 또는 방문 상담 후 계약을 진행합니다. 상담신청 페이지를 이용해 주세요." },
    { question: "주차 공간이 있나요?", answer: "네, 무료 주차장을 운영하고 있습니다." },
    { question: "운영시간은 어떻게 되나요?", answer: "매일 08:00~18:00 (동절기 08:00~17:30) 입니다." },
  ]);

  await db.collection("gallery").insertMany([
    { title: "안양공원묘지 전경", imageUrl: "/images/hero-panorama.jpg", createdAt: new Date() },
    { title: "정원 풍경", imageUrl: "/images/hero-panorama.jpg", createdAt: new Date() },
  ]);
}
