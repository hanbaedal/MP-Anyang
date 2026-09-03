import { hash } from "bcryptjs";
import type { Db } from "mongodb";

export async function ensureSeed(db: Db) {
  const users = db.collection("users");
  if ((await users.countDocuments()) > 0) return;

  const admins = [
    { username: "MP-Anyang-00", plainPw: "MPA000!", name: "관리자1" },
    { username: "MP-Anyang-01", plainPw: "MPA001", name: "관리자2" },
  ];

  for (const a of admins) {
    const passwordHash = await hash(a.plainPw, 12);
    await users.insertOne({
      username: a.username,
      passwordHash,
      name: a.name,
      role: "admin",
      createdAt: new Date(),
    });
  }

  await db.collection("notices").insertMany([
    { title: "안양공원묘지 홈페이지가 새롭게 단장되었습니다.", content: "새로운 홈페이지를 통해 더 편리한 서비스를 제공하겠습니다.", author: "관리자", createdAt: new Date() },
    { title: "추석 연휴 운영시간 안내", content: "추석 연휴 기간에는 08:00~19:00까지 연장 운영합니다.", author: "관리자", createdAt: new Date() },
  ]);

  await db.collection("faqs").insertMany([
    { question: "봉안묘 분양 절차는 어떻게 되나요?", answer: "전화 또는 방문 상담 후 계약을 진행합니다. 상담신청 페이지를 이용해 주세요.", order: 1 },
    { question: "주차 공간이 있나요?", answer: "네, 무료 주차장을 운영하고 있습니다.", order: 2 },
    { question: "운영시간은 어떻게 되나요?", answer: "매일 08:00~18:00 (동절기 08:00~17:30) 입니다.", order: 3 },
  ]);

  await db.collection("gallery").insertMany([
    { title: "안양공원묘지 전경", imageUrl: "/images/hero-panorama.jpg", createdAt: new Date() },
    { title: "정원 풍경", imageUrl: "/images/hero-panorama.jpg", createdAt: new Date() },
  ]);

  await db.collection("Anyang").insertMany([
    { plotNo: "A-101", deceasedName: "홍길동", familyName: "홍", zone: "A구역", type: "봉안묘", buriedAt: "2020-03-15" },
    { plotNo: "B-205", deceasedName: "김철수", familyName: "김", zone: "B구역", type: "매장묘", buriedAt: "2019-11-22" },
    { plotNo: "C-310", deceasedName: "이영희", familyName: "이", zone: "C구역", type: "수목장", buriedAt: "2021-05-01" },
  ]);
}
