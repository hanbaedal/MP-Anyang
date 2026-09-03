import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export async function getNotices() {
  const db = await getDb();
  return db.collection("notices").find().sort({ createdAt: -1 }).toArray();
}

export async function getFaqs() {
  const db = await getDb();
  return db.collection("faqs").find().sort({ order: 1 }).toArray();
}

export async function getGallery() {
  const db = await getDb();
  return db.collection("gallery").find().sort({ createdAt: -1 }).toArray();
}

export async function getBoard() {
  const db = await getDb();
  return db.collection("boardPosts").find().sort({ createdAt: -1 }).toArray();
}

export async function createBoardPost(input: { title: string; content: string; author: string; userId: string }) {
  const db = await getDb();
  await db.collection("boardPosts").insertOne({ ...input, createdAt: new Date() });
}

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

export async function createConsult(input: { name: string; phone: string; lotType: string; message: string }) {
  const db = await getDb();
  await db.collection("consults").insertOne({ ...input, createdAt: new Date() });
}

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

export async function findUserByUsername(username: string) {
  const db = await getDb();
  return db.collection("users").findOne({ username });
}

export function toId(v: unknown) {
  if (v instanceof ObjectId) return v.toString();
  return String(v);
}
