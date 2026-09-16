#!/usr/bin/env node
/**
 * Atlas DB를 비우고 1차 홈페이지용 notices / inquiries / faq / members / staff / cms / gallery 를 만듭니다.
 * 직원 계정은 SUPERVISOR_ID, SUPERVISOR_PASSWORD, ADMIN_SEED 환경변수로만 넣습니다. 평문 비번은 로그에 찍지 않습니다.
 * 사용: MONGODB_URI=... npm run seed
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "MP-Anyang";

function parseAdminSeed(raw) {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const i = chunk.indexOf(":");
      if (i <= 0) return null;
      const username = chunk.slice(0, i).trim();
      const password = chunk.slice(i + 1);
      if (!username || !password) return null;
      return { username, password };
    })
    .filter(Boolean);
}

async function staffFromEnv() {
  const rows = [];
  const supervisorId = process.env.SUPERVISOR_ID?.trim();
  const supervisorPassword = process.env.SUPERVISOR_PASSWORD ?? "";
  if (supervisorId && supervisorPassword) {
    rows.push({
      id: randomBytes(12).toString("hex"),
      username: supervisorId,
      name: "감독",
      title: "감독",
      phone: "",
      email: "",
      passwordHash: await bcrypt.hash(supervisorPassword, 12),
      role: "supervisor",
      createdAt: new Date(),
    });
  }
  for (const row of parseAdminSeed(process.env.ADMIN_SEED)) {
    if (rows.some((item) => item.username === row.username)) continue;
    rows.push({
      id: randomBytes(12).toString("hex"),
      username: row.username,
      name: row.username,
      title: "관리자",
      phone: "",
      email: "",
      passwordHash: await bcrypt.hash(row.password, 12),
      role: "admin",
      createdAt: new Date(),
    });
  }
  return rows;
}

if (!uri) {
  console.error("MONGODB_URI가 없습니다. .env.example을 보고 Atlas 연결 문자열을 넣은 뒤 다시 실행하세요.");
  console.error("URI가 없어도 사이트는 JSON 폴백으로 동작하며, 직원 시드는 SUPERVISOR_ID 등이 있으면 로그인 시 로컬 파일로 만듭니다.");
  process.exit(2);
}

const noticesPath = path.join(process.cwd(), "data", "notices.json");
const faqPath = path.join(process.cwd(), "data", "faq.json");
const notices = JSON.parse(await readFile(noticesPath, "utf8"));
const faq = JSON.parse(await readFile(faqPath, "utf8"));
const staff = await staffFromEnv();

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
  const faqCol = db.collection("faq");
  const membersCol = db.collection("members");
  const staffCol = db.collection("staff");
  const cmsCol = db.collection("cms");
  const galleryCol = db.collection("gallery");

  const noticeDocs = notices.map((n) => ({
    ...n,
    publishedAt: new Date(n.publishedAt),
  }));
  if (noticeDocs.length) await noticesCol.insertMany(noticeDocs);

  const faqDocs = faq.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));
  if (faqDocs.length) await faqCol.insertMany(faqDocs);

  if (staff.length) await staffCol.insertMany(staff);

  await noticesCol.createIndex({ slug: 1 }, { unique: true });
  await noticesCol.createIndex({ publishedAt: -1 });
  await inquiriesCol.createIndex({ createdAt: -1 });
  await inquiriesCol.createIndex({ id: 1 }, { unique: true, sparse: true });
  await faqCol.createIndex({ createdAt: -1 });
  await faqCol.createIndex({ id: 1 }, { unique: true, sparse: true });
  await membersCol.createIndex({ username: 1 }, { unique: true });
  await membersCol.createIndex({ phone: 1 }, { unique: true });
  await staffCol.createIndex({ username: 1 }, { unique: true });
  await cmsCol.createIndex({ slug: 1 }, { unique: true });
  await galleryCol.createIndex({ id: 1 }, { unique: true, sparse: true });

  console.log(
    `notices ${noticeDocs.length}건, faq ${faqDocs.length}건, staff ${staff.length}명, inquiries/members/cms/gallery 컬렉션을 만들었습니다.`,
  );
  if (!staff.length) {
    console.log("직원 시드가 비었습니다. SUPERVISOR_ID / SUPERVISOR_PASSWORD / ADMIN_SEED 를 넣고 다시 실행하세요.");
  }
} finally {
  await client.close();
}
