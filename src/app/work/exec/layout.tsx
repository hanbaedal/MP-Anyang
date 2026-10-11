import { requireStatusStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ExecLayout({ children }: { children: React.ReactNode }) {
  await requireStatusStaff();
  return children;
}
