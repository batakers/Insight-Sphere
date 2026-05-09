"use client";

import { useState, useMemo } from "react";
import { Wrench, Plus, Search } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { R } from "@/app/lib/radii";
import { formatRupiah } from "@/app/lib/format";
import { Product } from "@/app/types/pos";
import { useTranslation } from "@/app/i18n";
import { INPUT } from "@/app/lib/forms";

interface ServicePanelProps {
  onAdd: (service: Product) => void;
}

const SERVICE_CATEGORY_KEYS = ["ALL", "FOTOKOPI", "PRINT", "JILID", "LAMINASI", "SCAN"] as const;

const MOCK_SERVICES: Product[] = [
  { id: "svc-001", sku: "FC-A4-HB", name: "Fotokopi A4 Hitam Putih", category: "FOTOKOPI", family: "LAYANAN", unit: "lembar", base_price: 200, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-002", sku: "FC-A4-WR", name: "Fotokopi A4 Warna", category: "FOTOKOPI", family: "LAYANAN", unit: "lembar", base_price: 500, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-003", sku: "FC-A3-HB", name: "Fotokopi A3 Hitam Putih", category: "FOTOKOPI", family: "LAYANAN", unit: "lembar", base_price: 500, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-004", sku: "FC-A3-WR", name: "Fotokopi A3 Warna", category: "FOTOKOPI", family: "LAYANAN", unit: "lembar", base_price: 1000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-005", sku: "PR-A4-HB", name: "Print A4 Hitam Putih", category: "PRINT", family: "LAYANAN", unit: "lembar", base_price: 500, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-006", sku: "PR-A4-WR", name: "Print A4 Warna", category: "PRINT", family: "LAYANAN", unit: "lembar", base_price: 1500, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-007", sku: "PR-A3-HB", name: "Print A3 Hitam Putih", category: "PRINT", family: "LAYANAN", unit: "lembar", base_price: 1000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-008", sku: "PR-A3-WR", name: "Print A3 Warna", category: "PRINT", family: "LAYANAN", unit: "lembar", base_price: 3000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-009", sku: "JL-SPRL", name: "Jilid Spiral", category: "JILID", family: "LAYANAN", unit: "dokumen", base_price: 5000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-010", sku: "JL-LKBN", name: "Jilid Lakban (Softcover)", category: "JILID", family: "LAYANAN", unit: "dokumen", base_price: 3000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-011", sku: "JL-HARD", name: "Jilid Hard Cover", category: "JILID", family: "LAYANAN", unit: "dokumen", base_price: 25000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-012", sku: "LM-A4", name: "Laminasi A4", category: "LAMINASI", family: "LAYANAN", unit: "lembar", base_price: 3000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-013", sku: "LM-A3", name: "Laminasi A3", category: "LAMINASI", family: "LAYANAN", unit: "lembar", base_price: 5000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-014", sku: "SC-A4", name: "Scan A4", category: "SCAN", family: "LAYANAN", unit: "lembar", base_price: 1000, current_stock: 9999, version: 1, is_service: true },
  { id: "svc-015", sku: "SC-EMAIL", name: "Scan + Kirim Email", category: "SCAN", family: "LAYANAN", unit: "dokumen", base_price: 3000, current_stock: 9999, version: 1, is_service: true },
];

export function ServicePanel({ onAdd }: ServicePanelProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_SERVICES.filter(s => {
      const matchCat = activeCategory === "ALL" || s.category === activeCategory;
      const matchSearch = s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("pos.service.search")}
            className={cn(INPUT.base, INPUT.size.sm, R.md, "pl-9 pr-3", T.bodySm, "font-bold")}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {SERVICE_CATEGORY_KEYS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                cn(T.buttonSm, R.sm, "px-3 py-1.5 whitespace-nowrap transition-all cursor-pointer"),
                activeCategory === cat ? "bg-indigo-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {cat === "ALL" ? t("pos.service.all") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filtered.map(svc => (
            <button
              key={svc.id}
              type="button"
              onClick={() => onAdd(svc)}
              className={cn(R.lg, "group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-1 cursor-pointer flex flex-col text-left")}
            >
              <div className={cn(R.md, "relative aspect-square bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden mb-3 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors")}>
                <Wrench className="size-8 text-indigo-300 group-hover:text-indigo-400 transition-colors" />
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className={cn(R.full, "bg-indigo-600 text-white size-10 flex items-center justify-center shadow-xl scale-50 group-hover:scale-100 transition-transform duration-300")}>
                    <Plus className="size-5 stroke-[3]" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-0.5">
                <p className={cn(T.caption, "text-indigo-400")}>{svc.category}</p>
                <h3 className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors")}>
                  {svc.name}
                </h3>
                <p className={cn(T.code, "text-slate-400")}>{svc.sku}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="text-indigo-600">
                  <span className={cn(T.dataEmphasis)}>{formatRupiah(svc.base_price)}</span>
                </div>
                <span className={cn(T.caption, R.xs, "text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5")}>/{svc.unit}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
