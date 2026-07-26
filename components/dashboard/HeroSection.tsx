"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[520px] opacity-80"
        style={{
          background:
            "radial-gradient(circle at 15% 30%, rgba(255,122,26,0.20) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(46,107,230,0.22) 0%, transparent 45%), radial-gradient(circle at 70% 90%, rgba(139,78,230,0.20) 0%, transparent 45%)",
          filter: "blur(8px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 -z-10 h-[460px] w-[460px] rounded-full opacity-60"
        style={{
          background:
            "conic-gradient(from 120deg at 50% 50%, #2E6BE6, #FF7A1A, #8B4EE6, #2E6BE6)",
          filter: "blur(90px)",
        }}
      />

      <div className="mx-auto w-full max-w-[1440px] px-6 pt-10 pb-14 md:px-10 md:pt-16 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Headline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dxc-orange opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-dxc-gradient" />
              </span>
              Powered by GPT-5.5 · DXC Enterprise AI Platform
            </div>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              <span className="block text-foreground">
                AI Service Desk
              </span>
              <span className="block text-gradient-dxc pb-2 sm:pb-3">
                Documentation Assistant
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Generate polished{" "}
              <span className="font-semibold text-foreground/90">
                Work Notes
              </span>
              , concise{" "}
              <span className="font-semibold text-foreground/90">
                Resolution Notes
              </span>{" "}
              and thorough{" "}
              <span className="font-semibold text-foreground/90">
                Root Cause Analysis
              </span>{" "}
              from Microsoft Teams chats, call transcripts, ticket notes and
              troubleshooting sessions — in seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="gradient">
                <Link href="/documentation">
                  <Zap className="h-4.5 w-4.5" strokeWidth={2.2} />
                  Start Documenting
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/templates">
                  <Sparkles className="h-4 w-4" />
                  Browse Templates
                </Link>
              </Button>
            </div>

            {/* Mini stats strip */}
            <div className="mt-10 grid grid-cols-3 max-w-lg gap-4">
              {[
                { label: "Avg. time saved", value: "12 min", hint: "per ticket" },
                { label: "Documentation accuracy", value: "98%", hint: "enterprise grade" },
                { label: "Format ready", value: "ServiceNow", hint: "1-click copy" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                  className="relative rounded-2xl border border-border/60 bg-card/70 p-3.5 shadow-sm backdrop-blur"
                >
                  <div className="flex items-baseline gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-dxc-blue" />
                    <span className="text-lg font-bold tracking-tight md:text-xl">
                      {s.value}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-foreground/90">
                    {s.label}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">
                    {s.hint}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Quick stat preview */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <HeroStatCards />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroStatCards() {
  return (
    <div className="relative h-full">
      {/* Floating preview card grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <StatCard
          label="Today's Documentation"
          value="28"
          suffix="tickets"
          delta="+40%"
          tone="blue"
          index={0}
        />
        <StatCard
          label="Time Saved"
          value="5.6"
          suffix="hours"
          delta="+3.1h"
          tone="orange"
          index={1}
        />
        <StatCard
          label="AI Accuracy"
          value="98.4"
          suffix="%"
          delta="+1.2%"
          tone="purple"
          index={2}
        />
        <StatCard
          label="Team Active"
          value="14"
          suffix="agents"
          delta="Live"
          tone="green"
          index={3}
        />
      </div>

      {/* Large "sample output" preview card on bottom */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card-hover"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-dxc-gradient" />
            <span className="text-sm font-semibold">Latest Output</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Outlook Credential Incident · 4 min ago
          </span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-3 md:gap-3">
          <MiniDoc title="Work Notes" tint="blue" lines={[
            "Issue: Outlook prompts for credentials repeatedly.",
            "TS Performed: cleared cached creds, recreated profile.",
            "Next: Monitor for recurrence in 24h.",
          ]} />
          <MiniDoc title="Resolution" tint="orange" lines={[
            "Cleared stale Windows Credential Manager entries and recreated the Outlook profile. User confirmed mailbox sync. Resolved.",
          ]} />
          <MiniDoc title="RCA" tint="purple" lines={[
            "Root Cause: corrupted Neutralbox credential.",
            "Corrective: Credential refresh + profile rebuild.",
          ]} />
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  delta,
  tone,
  index,
}: {
  label: string;
  value: string;
  suffix: string;
  delta: string;
  tone: "blue" | "orange" | "purple" | "green";
  index: number;
}) {
  const toneClass = {
    blue: "from-sky-500/15 to-sky-500/0 text-sky-700 dark:text-sky-300",
    orange:
      "from-orange-500/15 to-orange-500/0 text-orange-700 dark:text-orange-300",
    purple:
      "from-violet-500/15 to-violet-500/0 text-violet-700 dark:text-violet-300",
    green:
      "from-emerald-500/15 to-emerald-500/0 text-emerald-700 dark:text-emerald-300",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 + index * 0.07 }}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClass} opacity-70`}
      />
      <div className="relative">
        <div className="text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight md:text-3xl">
            {value}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {suffix}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowRight className="h-3 w-3 -rotate-45" />
          {delta}
        </div>
      </div>
    </motion.div>
  );
}

function MiniDoc({
  title,
  tint,
  lines,
}: {
  title: string;
  tint: "blue" | "orange" | "purple";
  lines: string[];
}) {
  const tintClass = {
    blue: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    orange: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    purple: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  }[tint];
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
      <div
        className={`mb-2 inline-flex items-center rounded-lg px-2 py-0.5 text-[10.5px] font-semibold ${tintClass}`}
      >
        {title}
      </div>
      <div className="space-y-1.5 text-[11.5px] leading-relaxed text-foreground/85">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}
