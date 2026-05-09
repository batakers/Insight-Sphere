"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  User as UserIcon,
} from "lucide-react";
import { routes } from "@/app/routes";
import { useTranslation } from "@/app/i18n";
import { useAuth, type UserRole } from "@/app/context/AuthContext";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { C } from "@/app/lib/colors";
import { ICON } from "@/app/lib/spacing";

const SIDEBAR_KEY = "sidebar_collapsed";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, role, actualRole, switchView } = useAuth();

  const isAdmin = actualRole === "admin" || actualRole === "owner";

  // Filter routes based on user role
  const filteredRoutes = routes.filter(route => 
    !route.allowedRoles || (route.allowedRoles as readonly UserRole[]).includes(role)
  );

  const roleAvatarClass =
    actualRole === "owner" ? C.roleOwner.avatar :
    actualRole === "admin" ? C.roleAdmin.avatar :
    actualRole === "inventory_manager" ? C.roleInventory.avatar :
    C.roleCashier.avatar;

  return (
    <aside
      className={cn(
        "h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-14 border-b border-slate-800 shrink-0">
        <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Boxes className={cn(ICON.lg, "text-white")} />
        </div>
        {!collapsed && (
          <span className={cn(T.h2, "text-white animate-in fade-in duration-300")}>
            InsightSphere
          </span>
        )}
      </div>

      {/* Navigation section */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {filteredRoutes.map((item) => {
          const Icon = item.icon;
          // Exact match for root, prefix for others
          const isActive = item.path === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-slate-700/60 text-white shadow-sm ring-1 ring-white/5" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <div className="shrink-0 w-6 flex justify-center">
                <Icon className={cn(
                  ICON.lg,
                  "transition-transform duration-300",
                  isActive ? "text-white scale-110" : "group-hover:scale-110"
                )} />
              </div>
              {!collapsed && (
                <span className={cn(T.buttonLg, "truncate animate-in fade-in slide-in-from-left-2 duration-300")}>
                  {t(`nav.${item.id}`)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Mirror Mode Control */}
      {!collapsed && isAdmin && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex items-center gap-2 text-emerald-500">
              <Eye className={ICON.md} />
              <span className={T.label}>{t("nav.mirror.mode")}</span>
           </div>
           
           <div className="grid grid-cols-3 gap-1.5">
              {(["owner", "inventory_manager", "cashier"] as const).map((r) => (
                 <button
                    key={r}
                    onClick={() => switchView(r)}
                    className={cn(
                       T.buttonSm,
                       "px-1.5 py-2 rounded-lg transition-all",
                       role === r 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    )}
                 >
                    {r === "owner" ? "Owner" : r === "inventory_manager" ? "Inv." : "Kasir"}
                 </button>
              ))}
           </div>

           {role !== "admin" && (
             <button
                onClick={() => switchView("admin")}
                className={cn(T.buttonSm, "w-full py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2")}
             >
                <EyeOff className={ICON.xs} />
                {t("nav.mirror.exit")}
             </button>
           )}
        </div>
      )}

      {/* User Profile */}
      <div className="px-3 pt-3 pb-2 border-t border-slate-800">
        <Link
          href="/pengaturan"
          className={cn(
            "flex items-center gap-3 rounded-lg transition-all group",
            pathname.startsWith("/pengaturan")
              ? "bg-slate-700/60 ring-1 ring-white/5"
              : "hover:bg-slate-800",
            collapsed ? "justify-center p-1.5" : "p-2"
          )}
          title={user?.name || "Profile"}
        >
          <div className={cn(
            "size-9 rounded-lg flex items-center justify-center border shadow-sm shrink-0 group-hover:shadow-md transition-all",
            roleAvatarClass
          )}>
            <UserIcon className={ICON.lg} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300 min-w-0">
              <p className={cn(T.bodySm, "text-white font-bold leading-tight truncate")}>{user?.name || "User"}</p>
              <p className={cn(T.caption, "font-bold text-slate-500 uppercase tracking-wider leading-none mt-0.5 truncate")}>{actualRole ?? role}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Footer / Toggle section */}
      <div className="p-3">
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="w-full h-10 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className={ICON.lg} />
              <span className={cn(T.buttonSm, "text-slate-500 animate-in fade-in duration-300")}>{t("nav.collapse")}</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
