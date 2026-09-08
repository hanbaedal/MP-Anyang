import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
  return parseLocale(raw);
}
