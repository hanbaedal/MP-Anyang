import type { Filter } from "mongodb";
import type { SessionUser } from "./auth-types";
import { getDb, mongoUriSet } from "./mongo";

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|HeadlessChrome|Bytespider/i;
const SKIP_PREFIXES = ["/api/", "/_next/", "/icon", "/robots", "/sitemap.xml"];
const PRESENCE_THROTTLE_MS = 120_000;
const HEARTBEAT_SECONDS = 60;

function kstDateKey(d = new Date()) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

/** Mongo $inc dotted path — `/`·`.` 를 쓰면 업데이트가 실패할 수 있음 */
export function pathStatKey(pathname: string) {
  const raw = pathname.split("?")[0].slice(0, 160) || "/";
  if (raw === "/") return "|root|";
  return raw.replace(/\./g, "_").replace(/\//g, "|");
}

export function pathStatKeyToLabel(key: string) {
  if (key === "|root|") return "/";
  return key.replace(/\|/g, "/");
}

export function isAnalyticsBot(userAgent: string | null | undefined) {
  if (!userAgent) return false;
  return BOT_RE.test(userAgent);
}

export function shouldSkipAnalyticsPath(pathname: string) {
  if (!pathname || pathname === "/favicon.ico") return true;
  return SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type DailyDoc = {
  _id: string;
  publicPv: number;
  staffPv: number;
  paths: Record<string, number>;
  updatedAt: Date;
};

type StaffPresenceDoc = {
  _id: string;
  username: string;
  name: string;
  role: string;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  lastIp?: string;
  activeSeconds?: number;
};

export async function trackPageView(input: {
  pathname: string;
  session: SessionUser | null;
  userAgent?: string | null;
  ip?: string | null;
}) {
  if (!mongoUriSet()) return;
  const { pathname, session, userAgent } = input;
  if (shouldSkipAnalyticsPath(pathname)) return;
  if (isAnalyticsBot(userAgent)) return;

  try {
    const db = await getDb();
    if (!db) return;
    const date = kstDateKey();
    const pathKey = pathStatKey(pathname);
    const isStaff = Boolean(session);
    const col = db.collection<DailyDoc>("analytics_daily");
    await col.updateOne(
      { _id: date },
      {
        $inc: { [isStaff ? "staffPv" : "publicPv"]: 1 },
        $set: { updatedAt: new Date() },
        $setOnInsert: { publicPv: 0, staffPv: 0, paths: {} },
      },
      { upsert: true },
    );
    /* 비로그인: 일별 공개 PV만. 경로별 집계는 직원 세션만 */
    if (isStaff) {
      await col.updateOne({ _id: date }, { $inc: { [`paths.${pathKey}`]: 1 } });
    }

    if (session) {
      await touchStaffPresence(session, input.ip ?? null, false);
    }
  } catch (err) {
    console.error("[site-analytics] trackPageView failed");
    console.error(err);
  }
}

export async function recordStaffLogin(user: SessionUser, ip?: string | null, userAgent?: string | null) {
  if (!mongoUriSet()) return;
  try {
    const db = await getDb();
    if (!db) return;
    const at = new Date();
    await db.collection("staff_audit").insertOne({
      at,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      action: "login",
      ip: ip?.slice(0, 64) ?? "",
      userAgent: userAgent?.slice(0, 256) ?? "",
    });
    await db.collection<StaffPresenceDoc>("staff_presence").updateOne(
      { _id: user.id },
      {
        $set: {
          username: user.username,
          name: user.name,
          role: user.role,
          lastLoginAt: at,
          lastSeenAt: at,
        },
        $setOnInsert: { activeSeconds: 0 },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error("[site-analytics] recordStaffLogin failed");
    console.error(err);
  }
}

async function touchStaffPresence(user: SessionUser, ip: string | null, force: boolean) {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  const threshold = new Date(now.getTime() - PRESENCE_THROTTLE_MS);
  const filter: Filter<StaffPresenceDoc> = force
    ? { _id: user.id }
    : {
        _id: user.id,
        $or: [{ lastSeenAt: { $exists: false } }, { lastSeenAt: { $lte: threshold } }],
      };
  await db.collection<StaffPresenceDoc>("staff_presence").updateOne(
    filter,
    {
      $set: {
        username: user.username,
        name: user.name,
        role: user.role,
        lastSeenAt: now,
        lastIp: ip?.slice(0, 64) ?? "",
      },
      $setOnInsert: { activeSeconds: 0, lastLoginAt: now },
    },
    { upsert: true },
  );
}

export async function recordStaffHeartbeat(user: SessionUser, ip?: string | null) {
  if (!mongoUriSet()) return;
  try {
    const db = await getDb();
    if (!db) return;
    await touchStaffPresence(user, ip ?? null, true);
    await db.collection<StaffPresenceDoc>("staff_presence").updateOne(
      { _id: user.id },
      { $inc: { activeSeconds: HEARTBEAT_SECONDS } },
    );
  } catch (err) {
    console.error("[site-analytics] heartbeat failed");
    console.error(err);
  }
}

export type AnalyticsDayRow = {
  date: string;
  publicPv: number;
  staffPv: number;
};

export type AnalyticsDashboard = {
  configured: boolean;
  totals: { publicPv: number; staffPv: number };
  last30Days: AnalyticsDayRow[];
  topPaths: { path: string; views: number }[];
  recentLogins: {
    at: string;
    username: string;
    name: string;
    role: string;
    ip: string;
  }[];
  staffPresence: {
    username: string;
    name: string;
    role: string;
    lastLoginAt: string;
    lastSeenAt: string;
    activeSeconds: number;
  }[];
};

export async function readAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const empty: AnalyticsDashboard = {
    configured: mongoUriSet(),
    totals: { publicPv: 0, staffPv: 0 },
    last30Days: [],
    topPaths: [],
    recentLogins: [],
    staffPresence: [],
  };
  if (!mongoUriSet()) return empty;
  try {
    const db = await getDb();
    if (!db) return empty;

    const daily = await db
      .collection<DailyDoc>("analytics_daily")
      .find({})
      .sort({ _id: -1 })
      .limit(30)
      .toArray();
    daily.reverse();

    const pathAcc = new Map<string, number>();
    const sumRows = await db
      .collection<DailyDoc>("analytics_daily")
      .aggregate<{ publicPv: number; staffPv: number }>([
        { $group: { _id: null, publicPv: { $sum: "$publicPv" }, staffPv: { $sum: "$staffPv" } } },
      ])
      .toArray();
    const publicPv = sumRows[0]?.publicPv ?? 0;
    const staffPv = sumRows[0]?.staffPv ?? 0;
    for (const row of daily.slice(-7)) {
      for (const [path, n] of Object.entries(row.paths ?? {})) {
        pathAcc.set(path, (pathAcc.get(path) ?? 0) + n);
      }
    }
    const topPaths = [...pathAcc.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([path, views]) => ({ path: pathStatKeyToLabel(path), views }));

    const recentLogins = await db
      .collection<{ at: Date; username: string; name: string; role: string; ip?: string }>("staff_audit")
      .find({ action: "login" })
      .sort({ at: -1 })
      .limit(25)
      .toArray();

    const presence = await db
      .collection<StaffPresenceDoc>("staff_presence")
      .find({})
      .sort({ lastSeenAt: -1 })
      .toArray();

    return {
      configured: true,
      totals: { publicPv, staffPv },
      last30Days: daily.map((row) => ({
        date: row._id,
        publicPv: row.publicPv ?? 0,
        staffPv: row.staffPv ?? 0,
      })),
      topPaths,
      recentLogins: recentLogins.map((row) => ({
        at: row.at.toISOString(),
        username: row.username,
        name: row.name,
        role: row.role,
        ip: row.ip ?? "",
      })),
      staffPresence: presence.map((row) => ({
        username: row.username,
        name: row.name,
        role: row.role,
        lastLoginAt: row.lastLoginAt?.toISOString() ?? "",
        lastSeenAt: row.lastSeenAt?.toISOString() ?? "",
        activeSeconds: row.activeSeconds ?? 0,
      })),
    };
  } catch (err) {
    console.error("[site-analytics] read dashboard failed");
    console.error(err);
    return empty;
  }
}

export function formatActiveDuration(seconds: number) {
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}시간 ${rm}분` : `${h}시간`;
}
