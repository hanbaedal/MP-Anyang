import { MESSAGES, type Locale } from "./i18n";

export type ContentLocale = "en" | "zh";

export const CONTENT_LOCALES: ContentLocale[] = ["en", "zh"];

const pair: Record<ContentLocale, string> = {
  en: "ko|en",
  zh: "ko|zh-CN",
};

let koIndex: Map<string, string> | null = null;

function getKoIndex() {
  if (!koIndex) {
    koIndex = new Map();
    for (const [key, value] of Object.entries(MESSAGES.ko)) {
      const trimmed = value.trim();
      if (trimmed && !koIndex.has(trimmed)) koIndex.set(trimmed, key);
    }
  }
  return koIndex;
}

/** 한글 UI 문구와 같으면 미리 번역된 메시지를 씁니다. */
export function lookupTranslated(text: string, to: Locale | ContentLocale): string | null {
  if (to === "ko") return text;
  const key = getKoIndex().get(text.trim());
  if (!key) return null;
  const out = MESSAGES[to as Locale][key];
  return out?.trim() ? out : null;
}

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
  const fromMsg = lookupTranslated(q, to);
  if (fromMsg !== null) return fromMsg;
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

  const exact = lookupTranslated(raw, to);
  if (exact !== null) return exact;

  if (raw.includes("\n\n")) {
    const parts = raw.split("\n\n");
    const out: string[] = [];
    for (const part of parts) out.push(await translateText(part, to));
    return out.join("\n\n");
  }

  const chunks = chunksOf(raw, 420);
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    out.push(await translateChunk(chunks[i], to));
    if (i < chunks.length - 1) await sleep(200);
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
      await sleep(100);
    }
  }
  return next;
}

export function pickContentLocale(locale: Locale): "ko" | ContentLocale {
  if (locale === "en" || locale === "zh") return locale;
  return "ko";
}

/** 손님 화면용: 저장된 번역이 없으면 사전·API로 바로 맞춥니다. */
export function localizeStoredText(text: string, locale: Locale): string {
  if (locale === "ko" || !text.trim()) return text;
  return lookupTranslated(text, locale) ?? text;
}

/** 한글이 남아 있으면 번역이 덜 된 것으로 봅니다. */
export function stillHasHangul(text: string | undefined | null) {
  return Boolean(text && /[\uAC00-\uD7A3]/.test(text));
}
