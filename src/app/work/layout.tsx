import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WorkLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return children;
}
