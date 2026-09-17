import Link from "next/link";
import { manageNavItems } from "@/lib/manage-nav";
import type { SessionUser } from "@/lib/auth-types";

const LABELS: Record<string, string> = {
  "manage.home": "관리 홈",
  "manage.gallery": "갤러리",
  "manage.notices": "공지",
  "manage.inquiries": "문의",
  "manage.faq": "묻고답하기",
  "manage.admins": "관리자 계정",
};

export function ManageNav({ session }: { session: SessionUser }) {
  const links = manageNavItems(session.role);
  return (
    <nav className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              link.i18n === "manage.admins"
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
