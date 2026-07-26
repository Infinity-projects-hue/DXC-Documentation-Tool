"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileCheck2, ScanText, ShieldCheck } from "lucide-react";
import { InputCard } from "@/components/documentation/InputCard";
import { OutputCards } from "@/components/documentation/OutputCards";

export default function HomeWorkspacePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate min-h-[calc(100vh-82px)] overflow-hidden bg-[#07090d]">
      <OperationsBackground reducedMotion={Boolean(reduceMotion)} />

      <section className="relative z-10 mx-auto w-full max-w-[1680px] px-4 pb-12 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-8 grid gap-6 border-b border-slate-800 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
              DXC / Support documentation engine
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-[62px]">
              AI Interaction Analyzer
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Convert customer interactions into clear Work Notes and Resolution Notes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <StatusBlock icon={ShieldCheck} code="01">Transcript grounded</StatusBlock>
            <StatusBlock icon={FileCheck2} code="02">ServiceNow ready</StatusBlock>
            <StatusBlock icon={ScanText} code="03">Two outputs only</StatusBlock>
          </div>
        </motion.div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <InputCard />
          <OutputCards />
        </div>
      </section>
    </div>
  );
}

function StatusBlock({ icon: Icon, code, children }: { icon: ElementType; code: string; children: ReactNode }) {
  return (
    <div className="grid min-w-[190px] grid-cols-[30px_1fr] items-center gap-3 rounded-xl border border-slate-800 bg-[#0a0f17] px-3 py-2.5">
      <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-slate-600">{code}</span>
      <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5 text-blue-300" strokeWidth={1.8} />
        {children}
      </span>
    </div>
  );
}

function OperationsBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07090d_0%,#080b11_55%,#07090d_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(148,163,184,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.32)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />

      <motion.div
        className="absolute -left-36 top-28 h-px w-[48rem] origin-left bg-gradient-to-r from-blue-400/0 via-blue-400/40 to-transparent"
        animate={reducedMotion ? undefined : { scaleX: [0.75, 1, 0.75], opacity: [0.3, 0.75, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-36 top-[22rem] h-px w-[44rem] origin-right bg-gradient-to-l from-orange-400/0 via-orange-400/35 to-transparent"
        animate={reducedMotion ? undefined : { scaleX: [1, 0.72, 1], opacity: [0.25, 0.65, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute left-[7%] top-[18%] h-36 w-36 border-l border-t border-blue-400/10" />
      <div className="absolute bottom-[12%] right-[8%] h-44 w-44 border-b border-r border-orange-400/10" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_-30%,rgba(59,130,246,0.12),transparent_55%)]" />
    </div>
  );
}
