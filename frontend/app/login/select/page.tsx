"use client";

import { 
  Briefcase, 
  ShieldCheck, 
  Terminal,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/i18n";
import { T } from "@/app/lib/typography";
import { ICON } from "@/app/lib/spacing";

const PORTAL_STYLE = [
  {
    id: "owner",
    icon: Briefcase,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    href: "/login/owner",
  },
  {
    id: "cashier",
    icon: ShieldCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-600 border-amber-100",
    href: "/login/cashier",
  },
  {
    id: "admin",
    icon: Terminal,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    href: "/login/admin",
  }
];

export default function SelectPortal() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="w-full max-w-4xl z-10 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 mb-2">
            <div className="size-5 bg-indigo-600 rounded-full flex items-center justify-center">
              <Zap className={cn(ICON.xs, "text-white")} />
            </div>
            <span className={cn(T.label, "text-slate-500")}>InsightSphere POS</span>
          </div>
          <h1 className={cn(T.h1, "text-slate-900")}>
            {t("auth.select.titlePre")} <span className="text-indigo-600">{t("auth.select.titleAccent")}</span> {t("auth.select.titleSuffix")}
          </h1>
          <p className={cn(T.bodySm, "text-slate-400")}>
            {t("auth.select.subtitle")}
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PORTAL_STYLE.map((portal, idx) => (
            <div
              key={portal.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${100 + idx * 80}ms`, animationFillMode: "backwards" }}
            >
              <Link href={portal.href} className="group block h-full">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 h-full flex flex-col">
                  
                  {/* Icon + Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={cn("size-11 rounded-xl flex items-center justify-center", portal.iconBg)}>
                      <portal.icon className={cn(ICON.lg, portal.iconColor)} />
                    </div>
                    <span className={cn(T.micro, "px-2.5 py-1 rounded-full border", portal.badge)}>
                      {t(`auth.select.${portal.id}.role`)}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 space-y-1.5 mb-6">
                    <h3 className={cn(T.h3, "text-slate-900")}>{t(`auth.select.${portal.id}.title`)}</h3>
                    <p className={cn(T.bodySm, "font-medium text-slate-500 leading-relaxed")}>{t(`auth.select.${portal.id}.desc`)}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className={cn(T.buttonSm, "text-slate-400")}>{t("auth.select.signIn")}</span>
                    <div className="size-7 bg-slate-100 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-all duration-200">
                      <ArrowRight className={cn(ICON.sm, "text-slate-500 group-hover:text-white transition-colors")} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="text-center animate-in fade-in duration-300"
          style={{ animationDelay: "500ms", animationFillMode: "backwards" }}
        >
          <p className={cn(T.caption, "text-slate-300")}>
            {t("auth.select.footer")}
          </p>
        </div>

      </div>
    </div>
  );
}
