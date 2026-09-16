#!/usr/bin/env node
/**
 * Atlas DB를 비우고 1차 홈페이지용 notices / inquiries만 만듭니다.
 * 사용: MONGODB_URI=... npm run seed
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "MP-Anyang";

if (!uri) {
  console.error("MONGODB_URI가 없습니다. .env.example을 보고 Atlas 연결 문자열을 넣은 뒤 다시 실행하세요.");
  console.error("URI가 없어도 사이트는 data/notices.json 폴백으로 동작합니다.");
  process.exit(2);
}

const noticesPath = path.join(process.cwd(), "data", "notices.json");
const notices = JSON.parse(await readFile(noticesPath, "utf8"));

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 20_000,
});

try {
  await client.connect();
  const db = client.db(dbName);
  const existing = await db.listCollections().toArray();
  console.log(`DB ${dbName} 기존 컬렉션 ${existing.length}개: ${existing.map((c) => c.name).join(", ") || "(없음)"}`);

  await db.dropDatabase();
  console.log(`DB ${dbName} 를 비웠습니다.`);

  const noticesCol = db.collection("notices");
  const inquiriesCol = db.collection("inquiries");

  const docs = notices.map((n) => ({
    ...n,
    publishedAt: new Date(n.publishedAt),
  }));
  if (docs.length) await noticesCol.insertMany(docs);

  await noticesCol.createIndex({ slug: 1 }, { unique: true });
  await noticesCol.createIndex({ publishedAt: -1 });
  await inquiriesCol.createIndex({ createdAt: -1 });

  console.log(`notices ${docs.length}건, inquiries 빈 컬렉션을 만들었습니다.`);
} finally {
  await client.close();
}
