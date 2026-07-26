"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DxcLogo } from "@/components/brand/DxcLogo";
import { cn } from "@/lib/utils";

export interface AppHeaderProps {
  onToggleHistory?: () => void;
  historyOpen?: boolean;
}

export function AppHeader({ onToggleHistory, historyOpen = true }: AppHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="glass-header sticky top-0 z-40 w-full border-b border-border/60"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-3 px-3 md:h-[72px] md:px-5">
        {/* Left: History toggle + Logo + Tagline */}
        <div className="flex min-w-0 items-center gap-2.5 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 transition-all duration-200 hover:bg-accent/20 hover:shadow-md md:h-11 md:w-11",
              historyOpen &&
                "bg-gradient-to-br from-sky-500/10 via-white to-orange-500/10 ring-1 ring-[#2E6BE6]/30 shadow-[0_0_0_1px_rgba(46,107,230,0.08)]",
            )}
            onClick={onToggleHistory}
            aria-label={historyOpen ? "Close History" : "Open History"}
            title={historyOpen ? "Close History sidebar" : "Open History sidebar"}
          >
            <PanelLeft
              className={cn(
                "h-[18px] w-[18px] md:h-5 md:w-5 transition-transform duration-200",
                historyOpen ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground",
              )}
              strokeWidth={2}
            />
            {historyOpen && (
              <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 rounded-full bg-gradient-to-br from-orange-500 to-violet-500 shadow-[0_0_0_1px_rgba(255,255,255,0.7)]" />
            )}
          </Button>

          <div className="flex items-center gap-3 md:gap-3.5">
            <div className="flex items-center gap-2.5 md:gap-3">
              <DxcLogo className="h-8 w-auto md:h-[38px]" />
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-border/80 to-transparent" />
              <div className="flex flex-col leading-tight">
                <span className="text-[14px] font-semibold tracking-tight md:text-[15px]">
                  AI Service Desk{" "}
                  <span className="text-gradient-dxc">Documentation Assistant</span>
                </span>
                <span className="text-[10.5px] text-muted-foreground md:text-[11.5px]">
                  Convert chats · tickets · transcripts to ITSM notes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI status + Theme toggle + Avatar */}
        <div className="flex items-center justify-end gap-2 md:gap-2.5">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-2.5 py-1.5 text-[11.5px] font-medium text-emerald-700 shadow-sm dark:text-emerald-300 md:inline-flex">
            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span className="font-semibold">AI Ready</span>
            <span className="text-emerald-600/70 dark:text-emerald-300/70">
              · GPT-5.5
            </span>
          </div>

          <ThemeToggle />

          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-1.5 py-1.5 shadow-sm backdrop-blur">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-[#FF7A1A] to-violet-500 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.15)] md:h-9 md:w-9">
              DX
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
