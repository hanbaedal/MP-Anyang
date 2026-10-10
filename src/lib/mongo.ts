import { setDefaultResultOrder } from "node:dns";
import { MongoClient, type Db } from "mongodb";
import { logMongoFailure, mongoUserMessage, MONGO_WRITE_FAILED } from "./mongo-error";

export {
  inspectMongoError,
  isMongoFailure,
  logMongoFailure,
  mongoUserMessage,
  MONGO_AUTH_FAILED,
  MONGO_FORBIDDEN,
  MONGO_URI_BAD,
  MONGO_URI_MISSING,
  MONGO_WRITE_FAILED,
} from "./mongo-error";

setDefaultResultOrder("ipv4first");

declare global {
  var _anyangMongo: { uri: string; client: MongoClient; pending: Promise<MongoClient> } | undefined;
}

const CONNECT_MS = 12_000;

export function mongoUriSet() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function hasMongo() {
  return mongoUriSet();
}

export function mongoDbName() {
  return process.env.MONGODB_DB?.trim() || "MP-Anyang";
}

function clientOptions() {
  return {
    serverSelectionTimeoutMS: CONNECT_MS,
    connectTimeoutMS: CONNECT_MS,
    family: 4 as const,
    autoSelectFamily: false,
  };
}

async function resetMongoClient() {
  const cached = global._anyangMongo;
  global._anyangMongo = undefined;
  if (!cached) return;
  try {
    const client = await cached.pending.catch(() => cached.client);
    await client.close();
  } catch {
    /* ignore stale close */
  }
}

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  if (!global._anyangMongo || global._anyangMongo.uri !== uri) {
    const client = new MongoClient(uri, clientOptions());
    global._anyangMongo = {
      uri,
      client,
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
  const uri = process.env.MONGODB_URI?.trim() || "";
  const reuse = Boolean(global._anyangMongo && global._anyangMongo.uri === uri);
  try {
    const first = await getDb();
    if (!first) throw new Error("MONGODB_URI missing");
    try {
      await first.command({ ping: 1 });
      return first;
    } catch (pingErr) {
      if (!reuse || mongoUserMessage(pingErr) !== MONGO_WRITE_FAILED) throw pingErr;
      logMongoFailure("ping failed; reconnecting", pingErr);
      await resetMongoClient();
      const retry = await getDb();
      if (!retry) throw new Error("MONGODB_URI missing");
      await retry.command({ ping: 1 });
      return retry;
    }
  } catch (err) {
    logMongoFailure("connect failed", err);
    throw err;
  }
}
