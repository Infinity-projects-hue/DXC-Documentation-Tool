"use client";

import type { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { DxcLogo } from "@/components/brand/DxcLogo";

export function AppHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-slate-800 bg-[#07090d]/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex min-h-[82px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
            className="flex h-[58px] w-[176px] shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#f4f1eb] px-3 py-2 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.8)]"
          >
            <DxcLogo className="h-auto w-full object-contain" />
          </motion.div>

          <div className="hidden h-10 w-px bg-slate-800 sm:block" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
              Support operations console
            </p>
            <p className="mt-1 truncate text-sm font-semibold tracking-tight text-white sm:text-[15px]">
              AI Interaction Analyzer
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <HeaderStatus icon={ShieldCheck}>Transcript grounded</HeaderStatus>
          <HeaderStatus icon={FileCheck2}>ITSM ready</HeaderStatus>
        </div>
      </div>
    </motion.header>
  );
}

function HeaderStatus({ icon: Icon, children }: { icon: ElementType; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0b1018] px-3 py-2 text-[11px] font-medium text-slate-400">
      <Icon className="h-3.5 w-3.5 text-blue-300" strokeWidth={1.8} />
      {children}
    </span>
  );
}
