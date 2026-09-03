import { readSession } from "../../lib/auth";
import { SiteShell } from "../../components/SiteShell";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await readSession();
  return <SiteShell userName={user?.name} userRole={user?.role}>{children}</SiteShell>;
}
