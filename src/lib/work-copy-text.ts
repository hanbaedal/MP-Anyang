import type { Role } from "./auth-types";
import { t, type Locale } from "./i18n";
import type { WorkStorage } from "./work-store";

export function workCopyLead(count: number, extra = "") {
  return `복사본 ${count.toLocaleString("ko-KR")}건${extra}`;
}

export function workCopyEmptyLines(opts: {
  locale: Locale;
  role: Role;
  envReady: boolean;
  storage: WorkStorage;
}): string[] {
  const { locale, role, envReady, storage } = opts;
  const lines: string[] = [];
  if (role === "supervisor") {
    lines.push(t(locale, "work.copyEmptySupervisor"));
    if (!envReady) lines.push(t(locale, "work.copyFillSource"));
  } else {
    lines.push(t(locale, "work.copyEmptyStaff"));
  }
  if (!storage.mongoConfigured && !storage.filePresent) {
    lines.push(t(locale, "work.copyNoStore"));
  } else if (storage.mongoConfigured) {
    lines.push(t(locale, "work.copyMongoEmpty"));
  } else if (!storage.filePresent) {
    lines.push(t(locale, "work.copyNoFile"));
  } else {
    lines.push(t(locale, "work.copyFileEmpty"));
  }
  return lines;
}
