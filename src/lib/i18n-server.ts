import { cookies } from "next/headers";
import { normalizeLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export async function readLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return normalizeLocale(value);
}
