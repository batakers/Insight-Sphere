"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Trash2, 
  CheckCheck, 
  Share2, 
  Zap,
  ShieldAlert,
  BarChart3,
  Lightbulb,
  Settings,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { C } from "@/app/lib/colors";
import { R } from "@/app/lib/radii";
import { Z } from "@/app/lib/elevation";
import Link from "next/link";
import { ExportShareModal, ShareData } from "./ExportShareModal";
import { useTranslation } from "@/app/i18n";
import { useEscapeClose } from "@/app/hooks/useEscapeClose";

// --- Types ---

type Urgency = "tinggi" | "sedang" | "rendah";
type NotifType = "anomali" | "kritis" | "prediksi" | "peluang" | "sistem";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  urgency: Urgency;
  isRead: boolean;
  link?: string;
  linkText?: string;
}

// --- Initial Data ---

/* ── Fix #4: moved to module level so useEffect([], []) closure is always fresh ── */
const POLL_NOTIFICATIONS: Notification[] = [
  { id: "", type: "anomali", title: "Anomali Baru: Lonjakan Aqua 500ml", message: "Permintaan naik 60% tiba-tiba. Deteksi event di sekitar Bandara.", time: "", urgency: "tinggi", isRead: false, link: "/prediksi-stok", linkText: "Cek Prediksi" },
  { id: "", type: "kritis", title: "Stok Kritis: Tinta Epson 003", message: "Sisa stok 2 unit. Segera lakukan reorder sebelum kehabisan.", time: "", urgency: "tinggi", isRead: false, link: "/inventaris", linkText: "Reorder" },
  { id: "", type: "prediksi", title: "Prediksi Diperbarui: Minggu Depan", message: "Model merevisi forecast +12% untuk kategori ATK. Periksa dashboard.", time: "", urgency: "sedang", isRead: false, link: "/prediksi-stok", linkText: "Lihat Forecast" },
  { id: "", type: "peluang", title: "Peluang: Cross-sell Kertas + Tinta", message: "Korelasi pembelian 68% terdeteksi. Pertimbangkan bundling promo.", time: "", urgency: "rendah", isRead: false, link: "/penjelasan-ai", linkText: "Detail" },
];

const MAX_NOTIFICATIONS = 20;

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "anomali", title: "Anomali: Penjualan Chitato naik 45%", message: "Analisis AI menunjukkan efek promo bundling dengan Minyak Goreng.", time: "5 menit lalu", urgency: "tinggi", isRead: false, link: "/penjelasan-ai", linkText: "Lihat XAI" },
  { id: "2", type: "kritis", title: "3 Produk Butuh Restok", message: "Beras Premium, Roti Tawar, dan Sabun Cair mendekati stok nol.", time: "12 menit lalu", urgency: "tinggi", isRead: false, link: "/inventaris", linkText: "Buka Inventaris" },
  { id: "3", type: "prediksi", title: "Model AI Diperbarui", message: "Akurasi prediksi retail naik dari 93.1% ke 94.3% setelah retraining.", time: "1 jam lalu", urgency: "sedang", isRead: true },
  { id: "4", type: "peluang", title: "Peluang: Bundling Beras + Minyak", message: "Terdapat korelasi 72% pembelian bersama di Cabang Pusat.", time: "2 jam lalu", urgency: "rendah", isRead: true, link: "/penjelasan-ai", linkText: "Detail Peluang" },
  { id: "5", type: "anomali", title: "Model Drift: Kategori Dairy", message: "Akurasi kategori Susu turun 5%. Perlu penyesuaian parameter.", time: "3 jam lalu", urgency: "sedang", isRead: true, link: "/pengaturan/ai", linkText: "Cek Config" },
  { id: "6", type: "sistem", title: "Laporan Mingguan Siap", message: "Laporan periode 7-14 Apr 2026 telah digenerate secara otomatis.", time: "5 jam lalu", urgency: "rendah", isRead: true, link: "/laporan", linkText: "Unduh PDF" },
  { id: "7", type: "kritis", title: "Overstock: Susu Ultra 1L", message: "120 unit mendekati masa kadaluarsa dalam 5 hari ke depan.", time: "6 jam lalu", urgency: "tinggi", isRead: true, link: "/inventaris", linkText: "Tindak Lanjuti" },
];

export function NotificationCenter() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [newNotifPing, setNewNotifPing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNotifForShare, setSelectedNotifForShare] = useState<ShareData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEscapeClose({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef: bellRef,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Logic ---

  const [lastPolled, setLastPolled] = useState<Date>(new Date());
  const pollCountRef = useRef(0);
  const pingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const POLL_INTERVAL_MS = 30_000;

    const poll = () => {
      /* Fix #1: respect isMuted — skip prepend + ping when muted */
      if (isMuted) return;

      const template = POLL_NOTIFICATIONS[pollCountRef.current % POLL_NOTIFICATIONS.length];
      const newNotif: Notification = {
        ...template,
        id: `poll-${Date.now()}`,
        time: "__just_now__",
      };
      pollCountRef.current += 1;
      /* Fix #3: cap list at MAX_NOTIFICATIONS */
      setNotifications(prev => [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS));
      setLastPolled(new Date());
      setNewNotifPing(true);
      /* Fix #2: store timer ref so it can be cleaned up */
      if (pingTimerRef.current) clearTimeout(pingTimerRef.current);
      pingTimerRef.current = setTimeout(() => setNewNotifPing(false), 3000);
    };

    const timer = setTimeout(poll, 8000);
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      /* Fix #2: clean up ping timer on unmount */
      if (pingTimerRef.current) clearTimeout(pingTimerRef.current);
    };
  }, [isMuted]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  const removeNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const handleShare = (n: Notification) => {
    setSelectedNotifForShare({
      title: n.title,
      type: "insight",
      content: n.message,
      urgency: n.urgency
    });
    setShareModalOpen(true);
  };

  const filters = [
    { label: t("notif.filter.all"), id: "Semua" },
    { label: t("notif.filter.unread"), id: "Belum Dibaca" },
    { label: t("notif.filter.anomaly"), id: "Anomali" },
    { label: t("notif.filter.critical"), id: "Kritis" }
  ];

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Belum Dibaca") return !n.isRead;
    if (activeFilter === "Anomali") return n.type === "anomali";
    if (activeFilter === "Kritis") return n.type === "kritis";
    return true;
  });

  const getUrgencyColor = (u: Urgency) => {
    if (u === "tinggi") return "bg-rose-500";
    if (u === "sedang") return "bg-amber-500";
    return "bg-slate-300";
  };

  const getIcon = (type: NotifType) => {
    switch (type) {
      case "anomali": return <Zap className={cn("w-4 h-4", C.warning.icon)} />;
      case "kritis": return <ShieldAlert className={cn("w-4 h-4", C.destructive.icon)} />;
      case "prediksi": return <BarChart3 className={cn("w-4 h-4", C.primary.icon)} />;
      case "peluang": return <Lightbulb className={cn("w-4 h-4", C.success.icon)} />;
      case "sistem": return <Settings className="w-4 h-4 text-slate-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${t("notif.title")}${unreadCount > 0 ? `, ${unreadCount} ${t("notif.filter.unread").toLowerCase()}` : ""}`}
        className={cn(
          "relative h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 transition-all group",
          newNotifPing && "animate-bounce"
        )}
      >
        <Bell className={cn(
          "w-5 h-5 transition-colors", 
          unreadCount > 0 ? "text-indigo-600" : "text-slate-500",
          isOpen && "text-indigo-600"
        )} />
        
        {/* Fix #6: show numeric badge when count ≤ 9, dot when > 9 */}
        {unreadCount > 0 && (
          unreadCount <= 9 ? (
            <span className={cn(
              T.label,
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white text-white leading-none",
              notifications.some(n => n.type === "anomali" && !n.isRead) ? "bg-rose-500" : "bg-indigo-600",
              newNotifPing && "animate-ping"
            )}>{unreadCount}</span>
          ) : (
            <span className={cn(
              T.caption,
              "absolute -top-1 -right-1 w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white font-bold text-white leading-none",
              "bg-rose-500"
            )}>9+</span>
          )
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className={cn("fixed left-4 right-4 top-16 max-h-[calc(100dvh-5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-4 sm:w-[440px] sm:max-h-[700px] sm:rounded-3xl", Z.dropdown, "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150")}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                     <h3 className={cn(T.h4, "text-slate-900 dark:text-slate-100")}>{t("notif.header")}</h3>
                     <span className={cn(T.micro, "px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg")}>{unreadCount} {t("notif.new")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setIsMuted(!isMuted)}
                       aria-label={isMuted ? t("notif.unmute") : t("notif.mute")}
                       aria-pressed={isMuted}
                       className="p-2.5 text-slate-400 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg transition-colors"
                     >
                        {isMuted
                          ? <VolumeX className="w-5 h-5" aria-hidden="true" />
                          : <Volume2 className="w-5 h-5" aria-hidden="true" />}
                     </button>
                     <button 
                       onClick={markAllRead}
                       aria-label={t("notif.mark.all")}
                       title={t("notif.mark.all")}
                       className="p-2 text-slate-400 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg transition-colors"
                     >
                        <CheckCheck className="w-5 h-5" aria-hidden="true" />
                     </button>
                  </div>
               </div>

               {/* Filters */}
               <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                  {filters.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={cn(
                        T.buttonSm,
                        "flex-1 py-2 rounded-xl transition-all",
                        activeFilter === f.id ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto no-scrollbar flex-1 bg-white dark:bg-slate-900">
               {filteredNotifs.length > 0 ? (
                 <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredNotifs.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "px-5 py-4 transition-colors group relative flex gap-3",
                          !n.isRead && "bg-indigo-50/20 dark:bg-indigo-900/10"
                        )}
                      >
                         {/* Icon Box */}
                         <div className="shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                            {getIcon(n.type)}
                         </div>

                         {/* Text Content */}
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <h4 className={cn(T.bodyEmphasis, "text-slate-900 dark:text-slate-100 leading-tight")}>{n.title}</h4>
                                  {!n.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full" />}
                               </div>
                               <button 
                                 onClick={() => removeNotif(n.id)}
                                 aria-label={t("notif.delete")}
                                 className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                               >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                               </button>
                            </div>
                            <p className={cn("text-slate-500 line-clamp-2 leading-relaxed", T.caption)}>{n.message}</p>
                            
                            <div className="flex items-center justify-between pt-2">
                               <div className="flex items-center gap-3">
                                  <span className={cn("font-bold text-slate-400", T.label)}>
                                    {n.time === "__just_now__" ? t("notif.just_now") : n.time}
                                  </span>
                                  <span className={cn(
                                    T.micro, "px-2 py-1 text-white",
                                    R.xl,
                                    getUrgencyColor(n.urgency)
                                  )}>
                                     {t(`notif.urgency.${n.urgency}`)}
                                  </span>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                  {n.link && (
                                    <Link 
                                      href={n.link}
                                      onClick={() => { toggleRead(n.id); setIsOpen(false); }}
                                      className={cn(T.buttonSm, "flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800 rounded-xl transition-all")}
                                    >
                                       {n.linkText || "View"} <ChevronRight className="w-3 h-3" />
                                    </Link>
                                  )}
                                  <button 
                                    onClick={() => handleShare(n)}
                                    aria-label={t("notif.share")}
                                    className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                                  >
                                     <Share2 className="w-4 h-4" aria-hidden="true" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-20 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                       <Bell className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className={cn(T.body, "font-bold text-slate-900 dark:text-slate-100")}>{t("notif.empty")}</p>
                    <p className={cn("font-medium text-slate-400 mt-2", T.label)}>{t("notif.empty.desc")}</p>
                 </div>
               )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between sticky bottom-0 z-10">
               <p className={cn(T.caption, "text-slate-400 flex items-center gap-2")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("notif.polling")} · {lastPolled.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
               </p>
               <Link 
                 href="/pengaturan" 
                 onClick={() => setIsOpen(false)}
                 className={cn(T.buttonSm, "text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5")}
               >
                  {t("notif.settings")} <ChevronRight className="w-3 h-3" />
               </Link>
            </div>
        </div>
      )}

      {selectedNotifForShare && (
        <ExportShareModal 
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          data={selectedNotifForShare}
        />
      )}
    </div>
  );
}
