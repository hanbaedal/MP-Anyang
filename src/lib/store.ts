import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

/* ── helpers ── */
export function toId(v: unknown) {
  if (v instanceof ObjectId) return v.toString();
  return String(v);
}
function oid(id: string) {
  return ObjectId.createFromHexString(id);
}

/* ── 공지사항 ── */
export async function getNotices() {
  const db = await getDb();
  return db.collection("notices").find().sort({ createdAt: -1 }).toArray();
}
export async function createNotice(input: { title: string; content: string; author: string }) {
  const db = await getDb();
  await db.collection("notices").insertOne({ ...input, createdAt: new Date() });
}
export async function updateNotice(id: string, input: { title: string; content: string }) {
  const db = await getDb();
  await db.collection("notices").updateOne({ _id: oid(id) }, { $set: input });
}
export async function deleteNotice(id: string) {
  const db = await getDb();
  await db.collection("notices").deleteOne({ _id: oid(id) });
}

/* ── FAQ ── */
export async function getFaqs() {
  const db = await getDb();
  return db.collection("faqs").find().sort({ order: 1 }).toArray();
}
export async function createFaq(input: { question: string; answer: string }) {
  const db = await getDb();
  const count = await db.collection("faqs").countDocuments();
  await db.collection("faqs").insertOne({ ...input, order: count + 1 });
}
export async function updateFaq(id: string, input: { question: string; answer: string }) {
  const db = await getDb();
  await db.collection("faqs").updateOne({ _id: oid(id) }, { $set: input });
}
export async function deleteFaq(id: string) {
  const db = await getDb();
  await db.collection("faqs").deleteOne({ _id: oid(id) });
}

/* ── 갤러리 ── */
export async function getGallery() {
  const db = await getDb();
  return db.collection("gallery").find().sort({ createdAt: -1 }).toArray();
}
export async function createGalleryItem(input: { title: string; imageUrl: string }) {
  const db = await getDb();
  await db.collection("gallery").insertOne({ ...input, createdAt: new Date() });
}
export async function deleteGalleryItem(id: string) {
  const db = await getDb();
  await db.collection("gallery").deleteOne({ _id: oid(id) });
}

/* ── 자유게시판 ── */
export async function getBoard() {
  const db = await getDb();
  return db.collection("boardPosts").find().sort({ createdAt: -1 }).toArray();
}
export async function createBoardPost(input: { title: string; content: string; author: string; userId: string }) {
  const db = await getDb();
  await db.collection("boardPosts").insertOne({ ...input, createdAt: new Date() });
}
export async function deleteBoardPost(id: string) {
  const db = await getDb();
  await db.collection("boardPosts").deleteOne({ _id: oid(id) });
}

/* ── 문의사항 ── */
export async function getInquiry() {
  const db = await getDb();
  return db.collection("inquiries").find().sort({ createdAt: -1 }).toArray();
}
export async function createInquiry(input: {
  name: string;
  phone: string;
  category: string;
  message: string;
  userId?: string;
}) {
  const db = await getDb();
  await db.collection("inquiries").insertOne({ ...input, createdAt: new Date() });
}
export async function deleteInquiry(id: string) {
  const db = await getDb();
  await db.collection("inquiries").deleteOne({ _id: oid(id) });
}

/* ── 상담 ── */
export async function createConsult(input: { name: string; phone: string; lotType: string; message: string }) {
  const db = await getDb();
  await db.collection("consults").insertOne({ ...input, createdAt: new Date() });
}

/* ── 묘역 검색 ── */
export async function searchGrave(query: string) {
  const db = await getDb();
  const q = query.trim();
  if (!q) return [];
  return db
    .collection("Anyang")
    .find({
      $or: [
        { plotNo: { $regex: q, $options: "i" } },
        { deceasedName: { $regex: q, $options: "i" } },
        { familyName: { $regex: q, $options: "i" } },
      ],
    })
    .limit(20)
    .toArray();
}

/* ── 묘역 CRUD (관리자) ── */
export async function createGrave(input: { plotNo: string; deceasedName: string; familyName: string; zone: string; type: string; buriedAt: string }) {
  const db = await getDb();
  await db.collection("Anyang").insertOne({ ...input });
}
export async function deleteGrave(id: string) {
  const db = await getDb();
  await db.collection("Anyang").deleteOne({ _id: oid(id) });
}

/* ── 사용자 ── */
export async function findUserByUsername(username: string) {
  const db = await getDb();
  return db.collection("users").findOne({ username });
}
