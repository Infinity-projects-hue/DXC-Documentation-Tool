"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { DxcLogo } from "@/components/brand/DxcLogo";

export function AppHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-slate-900/8 bg-[#f5f0ea]/82 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <motion.div
            whileHover={{ y: -1, scale: 1.01 }}
            transition={{ duration: 0.22 }}
            className="relative flex h-12 items-center rounded-2xl border border-white/70 bg-white/78 px-4 shadow-[0_14px_34px_-24px_rgba(25,38,67,0.25)]"
          >
            <DxcLogo className="h-8 w-auto" />
          </motion.div>

          <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent sm:block" />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-[15px]">
              AI Interaction Analyzer
            </p>
            <p className="hidden truncate text-[11px] text-slate-500 sm:block">
              Premium support documentation workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-full border border-[#d9d3cf] bg-white/70 px-3.5 py-2 text-[11px] font-medium text-slate-600 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#f28c54]" />
            Transcript-grounded output
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(135deg,rgba(92,143,243,0.14),rgba(247,148,77,0.16),rgba(155,136,214,0.16))] shadow-[0_10px_26px_-18px_rgba(92,143,243,0.6)]">
            <Sparkles className="h-4 w-4 text-slate-700" strokeWidth={1.7} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
