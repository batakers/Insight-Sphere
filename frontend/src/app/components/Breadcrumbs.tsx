"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { routes } from "@/app/routes";
import { useTranslation } from "@/app/i18n";
import { T } from "@/app/lib/typography";
import { cn } from "@/app/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  // Split path into segments, filtering out empty strings
  const segments = pathname.split("/").filter(Boolean);
  
  // Helper to get label from routes
  const getLabel = (path: string) => {
    // If it's the root or dashboard
    if (path === "" || path === "/") return "InsightSphere";
    
    // Find in routes mapping
    const fullPath = `/${path}`;
    const route = routes.find(r => r.path === fullPath);
    if (route) return t(route.labelKey);
    
    // Fallback: Capitalize
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  return (
    <nav className="flex min-w-0 items-center gap-2 text-slate-400 font-medium" aria-label="Breadcrumb">
      {/* Root / Home */}
      <Link 
        href="/"
        className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-slate-900 dark:hover:text-slate-100 group cursor-pointer"
      >
        <span className={cn(T.h3, "truncate text-slate-900 dark:text-slate-100")}>InsightSphere</span>
      </Link>

      {/* Dynamic Segments */}
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = getLabel(segment);

        return (
          <div key={path} className="hidden min-w-0 items-center gap-2 sm:flex">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {isLast ? (
              <span className={cn(T.body, "max-w-[150px] truncate font-bold text-slate-600 dark:text-slate-300")}>
                {label}
              </span>
            ) : (
              <Link
                href={path}
                className={cn(T.body, "max-w-[150px] truncate transition-colors hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer")}
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}

      {/* Desktop Only Page Label for Single Segments (e.g. Dashboard) */}
      {segments.length === 0 && (
         <div className="hidden items-center gap-2 sm:flex">
           <ChevronRight className="w-4 h-4 text-slate-300" />
           <span className={cn(T.label, "text-slate-600 dark:text-slate-300")}>{t("nav.dashboard")}</span>
         </div>
      )}
    </nav>
  );
}
