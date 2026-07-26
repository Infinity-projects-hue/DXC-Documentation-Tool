"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f3efea] transition-colors duration-300 dark:bg-[#11141b]">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="dxc-documentation-theme"
    >
      <TooltipProvider delayDuration={180}>
        <AppShell>{children}</AppShell>
      </TooltipProvider>
    </ThemeProvider>
  );
}
