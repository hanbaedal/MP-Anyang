import { SupervisorContractBook } from "@/components/supervisor-contract-book";
import { requireSupervisor } from "@/lib/auth";
import { buildContractBook, overlayContractInputs, parseContractKey, toContractHit, type ContractListKind } from "@/lib/contract-book";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readContractBundle, searchSupervisorContracts } from "@/lib/work-store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "supervisor.contracts") };
}

function kindOf(value: string | undefined): ContractListKind {
  if (value === "contract" || value === "move") return value;
  return "all";
}

export default async function SupervisorContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ tomb?: string; user?: string; family?: string; phone?: string; kind?: string; page?: string; id?: string }>;
}) {
  await requireSupervisor();
  const locale = await readLocale();
  const params = await searchParams;
  const filters = {
    tomb: params.tomb?.trim() ?? "",
    user: params.user?.trim() ?? "",
    family: params.family?.trim() ?? "",
    phone: params.phone?.trim() ?? "",
    kind: kindOf(params.kind),
  };
  const asked = Number(params.page ?? "1");
  const found = await searchSupervisorContracts({ ...filters, page: Number.isFinite(asked) ? asked : 1 });
  const picked = params.id ? parseContractKey(params.id) : null;
  const bundle = picked ? await readContractBundle(picked.tombNo, picked.contractNo) : null;
  const row = bundle?.contract;
  const book = row
    ? overlayContractInputs(buildContractBook(row, bundle?.fees ?? [], bundle?.receipts ?? [], null), bundle?.file?.inputs)
    : null;
  if (book && bundle?.file?.checks?.length) book.tombTypes = bundle.file.checks;

  return (
    <div className="mx-auto max-w-[90rem] px-3 py-4 pb-16">
      <h1 className="mb-3 font-serif text-xl text-primary">{t(locale, "supervisor.contracts")}</h1>
      <SupervisorContractBook
        filters={filters}
        page={found.page}
        pageSize={found.pageSize}
        total={found.total}
        matched={found.matched}
        hits={found.hits.map(toContractHit)}
        book={book}
      />
    </div>
  );
}
