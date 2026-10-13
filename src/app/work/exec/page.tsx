import { redirect } from "next/navigation";
import { EXEC_HOME } from "@/lib/exec-nav";

export const dynamic = "force-dynamic";

export default function ExecIndexPage() {
  redirect(EXEC_HOME);
}
