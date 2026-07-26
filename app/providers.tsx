"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppHeader } from "@/components/layout/AppHeader";
import { TooltipProvider } from "@/components/ui/tooltip";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <AppHeader />
      <main className="flex-1">{children}</main>
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
