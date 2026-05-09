"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SkipLink } from "./SkipLink";
import { Header } from "./Header";
import { ErrorBoundary } from "./ErrorBoundary";
import { RouteGuard } from "./RouteGuard";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Z } from "@/app/lib/elevation";
import { BACKDROP } from "@/app/lib/utility";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  
  const isLoginPage = pathname.includes("/login");

  // If on login page, render simplified layout
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
        <RouteGuard>{children}</RouteGuard>
      </div>
    );
  }

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <SkipLink />
      <RouteGuard>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className={cn("fixed inset-0 lg:hidden", Z.overlay)}>
            <div
              className={cn("absolute inset-0 transition-opacity duration-300", BACKDROP.sm, "bg-slate-900/60")}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative h-full w-[252px] animate-in slide-in-from-left duration-300 ease-out shadow-2xl overflow-hidden">
              <Sidebar />
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 text-slate-900 dark:text-slate-100">
            <div className="mx-auto max-w-[1920px] w-full">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </RouteGuard>
    </div>
  );
}
