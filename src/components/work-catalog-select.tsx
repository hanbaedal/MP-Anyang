"use client";

import type { Material, Product, StockKind } from "@/lib/work-ledgers";

const selectClass = "h-9 w-full rounded-md border bg-transparent px-2 text-sm text-foreground";

export function CatalogItemSelect({
  products,
  materials,
  includeMaterials,
  priceOf,
  stockKind,
  itemId,
  onChange,
}: {
  products: Product[];
  materials: Material[];
  includeMaterials: boolean;
  priceOf: "in" | "out";
  stockKind: StockKind;
  itemId: string;
  onChange: (next: { stockKind: StockKind; itemId: string; item: string; spec: string; unitPrice: number }) => void;
}) {
  const value = itemId ? `${stockKind}:${itemId}` : "";
  return (
    <select
      className={selectClass}
      value={value}
      onChange={(event) => {
        const [kind, id] = event.target.value.split(":");
        if (kind === "부자재") {
          const row = materials.find((item) => item.id === id);
          if (!row) return;
          onChange({ stockKind: "부자재", itemId: row.id, item: row.name, spec: row.spec, unitPrice: row.inPrice });
          return;
        }
        const row = products.find((item) => item.id === id);
        if (!row) return;
        onChange({
          stockKind: "상품",
          itemId: row.id,
          item: row.name,
          spec: row.spec,
          unitPrice: priceOf === "out" ? row.outPrice : row.inPrice,
        });
      }}
    >
      <option value="">선택</option>
      <optgroup label="상품">
        {products.map((row) => (
          <option key={row.id} value={`상품:${row.id}`}>
            {row.spec ? `${row.name} / ${row.spec}` : row.name}
          </option>
        ))}
      </optgroup>
      {includeMaterials ? (
        <optgroup label="부자재">
          {materials.map((row) => (
            <option key={row.id} value={`부자재:${row.id}`}>
              {row.spec ? `${row.name} / ${row.spec}` : row.name}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );
}
