"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { KPICards } from "../KPICards";
import { PredictionTable } from "../PredictionTable";
import { TopProductsChart } from "../TopProductsChart";
import { LowStockAlert } from "../LowStockAlert";
import { ErrorBoundary } from "../ErrorBoundary";
import { RefreshCcw, Sparkles, Zap, ShieldCheck, ChevronRight, TrendingUp, DollarSign, ShoppingCart, BarChart3, Boxes, MapPin, Building2, ArrowUpRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useTranslation } from "@/app/i18n";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { C } from "@/app/lib/colors";
import { R, R_COMPONENT } from "@/app/lib/radii";
import { E, E_COMPONENT } from "@/app/lib/elevation";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { formatRupiah } from "@/app/lib/format";
import { GAP, STACK } from "@/app/lib/spacing";
import { TABLE } from "@/app/lib/data";
import { ResponsiveTable } from "@/app/components/ui/ResponsiveTable";

import { ChartSkeleton } from "../Skeletons";

// ForecastChart uses Recharts (heavy). Lazy-load so that "cashier" role
// — who never renders it — doesn't pay the cost in their initial bundle.
const ForecastChart = dynamic(
  () => import("../ForecastChart").then((mod) => ({ default: mod.ForecastChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton bento />,
  }
);

// --- Format helper (compact Rupiah for static mock values) ---
const fmt = (n: number) => formatRupiah(n, { compact: true });

// --- Mock Business KPIs by period ---
const PERIOD_KPIS: Record<string, { key: string; value: string; change: string; up: boolean; icon: typeof DollarSign; color: string }[]> = {
  day:   [
    { key: "dash.kpi.revenue",         value: fmt(3_200_000),  change: "+8.1%",  up: true,  icon: DollarSign,  color: "indigo" },
    { key: "dash.kpi.transactions",    value: "38",          change: "+5.3%",  up: true,  icon: ShoppingCart, color: "emerald" },
    { key: "dash.kpi.avg_transaction", value: fmt(84_200),     change: "+2.8%",  up: true,  icon: BarChart3,   color: "indigo" },
    { key: "dash.kpi.items_sold",      value: "312",         change: "-1.1%",  up: false, icon: Boxes,       color: "amber" },
  ],
  week:  [
    { key: "dash.kpi.revenue",         value: fmt(12_800_000), change: "+18.3%", up: true,  icon: DollarSign,  color: "indigo" },
    { key: "dash.kpi.transactions",    value: "142",         change: "+12.1%", up: true,  icon: ShoppingCart, color: "emerald" },
    { key: "dash.kpi.avg_transaction", value: fmt(90_100),     change: "+5.6%",  up: true,  icon: BarChart3,   color: "indigo" },
    { key: "dash.kpi.items_sold",      value: "1,247",       change: "-3.2%",  up: false, icon: Boxes,       color: "amber" },
  ],
  month: [
    { key: "dash.kpi.revenue",         value: fmt(48_500_000), change: "+22.7%", up: true,  icon: DollarSign,  color: "indigo" },
    { key: "dash.kpi.transactions",    value: "574",         change: "+15.4%", up: true,  icon: ShoppingCart, color: "emerald" },
    { key: "dash.kpi.avg_transaction", value: fmt(84_500),     change: "+6.2%",  up: true,  icon: BarChart3,   color: "indigo" },
    { key: "dash.kpi.items_sold",      value: "4,980",       change: "+4.1%",  up: true,  icon: Boxes,       color: "amber" },
  ],
};
const PERIODS = [ { key: "day", label: "Hari Ini" }, { key: "week", label: "Pekan Ini" }, { key: "month", label: "Bulan Ini" } ] as const;
type KpiPeriod = typeof PERIODS[number]["key"];

// --- Branch data ---
const BRANCHES = [
  { id: "all",  name: "Semua Cabang",       short: "ALL" },
  { id: "hq",   name: "HQ — Jakarta Pusat", short: "HQ"  },
  { id: "cb1",  name: "Cabang Tangerang",    short: "TNG" },
  { id: "cb2",  name: "Cabang Bekasi",       short: "BKS" },
] as const;
type BranchId = typeof BRANCHES[number]["id"];

const BRANCH_PERIOD_KPIS: Record<BranchId, typeof PERIOD_KPIS> = {
  all: PERIOD_KPIS,
  hq: {
    day: [
      { key: "dash.kpi.revenue",         value: fmt(1_300_000),  change: "+7.2%",  up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "16",          change: "+5.0%",  up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(81_300),     change: "+2.1%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "131",         change: "-0.8%",  up: false, icon: Boxes,        color: "amber"   },
    ],
    week: [
      { key: "dash.kpi.revenue",         value: fmt(5_400_000),  change: "+17.5%", up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "60",          change: "+11.0%", up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(90_000),     change: "+5.1%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "524",         change: "-2.5%",  up: false, icon: Boxes,        color: "amber"   },
    ],
    month: [
      { key: "dash.kpi.revenue",         value: fmt(20_400_000), change: "+21.3%", up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "241",         change: "+14.0%", up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(84_700),     change: "+5.8%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "2,092",       change: "+3.9%",  up: true,  icon: Boxes,        color: "amber"   },
    ],
  },
  cb1: {
    day: [
      { key: "dash.kpi.revenue",         value: fmt(1_100_000),  change: "+9.5%",  up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "13",          change: "+6.2%",  up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(84_600),     change: "+3.1%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "109",         change: "-1.5%",  up: false, icon: Boxes,        color: "amber"   },
    ],
    week: [
      { key: "dash.kpi.revenue",         value: fmt(4_500_000),  change: "+19.2%", up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "50",          change: "+13.0%", up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(90_000),     change: "+5.8%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "437",         change: "-3.8%",  up: false, icon: Boxes,        color: "amber"   },
    ],
    month: [
      { key: "dash.kpi.revenue",         value: fmt(17_000_000), change: "+23.1%", up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "201",         change: "+16.2%", up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(84_600),     change: "+6.6%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "1,743",       change: "+4.5%",  up: true,  icon: Boxes,        color: "amber"   },
    ],
  },
  cb2: {
    day: [
      { key: "dash.kpi.revenue",         value: fmt(800_000),    change: "+7.8%",  up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "9",           change: "+4.0%",  up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(88_900),     change: "+3.7%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "72",          change: "-0.9%",  up: false, icon: Boxes,        color: "amber"   },
    ],
    week: [
      { key: "dash.kpi.revenue",         value: fmt(2_900_000),  change: "+16.1%", up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "32",          change: "+10.5%", up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(90_600),     change: "+5.3%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "286",         change: "-3.1%",  up: false, icon: Boxes,        color: "amber"   },
    ],
    month: [
      { key: "dash.kpi.revenue",         value: fmt(11_100_000), change: "+20.8%", up: true,  icon: DollarSign,   color: "indigo"  },
      { key: "dash.kpi.transactions",    value: "132",         change: "+15.2%", up: true,  icon: ShoppingCart, color: "emerald" },
      { key: "dash.kpi.avg_transaction", value: fmt(84_100),     change: "+4.8%",  up: true,  icon: BarChart3,    color: "indigo"  },
      { key: "dash.kpi.items_sold",      value: "1,145",       change: "+3.8%",  up: true,  icon: Boxes,        color: "amber"   },
    ],
  },
};

const BRANCH_COMPARISON = [
  {
    id: "hq",  name: "HQ — Jakarta Pusat", location: "Gambir, Jakarta Pusat",
    omzet: { day: fmt(1_300_000),  week: fmt(5_400_000),  month: fmt(20_400_000) },
    txn:   { day: 16,            week: 60,             month: 241           },
    trend: { day: "+7.2%",      week: "+17.5%",       month: "+21.3%"      },
    up: true, criticalStock: 2, staffCount: 8,
  },
  {
    id: "cb1", name: "Cabang Tangerang",    location: "BSD City, Tangerang Selatan",
    omzet: { day: fmt(1_100_000),  week: fmt(4_500_000),  month: fmt(17_000_000) },
    txn:   { day: 13,            week: 50,             month: 201           },
    trend: { day: "+9.5%",      week: "+19.2%",       month: "+23.1%"      },
    up: true, criticalStock: 5, staffCount: 6,
  },
  {
    id: "cb2", name: "Cabang Bekasi",       location: "Kalimalang, Bekasi Barat",
    omzet: { day: fmt(800_000),    week: fmt(2_900_000),  month: fmt(11_100_000) },
    txn:   { day: 9,             week: 32,             month: 132           },
    trend: { day: "+7.8%",      week: "+16.1%",       month: "+20.8%"      },
    up: true, criticalStock: 3, staffCount: 5,
  },
];

export function DashboardPage() {
  const { role } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [kpiPeriod, setKpiPeriod] = useState<KpiPeriod>("week");
  const [selectedBranch, setSelectedBranch] = useState<BranchId>("all");
  const BUSINESS_KPIS = useMemo(
    () => BRANCH_PERIOD_KPIS[selectedBranch][kpiPeriod],
    [selectedBranch, kpiPeriod]
  );

  const headerKey = useMemo(() => {
    if (role === "owner") return "dash.header.owner";
    if (role === "admin" || role === "inventory_manager") return "dash.header.admin";
    return "dash.header.staff";
  }, [role]);

  const descKey = useMemo(() => {
    if (role === "owner") return "dash.desc.owner";
    if (role === "admin" || role === "inventory_manager") return "dash.desc.admin";
    return "dash.desc.staff";
  }, [role]);

  const canSeeFinancials = useMemo(() => role === "owner" || role === "admin", [role]);
  const canSeeStock      = useMemo(() => role !== "cashier", [role]);
  const totalCriticalStock = useMemo(() => BRANCH_COMPARISON.reduce((s, b) => s + b.criticalStock, 0), []);
  const totalStaff         = useMemo(() => BRANCH_COMPARISON.reduce((s, b) => s + b.staffCount, 0), []);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between", GAP.default)}>
        <div className={STACK.tight}>
          <div className="flex items-center gap-3">
              <div className={cn(T.micro, R.sm, E.glowPrimary, "px-2 py-0.5 bg-indigo-600 text-white flex items-center gap-1.5")}>
                <Zap className="size-3" />
                Live AI Engine
              </div>
              <span className={cn(T.caption, "text-slate-400")}>•</span>
              <span className={cn(T.caption, "text-slate-400 flex items-center gap-1.5")}>
                 <RefreshCcw className="size-3" />
                 {t("common.mode")}: <span className={cn(T.code, "text-indigo-600 dark:text-indigo-400")}>{role}</span>
              </span>
          </div>
          <h1 className={cn(T.h1, "text-slate-900 dark:text-slate-100")}>
            {t(headerKey)}
          </h1>
          <p className={cn(T.body, "text-slate-500 dark:text-slate-400 max-w-xl")}>
            {t(descKey)}
          </p>
        </div>
        
        {role === "admin" && (
          <div className={cn(R.md, E_COMPONENT.card, "flex items-center gap-4 bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all")}>
             <div className={cn(R.sm, "size-10 bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:rotate-6 transition-transform")}>
                <ShieldCheck className={cn("size-5", C.primary.icon)} />
             </div>
             <div>
                <p className={cn(T.label, "text-slate-500 dark:text-slate-400 leading-none mb-1")}>{t("dash.precision")}</p>
                <div className="flex items-baseline gap-1.5">
                   <span className={cn(T.h3, "font-bold text-slate-900 dark:text-slate-100 font-data")}>94.3%</span>
                   <span className={cn(T.caption, C.success.icon, "italic")}>A+ Grade</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Branch Filter */}
      {canSeeStock && (
        <div className={cn(R.md, "flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700")}>
          <div className={cn(T.label, "flex items-center gap-1.5 text-slate-400 dark:text-slate-500 shrink-0")}>
            <MapPin className="size-3" aria-hidden="true" /> Filter Cabang:
          </div>
          <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter Cabang">
            {BRANCHES.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                aria-pressed={selectedBranch === b.id}
                className={cn(
                  T.buttonSm, R.sm, "flex items-center gap-1.5 px-3 py-1.5 transition-all cursor-pointer",
                  selectedBranch === b.id
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:bg-slate-700"
                )}
              >
                <Building2 className="size-2.5" aria-hidden="true" />
                {b.name}
              </button>
            ))}
          </div>
          {selectedBranch !== "all" && (
            <span className={cn(T.label, R.xs, "ml-auto text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 border border-indigo-100 dark:border-indigo-900")}>
              {BRANCHES.find(b => b.id === selectedBranch)?.name}
            </span>
          )}
        </div>
      )}

      {/* Business KPI Cards — Period Selector */}
      <div className="flex items-center justify-between">
        <p className={cn(T.label, "text-slate-400 dark:text-slate-500")}>Ringkasan Penjualan</p>
        <div className="flex gap-1" role="group" aria-label="Periode KPI">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setKpiPeriod(p.key)}
              aria-pressed={kpiPeriod === p.key}
              className={cn(T.buttonSm, R.sm, "px-3 py-1.5 transition-all cursor-pointer",
                kpiPeriod === p.key ? "bg-slate-900 dark:bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >{p.label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {BUSINESS_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={cn(R_COMPONENT.kpi, E_COMPONENT.kpi, "bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-shadow")}>
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  R.sm, "size-9 flex items-center justify-center",
                  kpi.color === "indigo" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" :
                  kpi.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                  "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                )}>
                  <Icon className="size-4" />
                </div>
                <div className={cn(
                  T.micro, R.xs, "flex items-center gap-1 px-1.5 py-0.5",
                  kpi.up ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30"
                )}>
                  {kpi.change}
                </div>
              </div>
              <p className={cn(T.label, "text-slate-400 dark:text-slate-500 mb-1")}>{t(kpi.key)}</p>
              <p className={cn(T.kpiCard, "text-slate-900 dark:text-slate-100")}>{kpi.value}</p>
              <p className={cn(T.caption, "text-slate-300 dark:text-slate-600 mt-1")}>{t("dash.kpi.vs_yesterday")}</p>
            </div>
          );
        })}
      </div>

      {/* Multi-Branch Consolidated Report */}
      {canSeeFinancials && selectedBranch === "all" && (
        <div className={cn(R.md, E_COMPONENT.card, "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden")}>
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100 flex items-center gap-2")}>
              <Building2 className={cn("size-3.5", C.primary.icon)} aria-hidden="true" />
              Laporan Konsolidasi Multi-Cabang
            </h3>
            <span className={cn(T.caption, "text-slate-400 font-data")}>
              {PERIODS.find(p => p.key === kpiPeriod)?.label}
            </span>
          </div>
          <ResponsiveTable
            label="Laporan Konsolidasi Multi-Cabang"
            scrollerClassName="rounded-none border-0 bg-transparent"
            minWidthClassName="min-w-[820px]"
          >
            <table className={TABLE.base} aria-label="Laporan Konsolidasi Multi-Cabang">
              <thead className={TABLE.head}>
                <tr>
                  <th className={cn(TABLE.headCell, "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50")}>Cabang</th>
                  <th className={TABLE.headCell}>Omzet</th>
                  <th className={TABLE.headCell}>Transaksi</th>
                  <th className={TABLE.headCell}>Pertumbuhan</th>
                  <th className={TABLE.headCell}>Stok Kritis</th>
                  <th className={TABLE.headCell}>Staff</th>
                  <th className={TABLE.headCell} aria-label="Aksi" />
                </tr>
              </thead>
              <tbody className={TABLE.body}>
                {BRANCH_COMPARISON.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => { setSelectedBranch(b.id as BranchId); toast.info(`Menampilkan: ${b.name}`); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedBranch(b.id as BranchId); toast.info(`Menampilkan: ${b.name}`); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Filter ke ${b.name}`}
                    className={cn(TABLE.rowInteractive, "group")}
                  >
                    <td className={cn(TABLE.cell, "sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50")}>
                      <div className="flex items-center gap-2.5">
                        <div className={cn(T.label, R.sm, "size-8 bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0")}>
                          {BRANCHES.find(br => br.id === b.id)?.short}
                        </div>
                        <div>
                          <p className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-200 leading-tight")}>{b.name}</p>
                          <p className={cn(T.caption, "text-slate-400 flex items-center gap-0.5")}>
                            <MapPin className="size-2.5" />{b.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={TABLE.cell}>
                      <p className={cn(T.dataSm, "font-bold text-slate-900 dark:text-slate-200")}>{b.omzet[kpiPeriod]}</p>
                    </td>
                    <td className={TABLE.cell}>
                      <p className={cn(T.dataSm, "font-bold text-slate-900 dark:text-slate-200")}>{b.txn[kpiPeriod]}</p>
                    </td>
                    <td className={TABLE.cell}>
                      <span className={cn(
                        T.micro, R.xs, "inline-flex items-center gap-1 px-1.5 py-0.5",
                        b.up ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                      )}>
                        <ArrowUpRight className="size-2.5" />
                        {b.trend[kpiPeriod]}
                      </span>
                    </td>
                    <td className={TABLE.cell}>
                      <span className={cn(
                        T.label, "inline-flex items-center gap-1",
                        b.criticalStock >= 5 ? C.destructive.icon : b.criticalStock >= 3 ? C.warning.icon : C.success.icon
                      )}>
                        <AlertTriangle className="size-3" aria-hidden="true" />
                        {b.criticalStock} SKU
                      </span>
                    </td>
                    <td className={TABLE.cell}>
                      <p className={cn(T.bodySm, "font-bold text-slate-500 dark:text-slate-400")}>{b.staffCount} orang</p>
                    </td>
                    <td className={cn(TABLE.cell, "text-right")}>
                      <ChevronRight className="size-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                  <td className={cn(TABLE.cell, T.label, "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400")}>Total Konsolidasi</td>
                  <td className={cn(TABLE.cell, T.dataSm, "font-bold text-slate-900 dark:text-slate-200")}>{PERIOD_KPIS[kpiPeriod][0].value}</td>
                  <td className={cn(TABLE.cell, T.dataSm, "font-bold text-slate-900 dark:text-slate-200")}>{PERIOD_KPIS[kpiPeriod][1].value}</td>
                  <td className={TABLE.cell}>
                    <span className={cn(T.micro, R.xs, "inline-flex items-center gap-1 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30")}>
                      <ArrowUpRight className="size-2.5" />{PERIOD_KPIS[kpiPeriod][0].change}
                    </span>
                  </td>
                  <td className={cn(TABLE.cell, T.bodySm, "font-bold text-slate-500 dark:text-slate-400")}>{totalCriticalStock} SKU</td>
                  <td className={cn(TABLE.cell, T.bodySm, "font-bold text-slate-500 dark:text-slate-400")}>{totalStaff} orang</td>
                  <td className={TABLE.cell} />
                </tr>
              </tfoot>
            </table>
          </ResponsiveTable>
        </div>
      )}

      {/* AI KPI Cards Section (existing) */}
      {canSeeFinancials && (
        <ErrorBoundary compact sectionName="KPI Cards">
          <KPICards />
        </ErrorBoundary>
      )}

      {/* Top Products Chart + Low Stock Alert Grid */}
      {canSeeStock && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ErrorBoundary compact sectionName="Top Products">
            <TopProductsChart />
          </ErrorBoundary>
          <ErrorBoundary compact sectionName="Low Stock Alert">
            <LowStockAlert />
          </ErrorBoundary>
        </div>
      )}

      {/* Main Grid: Charts & Tables */}
      <div className="grid grid-cols-1 gap-6">
        {canSeeFinancials && (
          <div className={cn(R.md, E_COMPONENT.card, "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden")}>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100 flex items-center gap-2")}>
                  <TrendingUp className={cn("size-3.5", C.primary.icon)} aria-hidden="true" />
                  {t("dash.forecast_analysis")}
               </h3>
               <button onClick={() => router.push("/laporan")} className={cn(T.buttonSm, C.primary.icon, "flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer")}>
                  {t("dash.full_report")} <ChevronRight className="size-3" />
               </button>
            </div>
            <div className="p-4">
              <ErrorBoundary compact sectionName="Forecast Chart">
                <ForecastChart />
              </ErrorBoundary>
            </div>
          </div>
        )}

        <div className={cn(R.md, E_COMPONENT.card, "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden")}>
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
             <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100 flex items-center gap-2")}>
                <Sparkles className={cn("size-3.5", C.primary.icon)} aria-hidden="true" />
                {t("dash.ai_recommendations")}
             </h3>
             <span className={cn(T.caption, "text-slate-500 dark:text-slate-400 font-data")}>
                {t("dash.critical_items", { count: 5 })}
             </span>
          </div>
          <div className="p-0">
            <ErrorBoundary compact sectionName="Prediction Table">
              <PredictionTable />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={cn(T.caption, "pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400")}>
         <div className="flex items-center gap-4">
            <p>© 2026 InsightSphere — AI-Powered Retail ERP</p>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <p className={cn("flex items-center gap-1", C.success.icon)}>
               <span className="size-1 rounded-full bg-emerald-500" />
               {t("dash.sync_pulse")}
            </p>
         </div>
         <div className="flex items-center gap-5">
            <button onClick={() => toast.info(t("dash.toast.status"))} aria-label="Lihat status sistem InsightSphere" className="hover:text-indigo-600 transition-colors cursor-pointer">{t("common.status")}</button>
            <button onClick={() => toast.info(t("dash.toast.security"))} aria-label="Lihat informasi keamanan InsightSphere" className="hover:text-indigo-600 transition-colors cursor-pointer">{t("common.security")}</button>
            <button onClick={() => router.push("/pengaturan")} className={cn(T.buttonSm, R.sm, "px-3 py-1.5 bg-slate-900 dark:bg-indigo-900/30 dark:border dark:border-indigo-800/50 text-white dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-900/40 transition-all cursor-pointer")}>
               {t("common.documentation")}
            </button>
         </div>
      </div>
    </div>
  );
}
