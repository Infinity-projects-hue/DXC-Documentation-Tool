"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DxcLogo } from "@/components/brand/DxcLogo";

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-slate-900/8 bg-[#f5f0ea]/82 backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#11141b]/86"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <motion.div
            whileHover={{ y: -1, scale: 1.01 }}
            transition={{ duration: 0.22 }}
            className="relative flex h-12 items-center rounded-2xl border border-white/70 bg-white/78 px-4 shadow-[0_14px_34px_-24px_rgba(25,38,67,0.25)] dark:border-white/12 dark:bg-white/[0.07]"
          >
            <DxcLogo className="h-8 w-auto" />
          </motion.div>

          <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-white/15 sm:block" />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[15px]">
              AI Interaction Analyzer
            </p>
            <p className="hidden truncate text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              Premium support documentation workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          disabled={!mounted}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(135deg,rgba(92,143,243,0.14),rgba(247,148,77,0.16),rgba(155,136,214,0.16))] text-slate-700 shadow-[0_10px_26px_-18px_rgba(92,143,243,0.6)] transition hover:scale-105 hover:border-[#d3ccc5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5c8ff3]/45 disabled:cursor-wait dark:border-white/12 dark:bg-[linear-gradient(135deg,rgba(92,143,243,0.22),rgba(247,148,77,0.18),rgba(155,136,214,0.2))] dark:text-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "sun" : "moon"}
              initial={{ opacity: 0, rotate: -35, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 35, scale: 0.75 }}
              transition={{ duration: 0.18 }}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </motion.header>
  );
}
