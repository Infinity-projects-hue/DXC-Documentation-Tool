"use client";

import type { ReactNode } from "react";
import { DxcLogo } from "@/components/brand/DxcLogo";
import { AppHeader } from "@/components/layout/AppHeader";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#07090d]">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-800 bg-[#06080c]">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-[68px] w-[202px] shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#f4f1eb] px-3 py-2">
              <DxcLogo className="h-auto w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                Interaction documentation system
              </p>
              <p className="mt-1 text-sm text-slate-500">Work Notes and Resolution Notes only.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">Transcript-grounded output for IT service management workflows.</p>
        </div>
      </footer>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <TooltipProvider delayDuration={180}>
        <AppShell>{children}</AppShell>
      </TooltipProvider>
    </ThemeProvider>
  );
}
