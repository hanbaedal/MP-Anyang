type IpApiRow = {
  status?: string;
  query?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
};

const cache = new Map<string, { label: string; at: number }>();
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isPrivateIp(ip: string) {
  const v = ip.trim().toLowerCase();
  if (!v || v === "::1" || v === "localhost") return true;
  if (v.startsWith("127.") || v.startsWith("10.") || v.startsWith("192.168.") || v.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:")) return true;
  return false;
}

function countryName(row: IpApiRow) {
  const code = row.countryCode?.trim();
  if (code) {
    try {
      const ko = new Intl.DisplayNames(["ko"], { type: "region" }).of(code);
      if (ko) return ko;
    } catch {
      /* use the API country string */
    }
  }
  return row.country?.trim() ?? "";
}

function placeLabel(row: IpApiRow) {
  const parts = [countryName(row), row.regionName, row.city].map((part) => part?.trim() ?? "").filter(Boolean);
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.includes(part)) unique.push(part);
  }
  return unique.join(" ") || "확인 불가";
}

/** Approximate city/region for public IPs already stored on staff logins. Failures stay blank. */
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
  try {
    const res = await fetch("http://ip-api.com/batch?fields=status,query,country,countryCode,regionName,city", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(need.slice(0, 100)),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return out;
    const rows = (await res.json()) as IpApiRow[];
    for (const row of rows) {
      const ip = row.query?.trim();
      if (!ip) continue;
      const label = row.status === "success" ? placeLabel(row) : "확인 불가";
      cache.set(ip, { label, at: now });
      out.set(ip, label);
    }
  } catch (err) {
    console.error("[ip-place] lookup failed");
    console.error(err);
  }
  return out;
}
