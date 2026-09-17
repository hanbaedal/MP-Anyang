import { requireCmsStaff } from "@/lib/auth";
import { ensureAuthSeed } from "@/lib/staff";
import { ManageNav } from "@/components/manage-nav";

export const dynamic = "force-dynamic";

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  await ensureAuthSeed();
  const session = await requireCmsStaff();
  return (
    <div className="min-h-full bg-muted/40">
      <ManageNav session={session} />
      {children}
    </div>
  );
}
