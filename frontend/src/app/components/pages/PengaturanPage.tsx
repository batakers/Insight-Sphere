"use client";

import { 
  User, 
  Store, 
  Bell, 
  BrainCircuit, 
  ShieldCheck, 
  Lock, 
  LogOut,
  ChevronRight,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  Zap,
  Layout,
  Database,
  Users,
  MapPin,
  Phone,
  Clock,
  Printer,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  MessageSquare,
  UserPlus,
  Shield,
  Monitor,
  History,
  Download,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Copy,
  Info
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { TABLE } from "@/app/lib/data";
import { C } from "@/app/lib/colors";
import { R } from "@/app/lib/radii";
import { E } from "@/app/lib/elevation";
import { btn, BTN } from "@/app/lib/buttons";
import { INPUT, TEXTAREA, SWITCH, FIELD, LABEL, FOCUS } from "@/app/lib/forms";
import { GAP, ICON, STACK } from "@/app/lib/spacing";
import { TABS } from "@/app/lib/nav";
import { A11Y } from "@/app/lib/a11y";
import { ResponsiveTable } from "@/app/components/ui/ResponsiveTable";
import { useState, memo, useCallback } from "react";
import { useTranslation } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

type SettingsTab = "profile" | "store" | "notifications" | "ai" | "access" | "security" | "logout";

export function PengaturanPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); toast.success(t("set.toast.success")); }, 1500);
  };

  const handleGoBack = useCallback(() => setActiveTab("profile"), []);

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: t("set.tab.profile"), icon: User },
    { id: "store", label: t("set.tab.store"), icon: Store },
    { id: "notifications", label: t("set.tab.notifications"), icon: Bell },
    { id: "ai", label: t("set.tab.ai"), icon: BrainCircuit },
    { id: "access", label: t("set.tab.access"), icon: Users },
    { id: "security", label: t("set.tab.security"), icon: Lock },
    { id: "logout", label: t("set.tab.logout"), icon: LogOut },
  ];

  const { role, logout } = useAuth();

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between", GAP.default)}>
        <div className={STACK.tight}>
          <h1 className={cn(T.h1, "text-slate-900 dark:text-slate-100")}>{t("set.header")}</h1>
          <div className="flex items-center gap-2">
             <p className={cn(T.body, "text-slate-500 dark:text-slate-400 flex items-center gap-1.5")}>
                <ShieldCheck className={cn(ICON.sm, C.primary.icon)} />
                {t("set.subheader")}
             </p>
             <span className={cn(T.micro, R.xs, "px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50")}>Admin Lvl 4</span>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(btn("neutral", "md"), "shadow-lg shadow-slate-100/50")}
        >
          {isSaving ? <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className={cn(ICON.sm, "text-amber-400")} />}
          {t("set.btn.save")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav — Vertical tablist (ARIA-compliant, TABS.md §3 vertical pattern) */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Pengaturan navigation"
          className="lg:col-span-1 space-y-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                BTN.base, BTN.size.md,
                "w-full flex items-center justify-between rounded-xl font-bold transition-all group",
                activeTab === tab.id 
                  ? cn(BTN.variant.neutral, "translate-x-1 shadow-xl") 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={cn(ICON.sm, activeTab === tab.id ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-500")} />
                {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight className={cn(ICON.xs, "text-white/50")} />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] overflow-hidden flex flex-col">
              <div
                id={`panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                className="p-8 flex-1"
              >
                  {activeTab === "profile" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                         <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center relative group overflow-hidden">
                            <User className="w-8 h-8 text-white" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                               <p className={cn(T.buttonSm, "text-white")}>{t("set.profile.change_photo")}</p>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>Faiz Admin</h3>
                            <p className={cn(T.caption, "text-slate-500 dark:text-slate-400")}>Superuser Access • Jakarta HQ</p>
                         </div>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={FIELD.wrapper}>
                         <label htmlFor="set-profile-name" className={LABEL.base}>{t("set.profile.name_label")}</label>
                         <input id="set-profile-name" type="text" defaultValue="Faiz Admin" className={cn(INPUT.base, INPUT.size.md)} />
                      </div>
                      <div className={FIELD.wrapper}>
                         <label htmlFor="set-profile-email" className={LABEL.base}>{t("set.profile.email_label")}</label>
                         <div className="relative">
                            <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", ICON.sm)} />
                            <input id="set-profile-email" type="email" defaultValue="faiz@insightsphere.ai" className={cn(INPUT.base, INPUT.size.md, "pl-11")} />
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 group">
                       <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400"><Smartphone className={cn(ICON.md, "")} /></div>
                       <div className="flex-1">
                          <p className={cn(T.label, "text-indigo-900 dark:text-indigo-300")}>{t("set.profile.2fa_title")}</p>
                          <p className={cn(T.caption, "text-indigo-600/70 dark:text-indigo-400/70")}>{t("set.profile.2fa_desc")}</p>
                       </div>
                       <button className={cn(btn("primary", "sm"), "dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:shadow-none dark:border dark:border-indigo-800/50")}>{t("set.profile.2fa_btn")}</button>
                    </div>
                    </div>
                  )}

                  {activeTab === "ai" && (
                    <div className="space-y-8">
                       <div className="space-y-2">
                          <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100 flex items-center gap-3")}>
                             <Layout className={cn(ICON.lg, C.primary.icon)} />
                             {t("set.ai.title")}
                          </h3>
                          <p className={cn(T.bodySm, "text-slate-500 dark:text-slate-400")}>{t("set.ai.desc")}</p>
                       </div>

                       <div className="space-y-6">
                          {[
                            { label: t("set.ai.threshold"), value: 85, desc: t("set.ai.threshold_desc") },
                            { label: t("set.ai.window"), value: 30, desc: t("set.ai.window_desc") }
                          ].map((slider, i) => (
                            <div key={i} className="space-y-3">
                               <div className="flex items-center justify-between">
                                  <div>
                                     <p className={cn(T.label, "text-slate-900 dark:text-slate-100")}>{slider.label}</p>
                                     <p className={cn(T.caption, "text-slate-400")}>{slider.desc}</p>
                                  </div>
                                  <span className={cn(T.dataSm, "font-bold", C.primary.icon)}>{slider.value}%</span>
                               </div>
                               <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                  <div className="absolute top-0 left-0 h-full bg-indigo-500 transition-all cursor-pointer" style={{ width: `${slider.value}%` }} />
                               </div>
                            </div>
                          ))}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                             <div className="flex items-center gap-3">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <span className={cn(T.label, "text-slate-600 dark:text-slate-300")}>{t("set.ai.xai_viz")}</span>
                             </div>
                             <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                             </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                             <div className="flex items-center gap-3">
                                <Database className="w-4 h-4 text-slate-400" />
                                <span className={cn(T.label, "text-slate-600 dark:text-slate-300")}>{t("set.ai.auto_retrain")}</span>
                             </div>
                             <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                                <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === "store" && <StoreTab t={t} />}
                  {activeTab === "notifications" && <NotificationsTab t={t} />}
                  {activeTab === "access" && <AccessTab t={t} />}
                  {activeTab === "security" && <SecurityTab t={t} />}
                  {activeTab === "logout" && <LogoutTab t={t} onBack={handleGoBack} onLogout={logout} />}
              </div>

            {/* Footer Status */}
            <div className={cn("px-8 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-data text-slate-500 dark:text-slate-400", T.caption)}>
               <span>System Hash: IS-A92-F1X</span>
               <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Region: US-EAST-1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-components for each settings tab
// ═══════════════════════════════════════════════════════════════

type TFn = (key: string, params?: Record<string, string | number>) => string;

const StoreTab = memo(function StoreTab({ t }: { t: TFn }) {
  return (
    <div className="space-y-8">
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
});

const NotificationsTab = memo(function NotificationsTab({ t }: { t: TFn }) {
  const notifItems = [
    { key: "stock_alert", icon: AlertTriangle, enabled: true, color: "amber" as const },
    { key: "daily_report", icon: BarChart3, enabled: true, color: "indigo" as const },
    { key: "large_txn", icon: CalendarDays, enabled: false, color: "rose" as const, hasThreshold: true },
    { key: "weekly_summary", icon: CalendarDays, enabled: true, color: "emerald" as const },
  ];

  const channels = [
    { key: "channel_email", icon: Mail, active: true },
    { key: "channel_inapp", icon: Bell, active: true },
    { key: "channel_wa", icon: MessageSquare, active: false },
  ];

  const colorMap = { amber: `${C.warning.bg} ${C.warning.icon}`, indigo: `${C.primary.bg} ${C.primary.icon}`, rose: `${C.destructive.bg} ${C.destructive.icon}`, emerald: `${C.success.bg} ${C.success.icon}` };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100 flex items-center gap-3")}>
          <Bell className={cn(ICON.lg, C.primary.icon)} />
          {t("set.notif.title")}
        </h3>
        <p className={cn(T.bodySm, "text-slate-500 dark:text-slate-400")}>{t("set.notif.desc")}</p>
      </div>

      <div className="space-y-3">
        {notifItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorMap[item.color])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(T.label, "text-slate-900 dark:text-slate-200")}>{t(`set.notif.${item.key}`)}</p>
                    <p className={cn(T.caption, "text-slate-400")}>{t(`set.notif.${item.key}_desc`)}</p>
                  </div>
                </div>
                <button role="switch" aria-checked={item.enabled} className={cn(SWITCH.base, item.enabled ? SWITCH.on : SWITCH.off)}>
                  <span className={cn(SWITCH.thumb, item.enabled ? SWITCH.thumbOn : SWITCH.thumbOff)} />
                </button>
              </div>
              {item.hasThreshold && (
                <div className="pl-11">
                  <div className={FIELD.wrapper}>
                    <label htmlFor="set-notif-threshold" className={LABEL.base}>{t("set.notif.large_txn_threshold")}</label>
                    <input id="set-notif-threshold" type="number" defaultValue="500000" className={cn(INPUT.base, INPUT.size.sm, "w-40 tabular-nums")} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Channel Selector */}
      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
          <MessageSquare className="w-4 h-4 text-slate-400" /> {t("set.notif.channel")}
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {channels.map((ch) => {
            const ChIcon = ch.icon;
            return (
              <button key={ch.key} className={cn(
                "flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all cursor-pointer",
                ch.active ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
              )}>
                <ChIcon className="w-5 h-5" />
                <span className={cn(T.buttonSm)}>{t(`set.notif.${ch.key}`)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const AccessTab = memo(function AccessTab({ t }: { t: TFn }) {
  const members = [
    { name: "Faiz Admin", email: "faiz@insightsphere.ai", role: "Admin", active: true, lastActive: "Sekarang" },
    { name: "Budi Kasir", email: "budi@toko.id", role: "Cashier", active: true, lastActive: "2 jam lalu" },
    { name: "Siti Owner", email: "siti@toko.id", role: "Owner", active: true, lastActive: "1 hari lalu" },
    { name: "Rina Staff", email: "rina@toko.id", role: "Cashier", active: false, lastActive: "5 hari lalu" },
  ];

  const permissions = [
    { feature: "Dashboard", admin: true, owner: true, cashier: true },
    { feature: "POS / Kasir", admin: true, owner: true, cashier: true },
    { feature: "Inventory CRUD", admin: true, owner: true, cashier: false },
    { feature: "AI Forecasting", admin: true, owner: true, cashier: false },
    { feature: "Laporan", admin: true, owner: true, cashier: true },
    { feature: "Pengaturan", admin: true, owner: true, cashier: false },
    { feature: "Tim & Akses", admin: true, owner: false, cashier: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100 flex items-center gap-3")}>
            <Users className={cn(ICON.lg, C.primary.icon)} />
            {t("set.access.title")}
          </h3>
          <p className={cn(T.bodySm, "text-slate-500 dark:text-slate-400")}>{t("set.access.desc")}</p>
        </div>
        <button className={cn(btn("primary", "sm"), "dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:shadow-none dark:border dark:border-indigo-800/50")}>
          <UserPlus className={ICON.sm} /> {t("set.access.invite")}
        </button>
      </div>

      {/* Mirror Mode Info */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
        <Info className="w-4 h-4 text-amber-500 shrink-0" />
        <p className={cn(T.bodySm, C.warning.text)}>{t("set.access.mirror_info")}</p>
      </div>

      {/* Team Table */}
      <ResponsiveTable
        label={t("set.access.title")}
        scrollerClassName="rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30"
        minWidthClassName="min-w-[760px]"
      >
        <table className={TABLE.base} aria-label={t("set.access.title")}>
          <thead className={TABLE.head}>
            <tr>
              <th className={cn(TABLE.headCell, "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50")}>{t("set.access.name")}</th>
              <th className={TABLE.headCell}>{t("set.access.role")}</th>
              <th className={TABLE.headCell}>{t("set.access.status")}</th>
              <th className={TABLE.headCell}>{t("set.access.last_active")}</th>
              <th className={cn(TABLE.headCell, "text-center")}>{t("set.access.actions")}</th>
            </tr>
          </thead>
          <tbody className={TABLE.body}>
            {members.map((member) => (
              <tr key={member.email} className={cn(TABLE.row, TABLE.rowHover, "group")}>
                <td className={cn(TABLE.cell, "sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50")}>
                  <div className="flex items-center gap-3">
                    <div className={cn(T.label, "size-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400")}>
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className={cn(T.label, "text-slate-900 dark:text-slate-200")}>{member.name}</p>
                      <p className={cn(T.caption, "text-slate-400")}>{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className={TABLE.cell}>
                  <span className={cn(
                    cn(T.micro, R.sm, "px-2 py-1 border"),
                    member.role === "Admin" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50" :
                    member.role === "Owner" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50" :
                    "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {member.role}
                  </span>
                </td>
                <td className={TABLE.cell}>
                  <span className={cn(
                    "inline-flex items-center gap-1", T.caption,
                    member.active ? C.success.icon : "text-slate-300"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", member.active ? "bg-emerald-500" : "bg-slate-300")} />
                    {member.active ? t("set.access.active") : t("set.access.inactive")}
                  </span>
                </td>
                <td className={cn(TABLE.cell, "text-slate-400", T.caption)}>{member.lastActive}</td>
                <td className={cn(TABLE.cell, "text-center")}>
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" className={cn(T.buttonSm, "px-2 py-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer", A11Y.focusRing.default)}>{t("set.access.edit_role")}</button>
                    <button type="button" className={cn(T.buttonSm, "px-2 py-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer", A11Y.focusRing.destructive)}>{t("set.access.remove")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>

      {/* Permission Matrix */}
      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div>
          <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
            <Shield className="w-4 h-4 text-slate-400" /> {t("set.access.permission_title")}
          </h4>
          <p className={cn(T.caption, "text-slate-400 mt-0.5")}>{t("set.access.permission_desc")}</p>
        </div>
        <ResponsiveTable
          label={t("set.access.permission_title")}
          scrollerClassName="rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30"
          minWidthClassName="min-w-[560px]"
        >
          <table className={TABLE.base} aria-label={t("set.access.permission_title")}>
            <thead className={TABLE.head}>
              <tr>
                <th className={cn(TABLE.headCell, "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50")}>{t("set.access.feature")}</th>
                <th className={cn(TABLE.headCell, "text-center", C.primary.icon)}>Admin</th>
                <th className={cn(TABLE.headCell, "text-center", C.warning.icon)}>Owner</th>
                <th className={cn(TABLE.headCell, "text-center")}>Cashier</th>
              </tr>
            </thead>
            <tbody className={TABLE.body}>
              {permissions.map((row) => (
                <tr key={row.feature} className={cn(TABLE.row, TABLE.rowHover, "group")}>
                  <td className={cn(TABLE.cell, "sticky left-0 z-10 bg-white font-bold dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50", T.bodySm)}>{row.feature}</td>
                  {[row.admin, row.owner, row.cashier].map((allowed, j) => (
                    <td key={j} className={cn(TABLE.cell, "text-center")}>
                      {allowed ? <CheckCircle2 className={cn("w-4 h-4 mx-auto", C.success.icon)} /> : <XCircle className="w-4 h-4 text-slate-200 dark:text-slate-700 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>
    </div>
  );
});

const SecurityTab = memo(function SecurityTab({ t }: { t: TFn }) {
  const [pinStep, setPinStep] = useState<"idle" | "verify" | "new" | "confirm" | "done">("idle");
  const [pinValues, setPinValues] = useState({ current: ["","","",""], next: ["","","",""], confirm: ["","","",""] });
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState<"off" | "qr" | "verify" | "done">("off");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [backupCodes] = useState(["A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0"]);

  const [lhFilter, setLhFilter] = useState<"all" | "success" | "failed">("all");
  const [lhLimit,  setLhLimit]  = useState(5);

  const [twoFaLoading,       setTwoFaLoading]       = useState(false);
  const [twoFaError,         setTwoFaError]         = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const [pinLoading, setPinLoading] = useState(false);
  const [pinError,   setPinError]   = useState("");

  const [pwOld, setPwOld]           = useState("");
  const [pwNew, setPwNew]           = useState("");
  const [pwConfirm, setPwConfirm]   = useState("");
  const [showPwOld, setShowPwOld]   = useState(false);
  const [showPwNew, setShowPwNew]   = useState(false);
  const [showPwConf, setShowPwConf] = useState(false);
  const [isPwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]       = useState("");

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (!pwOld.trim()) { setPwError(t("set.sec.error_old_required")); return; }
    if (pwNew.length < 8) { setPwError(t("set.sec.error_min")); return; }
    if (pwNew !== pwConfirm) { setPwError(t("set.sec.error_mismatch")); return; }
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setPwLoading(false);
    setPwOld(""); setPwNew(""); setPwConfirm("");
    toast.success(t("set.sec.pw_updated"));
  };

  const handlePinInput = (group: "current" | "next" | "confirm", idx: number, val: string) => {
    if (val.length > 1 || !/^[0-9]*$/.test(val)) return;
    setPinValues(prev => ({ ...prev, [group]: prev[group].map((v, i) => i === idx ? val : v) }));
    if (val && idx < 3) {
      const next = document.getElementById(`pin-${group}-${idx + 1}`);
      next?.focus();
    }
  };

  const sessions = [
    { device: "Chrome — Windows 11", ip: "103.120.14.52", lastActive: "Sekarang", current: true },
    { device: "Safari — iPhone 15", ip: "103.120.14.52", lastActive: "3 jam lalu", current: false },
  ];

  const ALL_LOGIN_LOGS = [
    { date: "2026-05-01 23:45", device: "Chrome — Windows 11",   ip: "103.120.14.52",  location: "Jakarta, ID",         success: true  },
    { date: "2026-05-01 14:20", device: "Safari — iPhone 15",   ip: "103.120.14.52",  location: "Jakarta, ID",         success: true  },
    { date: "2026-05-01 09:05", device: "Chrome — Windows 11",   ip: "103.120.14.52",  location: "Jakarta, ID",         success: true  },
    { date: "2026-04-30 22:33", device: "Firefox — Linux",      ip: "185.220.101.2",  location: "Tor Exit Node",       success: false },
    { date: "2026-04-30 22:31", device: "Firefox — Linux",      ip: "185.220.101.2",  location: "Tor Exit Node",       success: false },
    { date: "2026-04-30 18:15", device: "Chrome — Windows 11",   ip: "103.120.14.52",  location: "Jakarta, ID",         success: true  },
    { date: "2026-04-29 11:30", device: "Safari — MacBook Pro",  ip: "118.136.45.22", location: "Bandung, ID",         success: true  },
    { date: "2026-04-28 20:10", device: "Chrome — Android",     ip: "103.120.14.52",  location: "Jakarta, ID",         success: true  },
    { date: "2026-04-27 15:45", device: "Edge — Windows 11",     ip: "103.120.14.52",  location: "Jakarta, ID",         success: true  },
    { date: "2026-04-26 08:20", device: "Firefox — Linux",      ip: "45.79.112.3",    location: "Singapore, SG",       success: false },
  ];
  const filteredLogs     = ALL_LOGIN_LOGS.filter(l => lhFilter === "all" || (lhFilter === "success" ? l.success : !l.success));
  const visibleLogs      = filteredLogs.slice(0, lhLimit);
  const suspiciousCount  = ALL_LOGIN_LOGS.filter(l => !l.success).length;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100 flex items-center gap-3")}>
          <Lock className={cn(ICON.lg, C.primary.icon)} />
          {t("set.sec.title")}
        </h3>
        <p className={cn(T.bodySm, "text-slate-500 dark:text-slate-400")}>{t("set.sec.desc")}</p>
      </div>

      {/* 2FA Wizard */}
      <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
              <ShieldCheck className="w-4 h-4 text-slate-400" /> {t("set.sec.twofa_title")}
            </h4>
            <p className={cn(T.caption, "text-slate-400 dark:text-slate-500 mt-0.5")}>{t("set.sec.twofa_desc")}</p>
          </div>
          <button
            onClick={() => {
              if (!twoFaEnabled) {
                setTwoFaStep("qr");
                setTwoFaError("");
              } else {
                setShowDisableConfirm(true);
              }
            }}
            role="switch"
            aria-checked={twoFaEnabled}
            className={cn(SWITCH.base, twoFaEnabled ? SWITCH.on : SWITCH.off)}
          >
            <span className={cn(SWITCH.thumb, twoFaEnabled ? SWITCH.thumbOn : SWITCH.thumbOff)} />
          </button>
        </div>

        {/* Disable confirmation */}
        {showDisableConfirm && (
          <div className={cn(R.lg, "flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 animate-in fade-in duration-200")}>
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={cn(T.label, "text-amber-800 dark:text-amber-300")}>{t("set.sec.twofa_disable_confirm")}</p>
              <p className={cn(T.caption, "text-amber-600 dark:text-amber-400 mt-0.5")}>{t("set.sec.twofa_disable_hint")}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowDisableConfirm(false)} className={btn("ghost", "sm")}>{t("set.sec.twofa_back")}</button>
                <button
                  onClick={() => {
                    setTwoFaEnabled(false);
                    setTwoFaStep("off");
                    setShowDisableConfirm(false);
                    setTwoFaCode("");
                    toast.success(t("set.sec.twofa_deactivated"));
                  }}
                  className={btn("destructiveSoft", "sm")}
                >
                  {t("set.sec.twofa_disable_btn")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: QR */}
        {twoFaStep === "qr" && (
          <div className={cn(R.lg, "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200")}>
            <p className={cn(T.label, C.primary.icon)}>{t("set.sec.twofa_step1")}</p>
            <div className="flex gap-5 items-start">
              {/* Mock QR */}
              <div className={cn(R.lg, "size-28 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0")}>
                <div className="grid grid-cols-5 gap-0.5 p-1.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={cn("size-4 rounded-sm", [0,1,5,6,7,10,14,18,19,24].includes(i) ? "bg-slate-800 dark:bg-slate-100" : "bg-white dark:bg-slate-900")} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <p className={cn(T.label, "text-slate-600 dark:text-slate-300")}>{t("set.sec.twofa_scan_hint")}</p>
                <div className={cn(R.md, "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-2 flex items-center justify-between gap-2")}>
                  <div className="min-w-0">
                    <p className={cn(T.label, "text-slate-400 dark:text-slate-500")}>{t("set.sec.twofa_secret")}</p>
                    <p className={cn(T.code, C.primary.icon, "truncate")}>JBSWY3DPEHPK3PXP</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("JBSWY3DPEHPK3PXP"); toast.success(t("set.sec.twofa_copied_secret")); }}
                    className={cn(T.buttonSm, R.sm, "flex items-center gap-1 px-2 py-1 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer shrink-0")}
                  >
                    <Copy className="size-3" /> {t("set.sec.twofa_copy_secret")}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setTwoFaStep("verify"); setTwoFaError(""); setTwoFaCode(""); }}
              className={cn(btn("primary", "sm"), "dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:shadow-none dark:border dark:border-indigo-800/50")}
            >
              {t("set.sec.twofa_next")}
            </button>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {twoFaStep === "verify" && (
          <div className={cn(R.lg, "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200")}>
            <p className={cn(T.label, C.primary.icon)}>{t("set.sec.twofa_step2")}</p>
            <div className="space-y-1">
              <p className={cn(T.caption, "text-slate-500 dark:text-slate-400")}>{t("set.sec.twofa_otp_hint")}</p>
              <p className={cn(T.caption, "text-amber-500 dark:text-amber-400 font-bold")}>{t("set.sec.twofa_otp_demo")}</p>
            </div>
            <input
              type="text"
              maxLength={6}
              value={twoFaCode}
              onChange={e => { setTwoFaCode(e.target.value.replace(/\D/g, "")); setTwoFaError(""); }}
              placeholder="000000"
              className={cn(INPUT.base, R.lg, "w-32 h-14 px-3 text-center text-2xl font-bold font-data tabular-nums tracking-[0.3em]")}
            />
            {twoFaError && (
              <div className={cn(T.bodySm, R.md, "flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 border border-rose-100 dark:border-rose-800/50 animate-in fade-in duration-150")}>
                <AlertCircle className="size-3.5 shrink-0" /> {twoFaError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setTwoFaStep("qr"); setTwoFaError(""); }} className={btn("ghost", "sm")}>{t("set.sec.twofa_back")}</button>
              <button
                onClick={async () => {
                  if (twoFaCode.length !== 6) return;
                  setTwoFaLoading(true);
                  await new Promise(r => setTimeout(r, 1000));
                  setTwoFaLoading(false);
                  if (twoFaCode !== "123456") {
                    setTwoFaError(t("set.sec.twofa_error_wrong"));
                    return;
                  }
                  setTwoFaEnabled(true);
                  setTwoFaStep("done");
                  toast.success(t("set.sec.twofa_activated"));
                }}
                disabled={twoFaCode.length !== 6 || twoFaLoading}
                className={cn(btn("primary", "sm"), "dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:shadow-none dark:border dark:border-indigo-800/50")}
              >
                {twoFaLoading ? <Loader2 className="size-3.5 animate-spin" /> : t("set.sec.twofa_activate")}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done — Backup Codes */}
        {twoFaStep === "done" && (
          <div className={cn(R.lg, "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-5 space-y-3 animate-in slide-in-from-top-2 duration-200")}>
            <div className="flex items-center justify-between">
              <p className={cn(T.label, "flex items-center gap-1.5", C.success.icon)}>
                <CheckCircle2 className={ICON.sm} /> {t("set.sec.twofa_done_title")}
              </p>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(backupCodes.join("\n")); toast.success(t("set.sec.twofa_copied_codes")); }}
                className={cn(T.buttonSm, R.sm, "flex items-center gap-1 px-2 py-1 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all cursor-pointer")}
              >
                <Copy className="size-3" /> {t("set.sec.twofa_copy_codes")}
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {backupCodes.map((code, i) => (
                <span key={i} className={cn(T.code, R.sm, "bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 px-2 py-1.5 text-slate-700 dark:text-slate-300 text-center block")}>{code}</span>
              ))}
            </div>
            <p className={cn(T.caption, "text-slate-400 dark:text-slate-500")}>{t("set.sec.twofa_backup_hint")}</p>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
          <KeyRound className="w-4 h-4 text-slate-400" /> {t("set.sec.change_pw")}
        </h4>
        <form onSubmit={handleChangePw} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "set-pw-old",  label: t("set.sec.old_pw"),     val: pwOld,     set: setPwOld,     show: showPwOld, toggle: () => setShowPwOld(v => !v) },
              { id: "set-pw-new",  label: t("set.sec.new_pw"),     val: pwNew,     set: setPwNew,     show: showPwNew, toggle: () => setShowPwNew(v => !v) },
              { id: "set-pw-conf", label: t("set.sec.confirm_pw"), val: pwConfirm, set: setPwConfirm, show: showPwConf, toggle: () => setShowPwConf(v => !v) },
            ].map(field => (
              <div key={field.id} className={FIELD.wrapper}>
                <label htmlFor={field.id} className={LABEL.base}>{field.label}</label>
                <div className={cn(INPUT.base, INPUT.size.md, "flex items-center gap-2 pr-2")}>
                  <input
                    id={field.id}
                    type={field.show ? "text" : "password"}
                    value={field.val}
                    onChange={e => field.set(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none w-full flex-1"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 shrink-0 transition-colors cursor-pointer"
                    aria-label={field.show ? "Sembunyikan" : "Tampilkan"}
                  >
                    {field.show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pwError && (
            <div className={cn(T.bodySm, R.md, "flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2.5 border border-rose-100 dark:border-rose-800/50 animate-in fade-in duration-150")}>
              <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
              {pwError}
            </div>
          )}

          <button type="submit" disabled={isPwLoading} className={cn(btn("primary", "sm"), "dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:shadow-none dark:border dark:border-indigo-800/50 disabled:opacity-50")}>
            {isPwLoading
              ? <><Loader2 className="size-3.5 animate-spin" /> {t("set.sec.update_pw")}...</>
              : t("set.sec.update_pw")
            }
          </button>
        </form>
      </div>

      {/* Change PIN */}
      <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
              <KeyRound className="w-4 h-4 text-slate-400" /> {t("set.sec.pin_title")}
            </h4>
            {pinStep === "idle" && (
              <p className={cn(T.caption, "text-slate-400 dark:text-slate-500 mt-0.5")}>{t("set.sec.pin_desc")}</p>
            )}
          </div>
          {pinStep === "idle" && (
            <button onClick={() => { setPinStep("verify"); setPinError(""); }} className={btn("neutralSoft", "sm")}>
              {t("set.sec.pin_change_btn")}
            </button>
          )}
        </div>

        {pinStep !== "idle" && pinStep !== "done" && (() => {
          const stepNum = pinStep === "verify" ? 1 : pinStep === "new" ? 2 : 3;
          const groups = (["current", "next", "confirm"] as const).slice(0, stepNum);
          const groupLabels: Record<string, string> = {
            current: t("set.sec.pin_current"),
            next:    t("set.sec.pin_new"),
            confirm: t("set.sec.pin_confirm"),
          };
          const allFilled = pinValues[groups[groups.length - 1]].every(v => v !== "");

          const handleNext = async () => {
            setPinError("");
            if (pinStep === "verify") {
              if (pinValues.current.join("") !== "1234") {
                setPinError(t("set.sec.pin_error_wrong"));
                return;
              }
              setPinStep("new");
            } else if (pinStep === "new") {
              setPinStep("confirm");
            } else {
              if (pinValues.next.join("") !== pinValues.confirm.join("")) {
                setPinError(t("set.sec.pin_error_mismatch"));
                return;
              }
              setPinLoading(true);
              await new Promise(r => setTimeout(r, 1000));
              setPinLoading(false);
              setPinStep("done");
              toast.success(t("set.sec.pin_success"));
            }
          };

          return (
            <div className={cn(R.lg, "space-y-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 animate-in slide-in-from-top-2 duration-200")}>
              <p className={cn(T.label, C.primary.icon)}>{t("set.sec.pin_step", { step: stepNum })}</p>
              {pinStep === "verify" && (
                <p className={cn(T.caption, "text-amber-500 dark:text-amber-400 font-bold")}>{t("set.sec.pin_demo")}</p>
              )}
              {groups.map(group => (
                <div key={group} className="space-y-2">
                  <p className={cn(T.label, "text-slate-400 dark:text-slate-500")}>{groupLabels[group]}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map(idx => (
                      <input
                        key={idx}
                        id={`pin-${group}-${idx}`}
                        type="password"
                        maxLength={1}
                        inputMode="numeric"
                        value={pinValues[group][idx]}
                        onChange={e => { handlePinInput(group, idx, e.target.value); setPinError(""); }}
                        className={cn(INPUT.base, R.lg, "w-12 h-12 px-0 text-center text-xl font-bold font-data tabular-nums")}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {pinError && (
                <div className={cn(T.bodySm, R.md, "flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 border border-rose-100 dark:border-rose-800/50 animate-in fade-in duration-150")}>
                  <AlertCircle className="size-3.5 shrink-0" /> {pinError}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setPinStep("idle"); setPinError(""); setPinValues({ current: ["","","",""], next: ["","","",""], confirm: ["","","",""] }); }}
                  className={btn("ghost", "sm")}
                >
                  {t("set.sec.pin_cancel")}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!allFilled || pinLoading}
                  className={cn(btn("primary", "sm"), "dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:shadow-none dark:border dark:border-indigo-800/50 disabled:opacity-50")}
                >
                  {pinLoading
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : pinStep === "confirm" ? t("set.sec.pin_save") : t("set.sec.pin_next")
                  }
                </button>
              </div>
            </div>
          );
        })()}

        {pinStep === "done" && (
          <div className={cn(R.lg, "flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 px-4 py-3 animate-in slide-in-from-top-2 duration-200")}>
            <CheckCircle2 className={cn("size-4", C.success.icon)} />
            <span className={cn(T.label, "font-bold", C.success.text)}>{t("set.sec.pin_success")}</span>
            <button
              onClick={() => { setPinStep("idle"); setPinValues({ current: ["","","",""], next: ["","","",""], confirm: ["","","",""] }); }}
              className={cn("ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors", T.buttonSm)}
            >
              {t("set.sec.pin_reset")}
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
            <Monitor className="w-4 h-4 text-slate-400" /> {t("set.sec.sessions")}
          </h4>
          <p className={cn(T.caption, "text-slate-400 mt-0.5")}>{t("set.sec.sessions_desc")}</p>
        </div>
        <div className="space-y-2">
          {sessions.map((session, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-slate-400" />
                <div>
                  <p className={cn(T.label, "text-slate-900 dark:text-slate-200")}>{session.device}</p>
                  <p className={cn(T.caption, "text-slate-400")}>IP: {session.ip} · {session.lastActive}</p>
                </div>
              </div>
              {session.current ? (
                <span className={cn(T.micro, R.xs, C.success.bg, C.success.icon, "px-2 py-1 border border-emerald-100 dark:border-emerald-800/50")}>{t("set.sec.current")}</span>
              ) : (
                <button className={btn("destructiveSoft", "sm")}>{t("set.sec.revoke")}</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <h4 className={cn(T.h4, "text-slate-900 dark:text-slate-200 flex items-center gap-2")}>
            <History className="w-4 h-4 text-slate-400" /> {t("set.sec.login_history")}
          </h4>
          <button
            onClick={() => toast.success(t("set.sec.lh_exported"))}
            className={cn(T.buttonSm, R.md, "flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer")}
          >
            <Download className="size-3" /> {t("set.sec.lh_export")}
          </button>
        </div>

        {/* Suspicious alert */}
        {suspiciousCount > 0 && (
          <div className={cn(T.bodySm, R.md, "flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 animate-in fade-in duration-300")}>
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
            <div>
              <p className={T.label}>{t("set.sec.lh_suspicious")}</p>
              <p className="mt-0.5 opacity-80">{t("set.sec.lh_suspicious_desc", { count: suspiciousCount })}</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(["all", "success", "failed"] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => { setLhFilter(f); setLhLimit(5); }}
              className={cn(
                T.buttonSm, R.sm,
                "px-3 py-1.5 transition-all cursor-pointer",
                A11Y.focusRing.default,
                lhFilter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {f === "all" ? t("set.sec.lh_all") : f === "success" ? t("set.sec.login_success") : t("set.sec.login_failed")}
            </button>
          ))}
        </div>

        {/* Table */}
        <ResponsiveTable
          label={t("set.sec.login_history")}
          scrollerClassName={cn(R.lg, "border border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30")}
          minWidthClassName="min-w-[760px]"
        >
          <table className={TABLE.base} aria-label={t("set.sec.login_history")}>
            <thead className={TABLE.head}>
              <tr>
                {[t("set.sec.login_date"), t("set.sec.login_device"), t("set.sec.lh_location"), t("set.sec.login_ip"), t("set.sec.login_status")].map((h, index) => (
                  <th key={h} className={cn(TABLE.headCell, index === 0 && "sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={TABLE.body}>
              {visibleLogs.map((log) => (
                <tr key={`${log.date}-${log.ip}`} className={cn(TABLE.row, TABLE.rowHover, "group", !log.success && "bg-rose-50/30 dark:bg-rose-900/10")}>
                  <td className={cn(
                    TABLE.cell,
                    "sticky left-0 z-10 whitespace-nowrap",
                    T.dataSm,
                    log.success
                      ? "bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50"
                      : "bg-rose-50 dark:bg-rose-950/30 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20"
                  )}>{log.date}</td>
                  <td className={cn(TABLE.cell, T.bodySm, "font-bold text-slate-700 dark:text-slate-300")}>{log.device}</td>
                  <td className={cn(TABLE.cell, T.bodySm, "text-slate-500 dark:text-slate-400")}>{log.location}</td>
                  <td className={cn(TABLE.cell, T.code, "text-slate-400 dark:text-slate-500")}>{log.ip}</td>
                  <td className={TABLE.cell}>
                    <span className={cn("inline-flex items-center gap-1", T.caption, log.success ? C.success.icon : C.destructive.icon)}>
                      {log.success ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                      {log.success ? t("set.sec.login_success") : t("set.sec.login_failed")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Footer: count + load more */}
        <div className="flex items-center justify-between">
          <p className={cn(T.caption, "text-slate-400 dark:text-slate-500")}>
            {t("set.sec.lh_showing", { shown: visibleLogs.length, total: filteredLogs.length })}
          </p>
          {visibleLogs.length < filteredLogs.length && (
            <button
              type="button"
              onClick={() => setLhLimit(v => v + 5)}
              className={cn(T.buttonSm, "text-indigo-500 hover:underline cursor-pointer transition-colors", A11Y.focusRing.default)}
            >
              {t("set.sec.lh_show_more")}
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <div>
          <h4 className={cn(T.h4, "text-rose-600 flex items-center gap-2")}>
            <AlertTriangle className="w-4 h-4" /> {t("set.sec.danger")}
          </h4>
          <p className={cn(T.caption, "text-slate-400 mt-0.5")}>{t("set.sec.danger_desc")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={btn("destructiveSoft", "sm")}>
            <Trash2 className={ICON.sm} /> {t("set.sec.reset_data")}
          </button>
          <button className={btn("destructive", "sm")}>
            <Trash2 className={ICON.sm} /> {t("set.sec.delete_account")}
          </button>
        </div>
      </div>
    </div>
  );
});

const LogoutTab = memo(function LogoutTab({ t, onBack, onLogout }: { t: TFn; onBack: () => void; onLogout: () => Promise<void> }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center border border-rose-100 dark:border-rose-800/30">
        <LogOut className="w-10 h-10 text-rose-400" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>{t("set.logout.title")}</h3>
        <p className={cn(T.caption, "text-slate-400")}>{t("set.logout.desc")}</p>
      </div>

      {/* Session Info */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 w-full max-w-xs space-y-2">
        <div className="flex justify-between">
          <span className={cn(T.label, "text-slate-400")}>{t("set.logout.session_info")}</span>
          <span className={cn(T.dataSm, "font-bold text-slate-600 dark:text-slate-400")}>21 Apr 2026, 22:58</span>
        </div>
        <div className="flex justify-between">
          <span className={cn(T.label, "text-slate-400")}>{t("set.logout.last_activity")}</span>
          <span className={cn(T.caption, "font-bold text-slate-600 dark:text-slate-400")}>Baru saja</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onBack} className={btn("neutralSoft", "md")}>
          {t("set.logout.cancel")}
        </button>
        <button onClick={() => onLogout()} className={cn(btn("destructive", "md"), "shadow-lg shadow-rose-100/50")}>
          <LogOut className={ICON.sm} /> {t("set.logout.confirm")}
        </button>
      </div>
    </div>
  );
});
