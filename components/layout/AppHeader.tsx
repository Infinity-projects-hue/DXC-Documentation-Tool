"use client";

import { motion } from "framer-motion";
import { LockKeyhole, Sparkles } from "lucide-react";
import { DxcLogo } from "@/components/brand/DxcLogo";

export function AppHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070a11]/75 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3.5">
          <motion.div
            whileHover={{ rotateY: 7, scale: 1.025 }}
            transition={{ duration: 0.25 }}
            className="relative flex h-11 w-[116px] shrink-0 items-center rounded-2xl border border-white/10 bg-white/[0.045] px-3 shadow-[0_12px_30px_-18px_rgba(59,130,246,0.75)] [perspective:500px]"
          >
            <div aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
            <DxcLogo className="h-8 w-auto" />
          </motion.div>
          <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white sm:text-[15px]">AI Interaction Analyzer</p>
            <p className="hidden truncate text-[11px] text-slate-500 sm:block">Enterprise support documentation</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[11px] font-medium text-slate-400 md:flex">
            <LockKeyhole className="h-3.5 w-3.5 text-emerald-300" />
            Transcript-grounded output
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-orange-400/15">
            <Sparkles className="h-4 w-4 text-orange-200" strokeWidth={1.7} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
