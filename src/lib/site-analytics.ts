import type { Filter } from "mongodb";
import type { SessionUser } from "./auth-types";
import { isValidVisitorId, newVisitorId } from "./analytics-cookie";
import { getDb, mongoUriSet } from "./mongo";

export { ANON_VISITOR_COOKIE, anonVisitorCookieOptions, isValidVisitorId, newVisitorId } from "./analytics-cookie";

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|HeadlessChrome|Bytespider/i;
const SKIP_PREFIXES = ["/api/", "/_next/", "/icon", "/robots", "/sitemap.xml"];
const PRESENCE_THROTTLE_MS = 120_000;
const HEARTBEAT_SECONDS = 60;

function kstDateKey(d = new Date()) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

function kstDateKeyDaysAgo(days: number) {
  return kstDateKey(new Date(Date.now() - days * 86_400_000));
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
  publicUv?: number;
  staffPv: number;
  paths: Record<string, number>;
  updatedAt: Date;
};

type PublicUvMarker = { _id: string; date: string; visitorId: string; at: Date };

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

async function recordPublicVisitorForDay(date: string, visitorId: string) {
  const db = await getDb();
  if (!db) return;
  const markerId = `${date}:${visitorId}`;
  const inserted = await db.collection<PublicUvMarker>("analytics_public_uv").updateOne(
    { _id: markerId },
    { $setOnInsert: { date, visitorId, at: new Date() } },
    { upsert: true },
  );
  if (inserted.upsertedCount !== 1) return;
  await db.collection<DailyDoc>("analytics_daily").updateOne(
    { _id: date },
    {
      $inc: { publicUv: 1 },
      $setOnInsert: { publicPv: 0, publicUv: 0, staffPv: 0, paths: {} },
    },
    { upsert: true },
  );
}

async function countDistinctPublicVisitors(sinceDateInclusive: string) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .collection<PublicUvMarker>("analytics_public_uv")
    .aggregate<{ n: number }>([
      { $match: { date: { $gte: sinceDateInclusive } } },
      { $group: { _id: "$visitorId" } },
      { $count: "n" },
    ])
    .toArray();
  return rows[0]?.n ?? 0;
}

export async function trackPageView(input: {
  pathname: string;
  session: SessionUser | null;
  visitorId?: string | null;
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
        $setOnInsert: { publicPv: 0, publicUv: 0, staffPv: 0, paths: {} },
      },
      { upsert: true },
    );
    if (!isStaff && isValidVisitorId(input.visitorId)) {
      await recordPublicVisitorForDay(date, input.visitorId!);
    }
    /* 비로그인: PV·UV만. 경로별 집계는 직원 세션만 */
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
  publicUv: number;
  publicPv: number;
  staffPv: number;
};

export type AnalyticsDashboard = {
  configured: boolean;
  totals: {
    publicPv: number;
    staffPv: number;
    publicUvToday: number;
    publicPvToday: number;
    publicUv7d: number;
    publicUv30d: number;
    publicUvAll: number;
  };
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
    totals: {
      publicPv: 0,
      staffPv: 0,
      publicUvToday: 0,
      publicPvToday: 0,
      publicUv7d: 0,
      publicUv30d: 0,
      publicUvAll: 0,
    },
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
    const today = kstDateKey();
    const todayRow = await db.collection<DailyDoc>("analytics_daily").findOne({ _id: today });
    const publicUvToday = todayRow?.publicUv ?? 0;
    const publicPvToday = todayRow?.publicPv ?? 0;
    const publicUv7d = await countDistinctPublicVisitors(kstDateKeyDaysAgo(6));
    const publicUv30d = await countDistinctPublicVisitors(kstDateKeyDaysAgo(29));
    const publicUvAll = await countDistinctPublicVisitors("1970-01-01");
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
      totals: {
        publicPv,
        staffPv,
        publicUvToday,
        publicPvToday,
        publicUv7d,
        publicUv30d,
        publicUvAll,
      },
      last30Days: daily.map((row) => ({
        date: row._id,
        publicUv: row.publicUv ?? 0,
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
