"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BadgeCheck, ScanText, ShieldCheck } from "lucide-react";
import { InputCard } from "@/components/documentation/InputCard";
import { OutputCards } from "@/components/documentation/OutputCards";

export default function HomeWorkspacePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-[#070a11]">
      <CinematicBackground reducedMotion={Boolean(reduceMotion)} />

      <section className="relative z-10 mx-auto w-full max-w-[1680px] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mb-8 max-w-4xl lg:mb-10"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-500/[0.07] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">
            <ScanText className="h-3.5 w-3.5" />
            Support interaction intelligence
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-[64px]">
            AI Interaction <span className="dxc-gradient-text">Analyzer</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Convert customer interactions into clear work notes and resolution notes.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <FeaturePill icon={ShieldCheck}>Transcript-grounded</FeaturePill>
            <FeaturePill icon={BadgeCheck}>ServiceNow ready</FeaturePill>
            <FeaturePill icon={ArrowDown}>Two outputs only</FeaturePill>
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

function FeaturePill({ icon: Icon, children }: { icon: ElementType; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-xs text-slate-400 backdrop-blur-xl">
      <Icon className="h-3.5 w-3.5 text-orange-300" strokeWidth={1.8} />
      {children}
    </span>
  );
}

function CinematicBackground({ reducedMotion }: { reducedMotion: boolean }) {
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 18, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(69,92,246,0.18),transparent_38%),linear-gradient(180deg,#070a11_0%,#080c14_50%,#070a11_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <motion.div
        className="absolute -left-[14rem] top-[9rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/18 blur-[120px]"
        animate={reducedMotion ? undefined : { x: [0, 80, 0], y: [0, -35, 0], scale: [0.9, 1.08, 0.9] }}
        transition={transition}
      />
      <motion.div
        className="absolute -right-[12rem] top-[4rem] h-[36rem] w-[36rem] rounded-full bg-violet-600/15 blur-[130px]"
        animate={reducedMotion ? undefined : { x: [0, -65, 0], y: [0, 55, 0], scale: [1.05, 0.92, 1.05] }}
        transition={{ ...transition, duration: 21 }}
      />
      <motion.div
        className="absolute bottom-[-20rem] left-[24%] h-[42rem] w-[42rem] rounded-full bg-orange-500/14 blur-[140px]"
        animate={reducedMotion ? undefined : { x: [0, 90, 0], y: [0, -55, 0], scale: [0.95, 1.06, 0.95] }}
        transition={{ ...transition, duration: 24 }}
      />

      <motion.div
        className="absolute left-[6%] top-[31%] h-[380px] w-[620px] rounded-[48%] border border-blue-300/[0.07] bg-gradient-to-br from-blue-500/[0.035] via-transparent to-violet-500/[0.035] [transform-style:preserve-3d]"
        animate={reducedMotion ? undefined : { rotateX: [58, 66, 58], rotateY: [-14, 12, -14], rotateZ: [-5, 6, -5], y: [0, 22, 0] }}
        transition={{ ...transition, duration: 26 }}
      />
      <motion.div
        className="absolute -right-[10%] bottom-[2%] h-[360px] w-[580px] rounded-[46%] border border-orange-300/[0.07] bg-gradient-to-tr from-orange-500/[0.04] via-transparent to-violet-500/[0.03] [transform-style:preserve-3d]"
        animate={reducedMotion ? undefined : { rotateX: [-52, -62, -52], rotateY: [16, -12, 16], rotateZ: [4, -7, 4], x: [0, -26, 0] }}
        transition={{ ...transition, duration: 29 }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.018)_45%,transparent_55%)]" />
    </div>
  );
}
