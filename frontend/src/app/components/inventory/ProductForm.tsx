"use client";

import { useState } from "react";
import { X, Loader2, Package, Save } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { C } from "@/app/lib/colors";
import { R } from "@/app/lib/radii";
import { E } from "@/app/lib/elevation";
import { useTranslation } from "@/app/i18n";
import { ERROR_TEXT, FIELD, INPUT, LABEL, SELECT, TEXTAREA } from "@/app/lib/forms";

interface ProductFormData {
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  minThreshold: number;
  description: string;
}

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Partial<ProductFormData>;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}

const CATEGORIES = ["Sembako", "Minuman", "Snack", "Dairy", "Frozen", "Bakery", "ATK", "Elektronik", "Lainnya"];
const UNITS = ["pcs", "kg", "liter", "botol", "karton", "pack", "rim", "lembar"];
const PRODUCT_FIELD = cn(INPUT.base, INPUT.size.md, T.bodySm, "font-bold");
const PRODUCT_NUMERIC_FIELD = cn(PRODUCT_FIELD, "tabular-nums");
const PRODUCT_SELECT = cn(SELECT.base, SELECT.size.md, T.bodySm, "font-bold");

export function ProductForm({ mode, initialData, onClose, onSubmit }: ProductFormProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    unit: initialData?.unit || "",
    minThreshold: initialData?.minThreshold || 10,
    description: initialData?.description || "",
  });

  const validate = (): boolean => {
    const e: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) e.name = t("inv.form.required");
    if (!form.category) e.category = t("inv.form.required");
    if (form.price < 1) e.price = t("inv.form.min_1");
    if (form.stock < 0) e.stock = t("inv.form.min_0");
    if (!form.unit) e.unit = t("inv.form.required");
    if (form.minThreshold < 0) e.minThreshold = t("inv.form.min_0");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    onSubmit(form);
    setIsSaving(false);
  };

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={cn(R.xl, E["2xl"], "bg-white dark:bg-slate-900 w-full max-w-xl overflow-hidden border border-slate-200/50 dark:border-slate-700 animate-in slide-in-from-bottom-8 duration-500")}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(R.md, C.primary.bg, "size-10 flex items-center justify-center")}>
              <Package className={cn("size-5", C.primary.icon)} />
            </div>
            <div>
              <h2 className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>
                {mode === "add" ? t("inv.form.title_add") : t("inv.form.title_edit")}
              </h2>
              <p className={cn(T.caption, "text-slate-400")}>
                {mode === "add" ? "Input data produk baru ke inventaris" : "Perbarui informasi produk"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={cn(R.md, "p-2 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors")}>
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Name */}
          <div className={FIELD.wrapper}>
            <label htmlFor="pf-name" className={LABEL.base}>{t("inv.form.name")}</label>
            <input
              id="pf-name"
              type="text"
              value={form.name}
              onChange={e => updateField("name", e.target.value)}
              placeholder={t("inv.form.name_placeholder")}
              className={cn(
                PRODUCT_FIELD,
                errors.name && INPUT.error
              )}
            />
            {errors.name && <p className={ERROR_TEXT.base}>{errors.name}</p>}
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className={FIELD.wrapper}>
              <label htmlFor="pf-category" className={LABEL.base}>{t("inv.form.category")}</label>
              <select
                id="pf-category"
                value={form.category}
                onChange={e => updateField("category", e.target.value)}
                className={cn(
                  PRODUCT_SELECT,
                  errors.category && SELECT.error
                )}
              >
                <option value="">{t("inv.form.category_placeholder")}</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className={ERROR_TEXT.base}>{errors.category}</p>}
            </div>
            <div className={FIELD.wrapper}>
              <label htmlFor="pf-unit" className={LABEL.base}>{t("inv.form.unit")}</label>
              <select
                id="pf-unit"
                value={form.unit}
                onChange={e => updateField("unit", e.target.value)}
                className={cn(
                  PRODUCT_SELECT,
                  errors.unit && SELECT.error
                )}
              >
                <option value="">{t("inv.form.unit_placeholder")}</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className={ERROR_TEXT.base}>{errors.unit}</p>}
            </div>
          </div>

          {/* Price + Stock + Min Threshold */}
          <div className="grid grid-cols-3 gap-3">
            <div className={FIELD.wrapper}>
              <label htmlFor="pf-price" className={LABEL.base}>{t("inv.form.price")}</label>
              <input
                id="pf-price"
                type="number"
                value={form.price || ""}
                onChange={e => updateField("price", parseInt(e.target.value) || 0)}
                className={cn(
                  PRODUCT_NUMERIC_FIELD,
                  errors.price && INPUT.error
                )}
              />
              {errors.price && <p className={ERROR_TEXT.base}>{errors.price}</p>}
            </div>
            <div className={FIELD.wrapper}>
              <label htmlFor="pf-stock" className={LABEL.base}>{t("inv.form.stock")}</label>
              <input
                id="pf-stock"
                type="number"
                value={form.stock || ""}
                onChange={e => updateField("stock", parseInt(e.target.value) || 0)}
                className={cn(
                  PRODUCT_NUMERIC_FIELD,
                  errors.stock && INPUT.error
                )}
              />
              {errors.stock && <p className={ERROR_TEXT.base}>{errors.stock}</p>}
            </div>
            <div className={FIELD.wrapper}>
              <label htmlFor="pf-min-threshold" className={LABEL.base}>{t("inv.form.min_threshold")}</label>
              <input
                id="pf-min-threshold"
                type="number"
                value={form.minThreshold || ""}
                onChange={e => updateField("minThreshold", parseInt(e.target.value) || 0)}
                className={cn(
                  PRODUCT_NUMERIC_FIELD,
                  errors.minThreshold && INPUT.error
                )}
              />
              {errors.minThreshold && <p className={ERROR_TEXT.base}>{errors.minThreshold}</p>}
            </div>
          </div>

          {/* Description */}
          <div className={FIELD.wrapper}>
            <label htmlFor="pf-description" className={LABEL.base}>{t("inv.form.description")}</label>
            <textarea
              id="pf-description"
              value={form.description}
              onChange={e => updateField("description", e.target.value)}
              placeholder={t("inv.form.description_placeholder")}
              rows={3}
              className={cn(TEXTAREA.base, TEXTAREA.size.sm, TEXTAREA.noResize, T.bodySm, "font-bold")}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className={cn(T.buttonSm, "px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors")}
          >
            {t("inv.form.cancel")}
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSaving}
            className={cn(
              T.buttonSm, R.md, "px-5 py-2.5 flex items-center gap-2 transition-all shadow-sm",
              isSaving
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
            )}
          >
            {isSaving ? (
              <><Loader2 className="size-3.5 animate-spin" /> {t("inv.form.saving")}</>
            ) : (
              <><Save className="size-3.5" /> {t("inv.form.save")}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
