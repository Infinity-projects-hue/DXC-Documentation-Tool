"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ScanText } from "lucide-react";
import { InputCard } from "@/components/documentation/InputCard";
import { OutputCards } from "@/components/documentation/OutputCards";

export default function HomeWorkspacePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden bg-[#f3efea]">
      <ReferenceGradientBackground reducedMotion={Boolean(reduceMotion)} />

      <section className="relative z-10 mx-auto w-full max-w-[1680px] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mb-8 max-w-4xl lg:mb-10"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ddd4cb] bg-white/70 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_12px_32px_-24px_rgba(25,38,67,0.28)] backdrop-blur-xl">
            <ScanText className="h-3.5 w-3.5 text-[#f08e56]" />
            Support interaction intelligence
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-slate-900 sm:text-5xl lg:text-[64px]">
            AI Interaction <span className="bg-[linear-gradient(135deg,#5c8ff3_0%,#f7944d_52%,#8e8fe2_100%)] bg-clip-text text-transparent">Analyzer</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Paste the complete support conversation from the opening greeting through the closing statement. The analyzer ignores small talk, repeated dialogue, and closing messages, then extracts only the Issue, troubleshooting performed, technical Output, and Resolution Notes.
          </p>
        </motion.div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <InputCard />
          <OutputCards />
        </div>
      </section>
    </div>
  );
}

function ReferenceGradientBackground({ reducedMotion }: { reducedMotion: boolean }) {
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 20, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f6f2ed_0%,#f2ece7_100%)]" />
      <div className="absolute inset-0 opacity-[0.28] [background-image:radial-gradient(circle_at_14%_34%,rgba(248,159,87,0.28),transparent_22%),radial-gradient(circle_at_66%_30%,rgba(114,146,243,0.22),transparent_18%),radial-gradient(circle_at_54%_72%,rgba(245,149,88,0.22),transparent_18%),radial-gradient(circle_at_78%_34%,rgba(142,143,226,0.16),transparent_16%)]" />

      <motion.div
        className="absolute left-[-10%] top-[22%] h-[420px] w-[88%] rounded-[42px] bg-[radial-gradient(circle_at_14%_46%,rgba(248,165,94,0.86),rgba(244,138,107,0.78)_28%,rgba(160,138,207,0.42)_52%,rgba(92,143,243,0.82)_78%,rgba(145,207,219,0.38)_100%)] blur-[38px] opacity-75"
        animate={reducedMotion ? undefined : { x: [0, 26, 0], y: [0, -10, 0], scale: [1, 1.02, 1] }}
        transition={transition}
      />

      <motion.div
        className="absolute left-[18%] bottom-[-14%] h-[280px] w-[44%] rounded-[46%] bg-[radial-gradient(circle_at_50%_40%,rgba(247,165,77,0.86),rgba(247,148,77,0.52)_56%,transparent_74%)] blur-[56px] opacity-80"
        animate={reducedMotion ? undefined : { x: [0, 24, 0], y: [0, -18, 0] }}
        transition={{ ...transition, duration: 23 }}
      />

      <motion.div
        className="absolute right-[3%] top-[26%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle_at_center,rgba(92,143,243,0.58),rgba(147,205,219,0.24)_58%,transparent_78%)] blur-[34px] opacity-75"
        animate={reducedMotion ? undefined : { x: [0, -18, 0], y: [0, 16, 0] }}
        transition={{ ...transition, duration: 17 }}
      />
    </div>
  );
}
