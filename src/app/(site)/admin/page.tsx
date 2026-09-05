import Link from "next/link";
import { guardAdminPage } from "../../../lib/auth";
import { ADMIN_MENU, MENU } from "../../../lib/menu";

const GROUP_TONE: Record<string, string> = {
  admin: "sitemap-tone-admin",
  about: "sitemap-tone-about",
  lots: "sitemap-tone-lots",
  facilities: "sitemap-tone-facilities",
  services: "sitemap-tone-services",
  support: "sitemap-tone-support",
};

export default async function AdminSiteMapPage() {
  await guardAdminPage("/admin");

  const groups = [
    { id: "admin", label: "관리자", links: ADMIN_MENU },
    ...MENU.map((group) => ({
      id: group.id,
      label: group.label,
      links: group.children,
    })),
  ];

  return (
    <article className="article admin-sitemap-page">
      <p className="kicker">관리자</p>
      <h1>사이트맵</h1>

      <div className="sitemap-board">
        {groups.map((group) => (
          <section
            key={group.id}
            className={`sitemap-group-card ${GROUP_TONE[group.id] || ""}`}
          >
            <h2>{group.label}</h2>
            <ul className="sitemap-group-links">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
