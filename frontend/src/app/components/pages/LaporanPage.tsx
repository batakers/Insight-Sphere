"use client";

import { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  Monitor,
  Bell,
  Activity,
  Archive,
  Menu,
  MinusCircle,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { CHART_COLORS } from "@/app/lib/charts";
import { StableResponsiveContainer as ResponsiveContainer } from "@/app/components/charts/StableResponsiveContainer";
import { T } from "@/app/lib/typography";
import { TABLE } from "@/app/lib/data";
import { C } from "@/app/lib/colors";
import { R } from "@/app/lib/radii";
import { E } from "@/app/lib/elevation";
import { useTranslation } from "@/app/i18n";
import { formatRupiah } from "@/app/lib/format";
import { GAP, ICON, STACK } from "@/app/lib/spacing";
import { btn } from "@/app/lib/buttons";
import { A11Y } from "@/app/lib/a11y";
import { ResponsiveTable } from "@/app/components/ui/ResponsiveTable";
import { StatsSkeleton, ChartSkeleton } from "../Skeletons";
import { ErrorBoundary } from "../ErrorBoundary";
import { toast } from "sonner";

// --- Format helper (compact Rupiah for static mock values) ---
const fmt = (n: number) => formatRupiah(n, { compact: true });

// --- Mock Data ---

const monthlySales = [
  { month: "Jan", penjualan: 145, target: 140 },
  { month: "Feb", penjualan: 158, target: 155 },
  { month: "Mar", penjualan: 162, target: 170 },
  { month: "Apr", penjualan: 177, target: 165 },
];

const categoryContribution = [
  { name: "Print Dok.", value: 35, color: CHART_COLORS.primary.base },
  { name: "Cetak Foto", value: 25, color: CHART_COLORS.semantic.ai },
  { name: "Fotokopi", value: 20, color: CHART_COLORS.semantic.inventory },
  { name: "Laminasi", value: 12, color: CHART_COLORS.semantic.destructive },
  { name: "Jasa & Scan", value: 8, color: CHART_COLORS.semantic.warning },
];

const topProducts = [
  { name: "Print B&W",       sales: fmt(28_400_000), trend: "up",     change: "+15.2%" },
  { name: "Cetak Foto 4x6",  sales: fmt(22_100_000), trend: "up",     change: "+42.0%" },
  { name: "Fotokopi A4 B&W", sales: fmt(18_700_000), trend: "up",     change: "+8.3%"  },
  { name: "Laminasi A4",     sales: fmt(14_200_000), trend: "down",   change: "-3.1%"  },
  { name: "Jilid Spiral A4", sales: fmt(9_800_000),  trend: "stable", change: "+0.5%"  },
];

const DAILY_SALES_DATA = Array.from({ length: 17 }, (_, i) => ({
  day: i + 1,
  penjualan: Math.round(5000 + Math.sin(i * 0.5) * 2000 + Math.random() * 1000)
}));

const restockHistory = [
  { id: "R-9901", date: "2026-04-15", product: "Kertas HVS A4 (5 Rim)", qty: 50, supplier: "CV Kertas Murni", status: "Diterima" },
  { id: "R-9902", date: "2026-04-16", product: "Kertas Foto Glossy", qty: 200, supplier: "PT Fuji Photo", status: "Diterima" },
  { id: "R-9903", date: "2026-04-17", product: "Tinta Printer Hitam", qty: 10, supplier: "CV Tinta Sejati", status: "Transit" },
  { id: "R-9904", date: "2026-04-18", product: "Plastik Laminasi A4", qty: 100, supplier: "PT Laminating Indo", status: "Pending" },
];

const reportTemplateKeys = [
  { titleKey: "rep.tpl.monthly_sales", icon: BarChart3, type: "PDF/Excel", period: "Monthly" },
  { titleKey: "rep.tpl.stock_prediction", icon: Package, type: "PDF", period: "Weekly" },
  { titleKey: "rep.tpl.profit_loss", icon: DollarSign, type: "PDF/Excel", period: "Monthly" },
  { titleKey: "rep.tpl.wastage_audit", icon: AlertTriangle, type: "PDF", period: "Monthly" },
];

type ReportTab = "Dashboard" | "Penjualan" | "Inventaris" | "Unduh";

const REPORT_TABS: ReportTab[] = ["Dashboard", "Penjualan", "Inventaris", "Unduh"];

export function LaporanPage() {
  const { t } = useTranslation();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportTab>("Dashboard");
  const [period, setPeriod] = useState("April 2026");

  const [autoReports, setAutoReports] = useState({ weekly: true, alerts: true, monthly: false });

  const getTabKey = (tab: ReportTab) => {
    if (tab === "Dashboard") return "rep.tab.summary";
    if (tab === "Penjualan") return "rep.tab.sales";
    if (tab === "Inventaris") return "rep.tab.inventory";
    if (tab === "Unduh") return "rep.tab.download";
    return tab;
  };

  const dashboardKpis = useMemo(() => [
    { label: t("rep.kpi.revenue"), value: fmt(177_500_000), change: "+14.2%", up: true },
    { label: t("rep.kpi.transactions"), value: "1.240", change: "+8.3%", up: true },
    { label: t("rep.kpi.material_loss"), value: fmt(420_000), change: "-46%", up: false, inverted: true },
    { label: t("rep.kpi.gross_margin"), value: "34.2%", change: "+1.8%", up: true },
  ], [t]);

  const salesKpis = useMemo(() => [
    { label: t("rep.kpi.peak"), value: fmt(7_800_000), icon: TrendingUp, color: C.primary.icon },
    { label: t("rep.kpi.avg_daily"), value: fmt(5_420_000), icon: Activity, color: "text-slate-600" },
    { label: t("rep.kpi.target_delta"), value: "+18.5%", icon: Target, color: C.success.icon },
  ], [t]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between", GAP.default)}>
        <div className={STACK.tight}>
          <h1 className={cn(T.h1, "text-slate-900 dark:text-slate-100")}>{t("rep.header")}</h1>
          <p className={cn(T.body, "text-slate-500 dark:text-slate-400 flex items-center gap-1.5")}>
            <Activity className={cn(ICON.sm, C.primary.icon)} />
            {t("rep.subheader")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className={btn("neutralSoft", "sm")}>
            <Calendar className={ICON.sm} /> {period}
          </button>
          <button
            onClick={() => toast.success(t("rep.toast.downloading", { type: "PDF", title: t("rep.header") }))}
            className={cn(btn("success", "sm"), "dark:bg-emerald-900/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:shadow-none dark:border dark:border-emerald-800/50")}>
            <Download className={ICON.sm} /> {t("rep.btn.download_pdf")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={cn(R.sm, "flex bg-slate-100/50 dark:bg-slate-800 p-1 border border-slate-200/50 dark:border-slate-700 w-fit")} role="tablist" aria-label="Laporan sections">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              cn(T.buttonSm, R.sm, "px-5 py-2 transition-all cursor-pointer"),
              activeTab === tab ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {t(getTabKey(tab))}
          </button>
        ))}
      </div>

      <div key={activeTab} className="animate-in fade-in duration-150">
          {activeTab === "Dashboard" && (
            <div className="space-y-5">
              {/* KPIs */}
              {isDataLoading ? (
                <StatsSkeleton variant="kpi" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {dashboardKpis.map((kpi, idx) => (
                      <div key={idx} className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800")}>
                        <p className={cn(T.label, "text-slate-500 dark:text-slate-400 mb-1")}>{kpi.label}</p>
                        <div className="flex items-end justify-between">
                           <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-data tabular-nums">{kpi.value}</h4>
                           <div className={cn(
                             T.micro, R.xs, "flex items-center gap-1 px-1.5 py-0.5",
                             kpi.up ? (kpi.inverted ? "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400") : 
                                     (kpi.inverted ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400")
                           )}>
                              {kpi.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                              {kpi.change}
                           </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Charts Grid */}
              <ErrorBoundary compact sectionName="Analytics Charts">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
                <div className="xl:col-span-2 h-full">
                    <div className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-5 flex flex-col h-full")}>
                      <div className="flex items-center justify-between">
                        <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100")}>{t("rep.chart.monthly")}</h3>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-indigo-500"></div><span className={cn(T.caption, "text-slate-500")}>{t("rep.chart.legend.sales")}</span></div>
                           <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-slate-100"></div><span className={cn(T.caption, "text-slate-500")}>{t("rep.chart.legend.target")}</span></div>
                        </div>
                      </div>
                      <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer debounce={200} width="100%" height="100%">
                          <BarChart data={monthlySales}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid.light} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.axis.tickLight, fontSize: 9, fontWeight: 800 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.axis.tickLight, fontSize: 9, fontWeight: 800 }} width={30} />
                            <Tooltip cursor={{ fill: CHART_COLORS.cursor.bar }} contentStyle={{ borderRadius: '0.75rem', border: 'none', background: CHART_COLORS.tooltip.bgDark, color: CHART_COLORS.tooltip.foregroundDark, fontSize: '10px' }} />
                            <Bar dataKey="penjualan" fill={CHART_COLORS.primary.base} radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="target" fill={CHART_COLORS.grid.light} radius={[4, 4, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                </div>

                <div className="h-full">
                      <div className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 flex flex-col h-full")}>
                         <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100 mb-6")}>{t("rep.chart.category")}</h3>
                         <div className="h-[200px] w-full mb-4">
                           <ResponsiveContainer debounce={200} width="100%" height="100%">
                              <PieChart>
                                <Pie data={categoryContribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" stroke="none">
                                  {categoryContribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                              </PieChart>
                           </ResponsiveContainer>
                         </div>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {categoryContribution.map((cat, i) => (
                              <div key={i} className={cn(T.caption, "flex items-center justify-between text-slate-500")}>
                                <div className="flex items-center gap-1.5">
                                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                   <span className="truncate max-w-[50px]">{cat.name}</span>
                                </div>
                                <span className="text-slate-900 dark:text-slate-100 font-data">{cat.value}%</span>
                              </div>
                            ))}
                         </div>
                      </div>
                </div>
              </div>
              </ErrorBoundary>

              {/* Best Products */}
              <ErrorBoundary compact sectionName="Best Products">
              <div className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800")}>
                   <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100 mb-4")}>{t("rep.chart.top_products")}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {topProducts.map((p, i) => (
                        <div key={i} className={cn(R.md, "bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 flex flex-col gap-2 relative overflow-hidden group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all")}>
                          <span className="absolute -right-1 -top-1 text-2xl font-bold italic text-slate-100 dark:text-slate-700 group-hover:text-indigo-100/50">#{i+1}</span>
                          <p className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-100 leading-tight pr-4")}>{p.name}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className={cn(T.bodySm, "text-slate-400 dark:text-slate-500 font-data")}>{p.sales}</span>
                            <span className={cn(T.micro, R.xs, "px-1 flex items-center gap-0.5", p.trend === "up" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400")}>
                               {p.change}
                            </span>
                          </div>
                        </div>
                      ))}
                   </div>
              </div>
              </ErrorBoundary>
            </div>
          )}

          {activeTab === "Penjualan" && (
            <div className="space-y-5">
                 <div className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-6")}>
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100")}>{t("rep.chart.daily")}</h3>
                          <p className={cn(T.caption, "text-slate-400")}>{t("rep.chart.period")}</p>
                       </div>
                       <div className={cn(R.sm, "flex bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700")}>
                          <button className={cn(T.buttonSm, R.sm, "px-4 py-1.5 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm")}>{t("rep.toggle.sales")}</button>
                          <button className={cn(T.buttonSm, R.sm, "px-4 py-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>{t("rep.toggle.volume")}</button>
                       </div>
                    </div>
                    <div className="h-[320px]">
                      <ResponsiveContainer debounce={200} width="100%" height="100%">
                        <AreaChart data={DAILY_SALES_DATA}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={CHART_COLORS.primary.base} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={CHART_COLORS.primary.base} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid.light} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.axis.tickLight, fontSize: 9, fontWeight: 800 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.axis.tickLight, fontSize: 9, fontWeight: 800 }} width={30} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: CHART_COLORS.tooltip.bgDark, color: CHART_COLORS.tooltip.foregroundDark, fontSize: '10px' }} />
                          <Area type="monotone" dataKey="penjualan" stroke={CHART_COLORS.primary.base} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" dot={{ r: 3, fill: CHART_COLORS.primary.base, strokeWidth: 1, stroke: CHART_COLORS.tooltip.bg }} activeDot={{ r: 6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {salesKpis.map((it, i) => (
                    <div key={i} className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between")}>
                       <div>
                          <p className={cn(T.label, "text-slate-500 mb-0.5")}>{it.label}</p>
                          <h4 className={cn(T.kpiCard, it.color)}>{it.value}</h4>
                       </div>
                       <it.icon className={cn("size-8 opacity-10", it.color)} />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "Inventaris" && (
            <div className="space-y-5">
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-6")}>
                    <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100")}>{t("rep.chart.wastage")}</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer debounce={200} width="100%" height="100%">
                         <BarChart data={[{m:"Jan",v:45},{m:"Feb",v:38},{m:"Mar",v:32},{m:"Apr",v:28}]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid.light} />
                            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.axis.tickLight, fontSize: 9, fontWeight: 800 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.axis.tickLight, fontSize: 9, fontWeight: 800 }} width={30} />
                            <Tooltip cursor={{ fill: CHART_COLORS.cursor.bar }} contentStyle={{ borderRadius: '8px', border: 'none', background: CHART_COLORS.tooltip.bgDark, color: CHART_COLORS.tooltip.foregroundDark, fontSize: '9px' }} />
                            <Bar dataKey="v" fill={CHART_COLORS.semantic.destructive} radius={[2, 2, 0, 0]} barSize={24} />
                         </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden")}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                       <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100")}>{t("rep.chart.restock_trace")}</h3>
                       <button type="button" className={cn(T.buttonSm, C.primary.icon, "underline", A11Y.focusRing.default)}>{t("rep.btn.view_all")}</button>
                    </div>
                    <ResponsiveTable
                      label={t("rep.chart.restock_trace")}
                      scrollerClassName="rounded-none border-0 bg-transparent"
                      minWidthClassName="min-w-[560px]"
                    >
                      <table className={TABLE.base} aria-label={t("rep.chart.restock_trace")}>
                         <thead className={TABLE.head}>
                            <tr>
                               <th className={cn(TABLE.headCell, "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50 py-2")}>{t("rep.table.item")}</th>
                               <th className={cn(TABLE.headCellNumeric, "py-2")}>{t("rep.table.qty")}</th>
                               <th className={cn(TABLE.headCell, "py-2")}>{t("rep.table.status")}</th>
                            </tr>
                         </thead>
                         <tbody className={TABLE.body}>
                            {restockHistory.map((row) => (
                              <tr key={row.product} className={cn(TABLE.row, TABLE.rowHover, "group")}>
                                 <td className={cn(TABLE.cell, "sticky left-0 z-10 bg-white py-2.5 dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50")}>
                                    <div className="flex flex-col">
                                       <span className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-100 leading-tight")}>{row.product}</span>
                                       <span className={cn(T.caption, "text-slate-400")}>{row.supplier}</span>
                                    </div>
                                 </td>
                                 <td className={cn(TABLE.cellNumeric, T.dataSm, "py-2.5 font-bold text-slate-900 dark:text-slate-100")}>{row.qty} U</td>
                                 <td className={cn(TABLE.cell, "py-2.5")}>
                                    <span className={cn(
                                      cn(T.micro, R.xs, "px-1.5 py-0.5 border"),
                                      row.status === "Diterima" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                      row.status === "Transit" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-200"
                                    )}>
                                      {row.status === "Diterima" ? t("rep.status.received") : row.status === "Transit" ? t("rep.status.transit") : t("rep.status.pending")}
                                    </span>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    </ResponsiveTable>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "Unduh" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-fit">
               <div className="space-y-4">
                  <h3 className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-100")}>{t("rep.tpl.title")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {reportTemplateKeys.map((tpl, i) => (
                        <div key={i} className={cn(R.md, E.sm, "bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group")}>
                           <div className={cn(R.sm, "size-9 bg-slate-50 dark:bg-slate-800 text-indigo-500 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all")}>
                              <tpl.icon className="size-4" />
                           </div>
                           <h4 className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-100 mb-0.5")}>{t(tpl.titleKey)}</h4>
                           <p className={cn(T.caption, "text-slate-500 dark:text-slate-400 mb-5")}>{t("rep.tpl.cycle")}: {tpl.period}</p>
                           <div className="flex gap-2">
                              <button onClick={() => toast.success(t("rep.toast.downloading", { type: "PDF", title: t(tpl.titleKey) }))} className={cn(T.buttonSm, R.xs, "flex-1 py-1.5 bg-slate-900 dark:bg-indigo-600 text-white hover:bg-indigo-600 transition-all cursor-pointer")}>PDF</button>
                              <button onClick={() => toast.success(t("rep.toast.downloading", { type: "XLS", title: t(tpl.titleKey) }))} className={cn(T.buttonSm, R.xs, "flex-1 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer")}>XLS</button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-slate-900 rounded-xl p-6 text-white space-y-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="relative z-10 space-y-1">
                     <p className={cn(T.label, "text-emerald-400 flex items-center gap-2")}>
                        <Zap className={ICON.sm} /> {t("rep.auto.title")}
                     </p>
                     <p className={cn("text-slate-400 leading-relaxed italic", T.caption)}>
                        {t("rep.auto.desc")}
                     </p>
                  </div>
                  <div className="relative z-10 space-y-3">
                     {[
                       { id: "weekly", titleKey: "rep.auto.weekly", detailKey: "rep.auto.weekly_detail" },
                       { id: "alerts", titleKey: "rep.auto.critical", detailKey: "rep.auto.critical_detail" },
                       { id: "monthly", titleKey: "rep.auto.monthly", detailKey: "rep.auto.monthly_detail" },
                     ].map((sched) => (
                        <div key={sched.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                           <div className="space-y-0.5">
                              <h5 className={cn(T.bodySm, "font-bold")}>{t(sched.titleKey)}</h5>
                              <p className={cn(T.caption, "text-slate-500")}>{t(sched.detailKey)}</p>
                           </div>
                           <button 
                             onClick={() => setAutoReports(prev => ({ ...prev, [sched.id]: !prev[sched.id as keyof typeof prev] }))}
                             className={cn("w-9 h-4.5 rounded-full transition-all relative p-0.5", autoReports[sched.id as keyof typeof autoReports] ? "bg-emerald-500" : "bg-white/20")}
                           >
                              <div className={cn("w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all", autoReports[sched.id as keyof typeof autoReports] ? "translate-x-4.5" : "translate-x-0")} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
      </div>
    </div>
  );
}
