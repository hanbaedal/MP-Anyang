import { MongoClient, type Db } from "mongodb";

declare global {
  var _anyangMongo: { uri: string; pending: Promise<MongoClient> } | undefined;
}

export function mongoUriSet() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function hasMongo() {
  return mongoUriSet();
}

export function mongoDbName() {
  return process.env.MONGODB_DB?.trim() || "MP-Anyang";
}

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  if (!global._anyangMongo || global._anyangMongo.uri !== uri) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 12_000,
      connectTimeoutMS: 12_000,
    });
    global._anyangMongo = {
      uri,
      pending: client.connect().catch((error) => {
        global._anyangMongo = undefined;
        throw error;
      }),
    };
  }

  const client = await global._anyangMongo.pending;
  return client.db(mongoDbName());
}

/** Connect when URI is set. Throws if URI exists but the server cannot be reached. */
export async function requireDb(): Promise<Db> {
  if (!mongoUriSet()) {
    throw new Error("MONGODB_URI missing");
  }
  try {
    const db = await getDb();
    if (!db) throw new Error("MONGODB_URI missing");
    await db.command({ ping: 1 });
    return db;
  } catch (err) {
    console.error("[mongo] connect failed (URI set; value not logged)");
    throw err;
  }
}
