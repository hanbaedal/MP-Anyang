import Link from "next/link";
import { manageNavItems } from "@/lib/manage-nav";
import { SUPERVISOR_NAV } from "@/lib/supervisor-nav";
import type { SessionUser } from "@/lib/auth-types";

const LABELS: Record<string, string> = {
  "manage.gallery": "갤러리",
  "manage.funeral": "장례·안치",
  "manage.notices": "공지",
  "manage.inquiries": "문의",
  "manage.faq": "묻고답하기",
  "manage.admins": "관리자 계정",
  "work.dbUpdate": "DB 업데이트",
  "supervisor.stats": "방문 통계",
};

export function ManageNav({ session }: { session: SessionUser }) {
  const links = [
    ...manageNavItems(),
    ...(session.role === "supervisor" ? SUPERVISOR_NAV : []),
  ];
  return (
    <nav className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              link.i18n === "manage.admins" || link.i18n === "work.dbUpdate"
                ? "font-medium text-primary underline-offset-4 hover:underline"
                : link.i18n.startsWith("manage.")
                  ? "text-primary underline-offset-4 hover:underline"
                  : "text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            }
          >
            {LABELS[link.i18n] ?? link.i18n}
          </Link>
        ))}
      </div>
    </nav>
  );
}
