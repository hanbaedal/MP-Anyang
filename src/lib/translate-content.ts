import type { Locale } from "./i18n";

export type ContentLocale = "en" | "zh";

export const CONTENT_LOCALES: ContentLocale[] = ["en", "zh"];

const pair: Record<ContentLocale, string> = {
  en: "ko|en",
  zh: "ko|zh-CN",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunksOf(text: string, size: number) {
  if (text.length <= size) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length) {
    if (rest.length <= size) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n", size);
    if (cut < size * 0.4) cut = rest.lastIndexOf(" ", size);
    if (cut < size * 0.4) cut = size;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\s+/, "");
  }
  return parts;
}

async function translateChunk(text: string, to: ContentLocale): Promise<string> {
  const q = text.trim();
  if (!q) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q.slice(0, 450))}&langpair=${pair[to]}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return text;
  const data = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
  const out = data.responseData?.translatedText?.trim();
  if (!out || data.responseStatus !== 200) return text;
  if (/MYMEMORY WARNING/i.test(out)) return text;
  return out;
}

/** 한글(또는 혼합) 문장을 영어·중국어로 옮깁니다. 실패 시 원문을 돌려줍니다. */
export async function translateText(text: string, to: ContentLocale): Promise<string> {
  const raw = text ?? "";
  if (!raw.trim()) return raw;
  const parts = chunksOf(raw, 420);
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    out.push(await translateChunk(parts[i], to));
    if (i < parts.length - 1) await sleep(250);
  }
  return out.join(raw.includes("\n") ? "\n" : " ");
}

export async function translateFields<T extends Record<string, string>>(
  fields: T,
  to: ContentLocale,
): Promise<T> {
  const next = { ...fields };
  for (const key of Object.keys(fields) as (keyof T)[]) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) {
      next[key] = (await translateText(value, to)) as T[keyof T];
      await sleep(150);
    }
  }
  return next;
}

export function pickContentLocale(locale: Locale): "ko" | ContentLocale {
  if (locale === "en" || locale === "zh") return locale;
  return "ko";
}
