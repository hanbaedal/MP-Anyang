import { MongoClient, type Db } from "mongodb";

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
  return client.db(dbName);
}
