import { MongoClient, type Db } from "mongodb";
import { ensureSeed } from "./seed";

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "MP-Anyang";

function requireMongoUri() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI가 없습니다.");
  }
  return mongoUri;
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoSeeded: boolean | undefined;
}

function getClientPromise() {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(requireMongoUri());
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(dbName);
  if (!global._mongoSeeded) {
    await ensureSeed(db);
    global._mongoSeeded = true;
  }
  return db;
}
