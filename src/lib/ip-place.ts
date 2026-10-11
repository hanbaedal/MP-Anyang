type IpApiRow = {
  status?: string;
  query?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
};

type IpWho = {
  success?: boolean;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  connection?: { isp?: string; org?: string };
};

const cache = new Map<string, { label: string; at: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;
const AGREE_KM = 80;

const REGION_KO: Record<string, string> = {
  seoul: "서울",
  busan: "부산",
  incheon: "인천",
  daegu: "대구",
  daejeon: "대전",
  gwangju: "광주",
  ulsan: "울산",
  sejong: "세종",
  "gyeonggi-do": "경기도",
  gyeonggi: "경기도",
  "gangwon-do": "강원",
  gangwon: "강원",
  "chungcheongbuk-do": "충북",
  "north chungcheong": "충북",
  "chungcheongnam-do": "충남",
  "south chungcheong": "충남",
  "jeollabuk-do": "전북",
  "north jeolla": "전북",
  "jeollanam-do": "전남",
  "south jeolla": "전남",
  "gyeongsangbuk-do": "경북",
  "north gyeongsang": "경북",
  "gyeongsangnam-do": "경남",
  "south gyeongsang": "경남",
  "jeju-do": "제주",
  jeju: "제주",
};

export function isPrivateIp(ip: string) {
  const v = ip.trim().toLowerCase().replace(/^::ffff:/, "");
  if (!v || v === "::1" || v === "localhost") return true;
  if (v.startsWith("127.") || v.startsWith("10.") || v.startsWith("192.168.") || v.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:")) return true;
  return false;
}

/** Cloudflare verifies the client on Render. X-Forwarded-For's first public address is the fallback. */
export function clientIp(headers: { get(name: string): string | null }): string {
  const verified = headers.get("cf-connecting-ip")?.trim() || headers.get("true-client-ip")?.trim();
  if (verified && !isPrivateIp(verified)) return verified.slice(0, 64);
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    const pub = parts.find((part) => !isPrivateIp(part));
    if (pub) return pub.slice(0, 64);
    if (parts[0]) return parts[0].slice(0, 64);
  }
  return headers.get("x-real-ip")?.trim().slice(0, 64) ?? "";
}

function countryName(code?: string) {
  const c = code?.trim();
  if (!c) return "";
  try {
    return new Intl.DisplayNames(["ko"], { type: "region" }).of(c) ?? "";
  } catch {
    return "";
  }
}

function regionKo(name?: string) {
  const key = name?.trim().toLowerCase() ?? "";
  if (!key) return "";
  return REGION_KO[key] ?? "";
}

function ispLabel(raw?: string) {
  const s = (raw ?? "").toLowerCase();
  if (!s) return "";
  if (s.includes("powercomm") || s.includes("lg uplus") || s.includes("lg u+") || s.includes("lgdacom") || s.includes("xpeed")) {
    return "LG U+";
  }
  if (s.includes("korea telecom") || s.includes("olleh") || /\bkt\b/.test(s)) return "KT";
  if (s.includes("sk broadband") || s.includes("sktelecom") || s.includes("sk telecom")) return "SK브로드밴드";
  if (s.includes("cloudflare")) return "Cloudflare";
  const plain = raw?.trim() ?? "";
  return plain.length > 32 ? `${plain.slice(0, 32)}…` : plain;
}

function kmBetween(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

function placeLabel(api: IpApiRow | undefined, who: IpWho | undefined) {
  const country = countryName(api?.countryCode || who?.country_code);
  const isp = ispLabel(api?.isp || api?.org || who?.connection?.isp || who?.connection?.org);
  let city = "";
  const aLat = api?.lat;
  const aLon = api?.lon;
  const bLat = who?.latitude;
  const bLon = who?.longitude;
  if (api?.status === "success" && who?.success && aLat != null && aLon != null && bLat != null && bLon != null) {
    if (kmBetween(aLat, aLon, bLat, bLon) <= AGREE_KM) {
      city = regionKo(api.regionName) || regionKo(who.region) || api.regionName?.trim() || who.region?.trim() || "";
    }
  }
  const head = [country, city].filter(Boolean).join(" ");
  if (head && isp) return `${head} · ${isp}`;
  return head || isp || "확인 불가";
}

async function lookupWho(ip: string): Promise<IpWho | null> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as IpWho;
  } catch {
    return null;
  }
}

/** Country and carrier for staff login IPs. A city is shown only when two lookups agree. */
export async function lookupIpPlaces(ips: string[]) {
  const out = new Map<string, string>();
  const need: string[] = [];
  const now = Date.now();
  for (const raw of ips) {
    const ip = raw.trim();
    if (!ip || out.has(ip)) continue;
    if (isPrivateIp(ip)) {
      out.set(ip, "내부망");
      continue;
    }
    const hit = cache.get(ip);
    if (hit && now - hit.at < TTL_MS) {
      out.set(ip, hit.label);
      continue;
    }
    need.push(ip);
  }
  if (need.length === 0) return out;
  const batch = need.slice(0, 100);
  const apiByIp = new Map<string, IpApiRow>();
  try {
    const res = await fetch(
      "http://ip-api.com/batch?fields=status,query,countryCode,regionName,city,lat,lon,isp,org",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (res.ok) {
      const rows = (await res.json()) as IpApiRow[];
      for (const row of rows) {
        const ip = row.query?.trim();
        if (ip) apiByIp.set(ip, row);
      }
    }
  } catch (err) {
    console.error("[ip-place] ip-api lookup failed");
    console.error(err);
  }
  const whoRows = await Promise.all(batch.map(async (ip) => [ip, await lookupWho(ip)] as const));
  for (const [ip, who] of whoRows) {
    const label = placeLabel(apiByIp.get(ip), who ?? undefined);
    cache.set(ip, { label, at: now });
    out.set(ip, label);
  }
  return out;
}
