import Link from "next/link";
import { CMS_SLUGS } from "@/lib/cms-types";
import type { SessionUser } from "@/lib/auth-types";

const LINKS = [
  { href: "/manage", label: "관리 홈" },
  { href: "/manage/gallery", label: "갤러리" },
  { href: "/manage/notices", label: "공지" },
  { href: "/manage/inquiries", label: "문의" },
  { href: "/manage/faq", label: "묻고답하기" },
];

export function ManageNav({ session }: { session: SessionUser }) {
  return (
    <nav className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-primary underline-offset-4 hover:underline">
            {link.label}
          </Link>
        ))}
        {CMS_SLUGS.map((item) => (
          <Link
            key={item.slug}
            href={`/manage/pages/${item.slug}`}
            className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {item.label}
          </Link>
        ))}
        {session.role === "supervisor" ? (
          <Link href="/manage/admins" className="font-medium text-primary underline-offset-4 hover:underline">
            관리자 계정
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
