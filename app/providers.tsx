"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppHeader } from "@/components/layout/AppHeader";
import { TooltipProvider } from "@/components/ui/tooltip";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-5">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-3 px-4 md:flex-row md:items-center md:px-8">
          <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
            <span className="relative inline-flex h-6 shrink-0 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-sky-500 via-orange-500 to-violet-500" />
            </span>
            <span>
              &copy; {new Date().getFullYear()} DXC Technology — Service Desk
              Documentation Assistant. IMPOSSIBLE. DELIVERED.
            </span>
          </div>
          <span className="text-[11.5px] text-muted-foreground">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <TooltipProvider delayDuration={200}>
        <AppShell>{children}</AppShell>
      </TooltipProvider>
    </ThemeProvider>
  );
}
