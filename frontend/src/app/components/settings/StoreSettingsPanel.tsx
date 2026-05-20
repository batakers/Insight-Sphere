"use client";

import { Clock, Mail, MapPin, Phone, Printer, Store } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { C } from "@/app/lib/colors";
import { T } from "@/app/lib/typography";
import { FIELD, INPUT, LABEL, SWITCH, TEXTAREA } from "@/app/lib/forms";
import { ICON } from "@/app/lib/spacing";

type SettingsPanelProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
};

export function StoreSettingsPanel({ t }: SettingsPanelProps) {
  return (
    <div className="p-8 space-y-8 flex-1">
      <div className="space-y-2">
        <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100 flex items-center gap-3")}>
          <Store className={cn(ICON.lg, C.primary.icon)} />
          {t("set.store.title")}
        </h3>
        <p className={cn(T.bodySm, "text-slate-500 dark:text-slate-400")}>{t("set.store.desc")}</p>
      </div>

      {/* Store Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={FIELD.wrapper}>
          <label htmlFor="set-store-name" className={LABEL.base}>{t("set.store.name")}</label>
          <input id="set-store-name" type="text" defaultValue="Fotokopi Jaya — Pusat" placeholder={t("set.store.name_placeholder")} className={cn(INPUT.base, INPUT.size.md)} />
        </div>
        <div className={FIELD.wrapper}>
          <label htmlFor="set-store-email" className={LABEL.base}>{t("set.store.email")}</label>
          <div className="relative">
            <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", ICON.sm)} />
            <input id="set-store-email" type="email" defaultValue="info@fotokopijaya.id" placeholder={t("set.store.email_placeholder")} className={cn(INPUT.base, INPUT.size.md, "pl-11")} />
          </div>
        </div>
        <div className={FIELD.wrapper}>
          <label htmlFor="set-store-phone" className={LABEL.base}>{t("set.store.phone")}</label>
          <div className="relative">
            <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", ICON.sm)} />
            <input id="set-store-phone" type="text" defaultValue="+62 812 3456 7890" placeholder={t("set.store.phone_placeholder")} className={cn(INPUT.base, INPUT.size.md, "pl-11")} />
          </div>
        </div>
        <div className={FIELD.wrapper}>
          <label htmlFor="set-store-hours-open" className={LABEL.base}>{t("set.store.hours")}</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input id="set-store-hours-open" type="time" defaultValue="08:00" aria-label={t("set.store.hours_open")} className={cn(INPUT.base, INPUT.size.sm, "pl-9 tabular-nums")} />
            </div>
            <span className={cn(T.caption, "font-bold text-slate-300")}>—</span>
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input id="set-store-hours-close" type="time" defaultValue="21:00" aria-label={t("set.store.hours_close")} className={cn(INPUT.base, INPUT.size.sm, "pl-9 tabular-nums")} />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={FIELD.wrapper}>
        <label htmlFor="set-store-address" className={LABEL.base}>{t("set.store.address")}</label>
        <div className="relative">
          <MapPin className={cn("absolute left-4 top-3.5 text-slate-400", ICON.sm)} />
          <textarea id="set-store-address" defaultValue="Jl. Merdeka Barat No. 45, Kelurahan Gambir, Jakarta Pusat 10110" placeholder={t("set.store.address_placeholder")} rows={2} className={cn(TEXTAREA.base, TEXTAREA.size.sm, "pl-11", TEXTAREA.noResize)} />
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
        <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-100 flex items-center gap-2")}>
          <Printer className="w-4 h-4 text-slate-400" /> {t("set.store.receipt")}
        </h4>
        <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Printer className={cn(ICON.sm, "text-slate-400")} />
            <span className={cn(T.label, "text-slate-600 dark:text-slate-300")}>{t("set.store.receipt_auto")}</span>
          </div>
          <button role="switch" aria-checked={true} className={cn(SWITCH.base, SWITCH.on)}>
            <span className={cn(SWITCH.thumb, SWITCH.thumbOn)} />
          </button>
        </div>
        <div className={FIELD.wrapper}>
          <label htmlFor="set-store-receipt-footer" className={LABEL.base}>{t("set.store.receipt_footer")}</label>
          <input id="set-store-receipt-footer" type="text" defaultValue="Terima Kasih Atas Kunjungan Anda!" placeholder={t("set.store.receipt_footer_placeholder")} className={cn(INPUT.base, INPUT.size.md)} />
        </div>
      </div>
    </div>
  );
}
