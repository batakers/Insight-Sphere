"use client";

import { cn } from "@/app/lib/utils";
import { Z } from "@/app/lib/elevation";

export function LoadingBar({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className={cn("fixed top-0 left-0 right-0 h-0.5 bg-indigo-100 overflow-hidden animate-in fade-in duration-150", Z.toast)}>
      <div
        className="h-full w-1/2 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)] animate-pulse"
      />
    </div>
  );
}
