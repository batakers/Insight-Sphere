"use client";

import { useState, useRef } from "react";
import {
  X, Upload, Download, CheckCircle2, AlertTriangle, AlertCircle,
  FileSpreadsheet, ArrowRight, Package, RefreshCw, Check, XCircle,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { TABLE } from "@/app/lib/data";
import { C } from "@/app/lib/colors";
import { R } from "@/app/lib/radii";
import { E, Z } from "@/app/lib/elevation";
import { formatRupiah } from "@/app/lib/format";
import { ResponsiveTable } from "@/app/components/ui/ResponsiveTable";
import { toast } from "sonner";
import { useTranslation } from "@/app/i18n";

export interface ImportProductRow {
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  price: number;
  minStock: number;
  supplier?: string;
}

interface PreviewRow extends ImportProductRow {
  errors: string[];
}

const MOCK_PREVIEW: PreviewRow[] = [
  { sku: "KRT-001", name: "Kertas HVS A4 70gr",    category: "Kertas",   unit: "Rim",   stock: 50, price:  55000, minStock: 10, supplier: "CV Aneka",  errors: [] },
  { sku: "KRT-002", name: "Kertas HVS F4 80gr",    category: "Kertas",   unit: "Rim",   stock: 30, price:  62000, minStock:  8,                         errors: [] },
  { sku: "TNR-001", name: "Toner HP LaserJet 85A", category: "Tinta",    unit: "Botol", stock:  3, price: 280000, minStock:  2, supplier: "HP Store",   errors: [] },
  { sku: "LMN-001", name: "Plastik Laminasi A4",   category: "Laminasi", unit: "Pack",  stock: 10, price:  45000, minStock:  3,                         errors: [] },
  { sku: "SPR-001", name: "Spiral Binding 8mm",    category: "Jilid",    unit: "Box",   stock:  8, price:  35000, minStock:  2,                         errors: [] },
  { sku: "MAP-001", name: "Map Plastik Bening A4", category: "Lainnya",  unit: "Pack",  stock: 20, price:  18000, minStock:  5,                         errors: [] },
  { sku: "",        name: "Kertas A3 80gr",         category: "Kertas",   unit: "Rim",   stock: 15, price:      0, minStock:  5,                         errors: ["SKU kosong", "Harga tidak valid"] },
];

const COLUMNS = [
  { name: "SKU",         req: true  },
  { name: "Nama Produk", req: true  },
  { name: "Kategori",    req: false },
  { name: "Satuan",      req: false },
  { name: "Stok",        req: true  },
  { name: "Harga Jual",  req: true  },
  { name: "Min Stok",    req: false },
  { name: "Supplier",    req: false },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportProductRow[]) => void;
}

export function ExcelImportModal({ isOpen, onClose, onImport }: Props) {
  const { t } = useTranslation();
  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [isDragging, setDrag]   = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const valid  = MOCK_PREVIEW.filter(r => r.errors.length === 0);
  const errors = MOCK_PREVIEW.filter(r => r.errors.length >  0);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setParsing(true);
    setTimeout(() => { setParsing(false); setStep(2); }, 900);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = () => {
    setStep(3);
    setTimeout(() => {
      onImport(valid);
      toast.success(
        `${valid.length} produk berhasil diimport` +
        (errors.length ? `, ${errors.length} baris dilewati` : "")
      );
      handleReset();
    }, 1600);
  };

  const handleReset = () => {
    setStep(1); setFileName(null); setParsing(false); onClose();
  };

  return (
    <div className={cn(Z.modal, "fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200")}>
      <div className={cn(R.lg, E["2xl"], "bg-white dark:bg-slate-900 w-full max-w-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]")}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(R.md, "size-9 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center")}>
              <FileSpreadsheet className={cn("size-5", C.success.icon)} />
            </div>
            <div>
              <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>
                Import Produk dari Excel
              </h3>
              <p className={cn(T.caption, "text-slate-400")}>
                Langkah {step} — {step === 1 ? "Upload File" : step === 2 ? "Preview & Validasi" : "Mengimport..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className={cn(R.sm, "p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-4 pb-1 shrink-0">
          <div className="flex items-center gap-1.5">
            {([1, 2, 3] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  cn(T.dataSm, R.full, "size-6 flex items-center justify-center font-semibold transition-all duration-300"),
                  step > s  ? "bg-emerald-500 text-white"
                  : step === s ? "bg-slate-900 dark:bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}>
                  {step > s ? <Check className="size-3.5" aria-label="Selesai" /> : s}
                </div>
                {i < 2 && (
                  <div className={cn(
                    "w-10 h-0.5 rounded transition-all duration-500",
                    step > s ? "bg-emerald-400" : "bg-slate-100 dark:bg-slate-800"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto min-h-0">

          {/* ─── Step 1: Upload ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => !parsing && fileRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 text-center transition-all select-none",
                  parsing  ? "cursor-wait opacity-70"
                  : isDragging ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 cursor-copy"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                )}
              >
                <input
                  ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {parsing
                  ? <RefreshCw className="size-9 text-indigo-400 mx-auto mb-3 animate-spin" />
                  : <Upload className="size-9 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                }
                <p className={cn(T.body, "font-bold text-slate-600 dark:text-slate-400")}>
                  {parsing ? "Membaca file..." : "Drag & drop file, atau klik untuk pilih"}
                </p>
                <p className={cn(T.caption, "text-slate-400 mt-1.5")}>
                  Mendukung · .xlsx · .xls · .csv
                </p>
              </div>

              {/* Template download */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <Download className={cn("size-4 shrink-0", C.warning.icon)} />
                <div className="flex-1 min-w-0">
                  <p className={cn(T.bodySm, "font-bold", C.warning.text)}>Download Template Excel</p>
                  <p className={cn(T.caption, "text-amber-500/80 mt-0.5")}>
                    Gunakan template resmi agar kolom terbaca otomatis
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toast.success(t("inv.excel.toast.template")); }}
                  className={cn(T.buttonSm, R.sm, "px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white cursor-pointer transition-all shrink-0")}
                >
                  Unduh
                </button>
              </div>

              {/* Column legend */}
              <div className="space-y-2">
                <p className={cn(T.label, "text-slate-400")}>Kolom yang dikenali:</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLUMNS.map(c => (
                    <span key={c.name} className={cn(
                      T.micro, R.xs, "px-2 py-0.5 border",
                      c.req
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent"
                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    )}>
                      {c.name}{c.req ? " *" : ""}
                    </span>
                  ))}
                </div>
                <p className={cn(T.caption, "text-slate-400")}>
                  * wajib diisi · kolom lain opsional (boleh kosong)
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 2: Preview ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className={cn("size-4 shrink-0", C.success.icon)} />
                  <span className={cn(T.bodySm, "font-bold text-slate-700 dark:text-slate-300 truncate")}>{fileName}</span>
                  <span className={cn(T.caption, "font-bold text-slate-400 shrink-0")}>{MOCK_PREVIEW.length} baris</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(T.micro, R.xs, "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 border border-emerald-100 dark:border-emerald-900/40 inline-flex items-center gap-1")}>
                    <CheckCircle2 className="size-3" aria-hidden="true" /> {valid.length} valid
                  </span>
                  {errors.length > 0 && (
                    <span className={cn(T.micro, R.xs, "text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 border border-rose-100 dark:border-rose-900/40 inline-flex items-center gap-1")}>
                      <AlertCircle className="size-3" aria-hidden="true" /> {errors.length} error
                    </span>
                  )}
                </div>
              </div>

              <ResponsiveTable
                label="Preview import produk"
                scrollerClassName="rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                minWidthClassName="min-w-[920px]"
              >
                <table className={TABLE.base} aria-label="Preview import produk">
                  <thead className={TABLE.head}>
                    <tr>
                      {["#","SKU","Nama Produk","Kategori","Stok","Harga","Supplier","Status"].map((h, index) => (
                        <th key={h} className={cn(TABLE.headCell, "px-3 py-2.5", index === 0 && "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={TABLE.body}>
                    {MOCK_PREVIEW.map((row, i) => {
                      const hasErrors = row.errors.length > 0;
                      return (
                        <tr
                          key={`${row.sku || "row"}-${i}`}
                          className={cn(TABLE.row, TABLE.rowHover, "group", hasErrors && "bg-rose-50/40 dark:bg-rose-950/10")}
                        >
                          <td className={cn(
                            TABLE.cell,
                            T.caption,
                            "sticky left-0 z-10 px-3 py-2.5 font-bold text-slate-400",
                            hasErrors
                              ? "bg-rose-50 dark:bg-rose-950/30 group-hover:bg-rose-50"
                              : "bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50"
                          )}>{i + 1}</td>
                          <td className={cn(
                            TABLE.cell,
                            T.code, "px-3 py-2.5 whitespace-nowrap",
                            !row.sku ? "text-rose-500" : "text-slate-600 dark:text-slate-400"
                          )}>
                            {row.sku || "—"}
                          </td>
                          <td className={cn(TABLE.cell, "px-3 py-2.5 whitespace-nowrap", T.bodySm, "font-bold text-slate-900 dark:text-slate-200")}>
                            {row.name}
                          </td>
                          <td className={cn(TABLE.cell, T.label, "px-3 py-2.5 text-slate-500 dark:text-slate-400")}>{row.category}</td>
                          <td className={cn(TABLE.cellNumeric, T.dataSm, "px-3 py-2.5 text-slate-700 dark:text-slate-300")}>{row.stock}</td>
                          <td className={cn(
                            TABLE.cellNumeric,
                            T.dataSm,
                            "px-3 py-2.5 whitespace-nowrap",
                            !row.price ? "text-rose-500" : "text-slate-700 dark:text-slate-300"
                          )}>
                            {row.price ? formatRupiah(row.price) : "—"}
                          </td>
                          <td className={cn(TABLE.cell, T.caption, "px-3 py-2.5 text-slate-400")}>{row.supplier || "—"}</td>
                          <td className={cn(TABLE.cell, "px-3 py-2.5")}>
                            {row.errors.length === 0 ? (
                              <span className={cn(T.micro, R.xs, "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 inline-flex items-center gap-1")}>
                                <CheckCircle2 className="size-3" aria-hidden="true" /> Valid
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                {row.errors.map((err, j) => (
                                  <span key={j} className={cn(T.micro, R.xs, "flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 whitespace-nowrap")}>
                                    <XCircle className="size-3 shrink-0" aria-hidden="true" /> {err}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ResponsiveTable>

              {errors.length > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
                  <AlertTriangle className={cn("size-4 shrink-0 mt-px", C.warning.icon)} />
                  <p className={cn(T.bodySm, "font-bold", C.warning.text)}>
                    {errors.length} baris akan dilewati karena ada error. Lanjutkan import dengan <span className="text-slate-900 dark:text-slate-200">{valid.length} produk valid</span>, atau perbaiki file dan upload ulang.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3: Importing ─── */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-14 gap-5">
              <div className={cn(R.lg, "size-16 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center")}>
                <Package className={cn("size-8 animate-pulse", C.primary.icon)} />
              </div>
              <div className="text-center">
                <p className={cn(T.bodyEmphasis, "text-slate-900 dark:text-slate-100")}>
                  Mengimport {valid.length} produk...
                </p>
                <p className={cn(T.bodySm, "text-slate-400 mt-1")}>Menyimpan data ke inventaris</p>
              </div>
              <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-[progress_1.6s_ease-in-out_forwards]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="px-6 py-4 flex justify-between items-center shrink-0 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={step === 1 ? handleReset : () => setStep(1)}
              className={cn(T.buttonSm, R.md, "px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all")}
            >
              {step === 1 ? "Batal" : "← Kembali"}
            </button>
            {step === 2 && (
              <button
                onClick={handleImport}
                className={cn(T.buttonSm, R.md, E.glowSuccess, "flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transition-all")}
              >
                Import {valid.length} Produk <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
