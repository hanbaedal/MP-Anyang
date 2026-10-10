import { redirect } from "next/navigation";
import { requireStatusStaff } from "@/lib/auth";
import { EXEC_HOME } from "@/lib/exec-nav";

export const dynamic = "force-dynamic";

export default async function WorkOverviewRedirectPage() {
  await requireStatusStaff();
  redirect(EXEC_HOME);
}
