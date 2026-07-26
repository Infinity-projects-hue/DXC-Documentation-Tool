"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppHeader } from "@/components/layout/AppHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const HistoryShellContext = React.createContext<{
  historyOpen: boolean;
  toggleHistory: () => void;
  setHistoryOpen: (v: boolean) => void;
}>({
  historyOpen: true,
  toggleHistory: () => {},
  setHistoryOpen: () => {},
});

export function useHistoryShell() {
  return React.useContext(HistoryShellContext);
}

function AppShell({ children }: { children: ReactNode }) {
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const toggleHistory = React.useCallback(
    () => setHistoryOpen((v) => !v),
    [],
  );
  const value = React.useMemo(
    () => ({ historyOpen, toggleHistory, setHistoryOpen }),
    [historyOpen, toggleHistory],
  );

  return (
    <HistoryShellContext.Provider value={value}>
      <div className="relative flex min-h-screen flex-col">
        <AppHeader
          onToggleHistory={toggleHistory}
          historyOpen={historyOpen}
        />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/60 py-5">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-3 px-4 md:flex-row md:items-center md:px-8">
            <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
              <span className="relative inline-flex h-6 shrink-0 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-sky-500 via-orange-500 to-violet-500" />
              </span>
              <span>
                &copy; {new Date().getFullYear()} DXC Technology — AI Service
                Desk Documentation Assistant. IMPOSSIBLE. DELIVERED.
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                AI Ready
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </HistoryShellContext.Provider>
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
