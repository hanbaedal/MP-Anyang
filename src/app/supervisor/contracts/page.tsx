import { SupervisorContractBook } from "@/components/supervisor-contract-book";
import { requireSupervisor } from "@/lib/auth";
import { loadContractSheet } from "@/lib/cemetery-source";
import { overlayContractInputs, buildContractBook, contractKey, toContractHit } from "@/lib/contract-book";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readContractFile, readWorkDump } from "@/lib/work-store";
import type { ParsedSheet } from "@/lib/cemetery-parse";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "supervisor.contracts") };
}

function matches(row: { tombNo: string; contractNo: string; userName: string; familyName: string; address: string }, query: string) {
  const hay = [row.tombNo, row.contractNo, row.userName, row.familyName, row.address].join(" ").toLowerCase();
  return hay.includes(query.toLowerCase());
}

export default async function SupervisorContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  await requireSupervisor();
  const locale = await readLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const dump = await readWorkDump();
  const found = query ? dump.contracts.filter((row) => matches(row, query)) : [];
  const hits = found.slice(0, 40).map(toContractHit);
  const picked =
    dump.contracts.find((row) => contractKey(row) === (params.id ?? "")) ??
    (query ? found[0] : undefined);
  const stored = picked ? await readContractFile(picked.tombNo, picked.contractNo) : null;
  const storedSheet: ParsedSheet | null =
    stored && (stored.pairs.length > 0 || stored.tables.length > 0)
      ? { labels: stored.fields, pairs: stored.pairs, checks: stored.checks, tables: stored.tables, paths: [] }
      : null;
  const sheet = storedSheet ?? (picked ? await loadContractSheet(picked.tombNo, picked.contractNo) : null);
  const book = picked ? overlayContractInputs(buildContractBook(picked, dump.fees, dump.receipts, sheet), stored?.inputs) : null;
  if (book && stored?.checks?.length) book.tombTypes = stored.checks;

  return (
    <div className="mx-auto max-w-[90rem] px-3 py-4 pb-16">
      <h1 className="mb-3 font-serif text-xl text-primary">{t(locale, "supervisor.contracts")}</h1>
      <SupervisorContractBook query={query} total={dump.contracts.length} shown={found.length} hits={hits} book={book} />
    </div>
  );
}
