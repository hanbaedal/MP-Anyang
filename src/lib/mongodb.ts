import { MongoClient, type Db } from "mongodb";
import { ensureAdmins, ensureSampleData } from "./seed";

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "MP-Anyang";

function requireMongoUri() {
  if (!mongoUri?.trim()) {
    throw new Error("MONGODB_URI가 없습니다.");
  }
  return mongoUri.trim();
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoAdminsPromise: Promise<void> | undefined;
  var _mongoSampleSeedStarted: boolean | undefined;
}

function getClientPromise() {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(requireMongoUri(), {
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 15_000,
      socketTimeoutMS: 45_000,
    });
    global._mongoClientPromise = client.connect().catch((error) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(dbName);

  if (!global._mongoAdminsPromise) {
    global._mongoAdminsPromise = ensureAdmins(db).catch((error) => {
      global._mongoAdminsPromise = undefined;
      console.error("[mongodb] admin seed failed:", error);
      throw error;
    });
  }
  await global._mongoAdminsPromise;

  if (!global._mongoSampleSeedStarted) {
    global._mongoSampleSeedStarted = true;
    void ensureSampleData(db).catch((error) => {
      console.error("[mongodb] sample seed failed:", error);
    });
  }

  return db;
}

export async function pingDb() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return db.databaseName;
}
