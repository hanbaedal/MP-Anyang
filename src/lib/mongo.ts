import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "MP-Anyang";

declare global {
  var _anyangMongo: Promise<MongoClient> | undefined;
}

export function hasMongo() {
  return Boolean(uri);
}

export function mongoDbName() {
  return dbName;
}

export async function getDb(): Promise<Db | null> {
  if (!uri) return null;

  if (!global._anyangMongo) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 12_000,
      connectTimeoutMS: 12_000,
    });
    global._anyangMongo = client.connect().catch((error) => {
      global._anyangMongo = undefined;
      throw error;
    });
  }

  const client = await global._anyangMongo;
  return client.db(dbName);
}
