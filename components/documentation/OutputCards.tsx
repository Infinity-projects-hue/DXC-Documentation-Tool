"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileText,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, type DocumentationOutput } from "@/store/useAppStore";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function workNotesText(output: DocumentationOutput): string {
  return [
    "WORK NOTES",
    "",
    "Issue:",
    normalize(output.workNotes.issue),
    "",
    "Troubleshooting / Actions Performed:",
    ...output.workNotes.tsPerformed.map(normalize),
    "",
    "Outcome:",
    normalize(output.workNotes.output),
  ].join("\n");
}

function resolutionText(output: DocumentationOutput): string {
  return ["RESOLUTION NOTES", "", normalize(output.resolutionNotes)].join("\n");
}

function allNotesText(output: DocumentationOutput): string {
  return `${workNotesText(output)}\n\n${resolutionText(output)}`;
}

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function OutputCards() {
  const output = useAppStore((state) => state.output);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const [copied, setCopied] = React.useState<"work" | "resolution" | "all" | null>(null);

  const copy = React.useCallback(
    async (target: "work" | "resolution" | "all") => {
      if (!output) return;
      const text =
        target === "work"
          ? workNotesText(output)
          : target === "resolution"
            ? resolutionText(output)
            : allNotesText(output);

      try {
        await writeClipboard(text);
        setCopied(target);
        window.setTimeout(() => setCopied(null), 1900);
      } catch {
        setCopied(null);
      }
    },
    [output],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.06, ease: "easeOut" }}
      className="relative isolate min-h-[640px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_32px_100px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
      aria-labelledby="results-heading"
    >
      <ResultsBackdrop />

      <div className="relative z-10 flex min-h-[640px] flex-col p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055]">
                <Layers3 className="h-4.5 w-4.5 text-blue-300" strokeWidth={1.8} />
              </div>
              <div>
                <h2 id="results-heading" className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  Generated Notes
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">Professional, transcript-grounded ITSM documentation.</p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void copy("all")}
            disabled={!output || isGenerating}
            className="h-11 rounded-2xl border border-orange-300/20 bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 px-5 font-semibold text-white shadow-[0_16px_34px_-20px_rgba(249,115,22,0.9)] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-orange-300/60 disabled:opacity-35"
          >
            {copied === "all" ? <Check className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
            {copied === "all" ? "Copied successfully" : "Copy All Notes"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-1 items-center justify-center"
            >
              <AnalysisLoader />
            </motion.div>
          ) : output ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-1 flex-col gap-4"
            >
              <NotesCard
                title="Work Notes"
                icon={FileText}
                accent="blue"
                action={
                  <CopyButton
                    label="Copy Work Notes"
                    copied={copied === "work"}
                    onClick={() => void copy("work")}
                  />
                }
              >
                <NoteSection label="Issue">
                  <p>{output.workNotes.issue}</p>
                </NoteSection>

                <NoteSection label="Troubleshooting / Actions Performed">
                  <div className="space-y-2.5">
                    {output.workNotes.tsPerformed.map((action, index) => (
                      <motion.p
                        key={`${action}-${index}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + index * 0.035 }}
                        className="border-l border-violet-400/25 pl-3"
                      >
                        {action}
                      </motion.p>
                    ))}
                  </div>
                </NoteSection>

                <NoteSection label="Outcome">
                  <p>{output.workNotes.output}</p>
                </NoteSection>
              </NotesCard>

              <NotesCard
                title="Resolution Notes"
                icon={FileCheck2}
                accent="orange"
                action={
                  <CopyButton
                    label="Copy Resolution Notes"
                    copied={copied === "resolution"}
                    onClick={() => void copy("resolution")}
                  />
                }
              >
                <p className="text-[15px] leading-7 text-slate-200">{output.resolutionNotes}</p>
              </NotesCard>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center"
            >
              <EmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-300/20 bg-[#0d1716]/90 px-4 py-2.5 text-xs font-medium text-emerald-200 shadow-2xl backdrop-blur-xl"
          >
            <Check className="h-3.5 w-3.5" />
            Copied successfully
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

type NotesCardProps = {
  title: string;
  icon: React.ElementType;
  accent: "blue" | "orange";
  action: React.ReactNode;
  children: React.ReactNode;
};

function NotesCard({ title, icon: Icon, accent, action, children }: NotesCardProps) {
  const tones =
    accent === "blue"
      ? {
          icon: "text-blue-300",
          glow: "from-blue-500/15 via-violet-500/5 to-transparent",
          line: "via-blue-300/60",
        }
      : {
          icon: "text-orange-300",
          glow: "from-orange-500/15 via-rose-500/5 to-transparent",
          line: "via-orange-300/60",
        };

  return (
    <motion.article
      whileHover={{ y: -3, rotateX: 0.35, rotateY: -0.3 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0b101a]/75 shadow-[0_18px_54px_-34px_rgba(0,0,0,0.95)] [transform-style:preserve-3d]"
    >
      <div aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tones.glow}`} />
      <div aria-hidden className={`pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent ${tones.line} to-transparent`} />
      <div className="relative z-10 border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045]">
              <Icon className={`h-4.5 w-4.5 ${tones.icon}`} strokeWidth={1.8} />
            </div>
            <h3 className="font-semibold tracking-tight text-white">{title}</h3>
          </div>
          {action}
        </div>
      </div>
      <div className="relative z-10 space-y-5 px-5 py-5 text-sm leading-6 text-slate-300">{children}</div>
    </motion.article>
  );
}

function NoteSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</h4>
      <div className="text-[14px] leading-[1.7] text-slate-300">{children}</div>
    </section>
  );
}

function CopyButton({ label, copied, onClick }: { label: string; copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-sm px-5 text-center">
      <div className="relative mx-auto mb-7 h-36 w-36 [perspective:700px]" aria-hidden>
        <motion.div
          className="absolute inset-3 rounded-[34px] border border-blue-300/25 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-orange-400/10 shadow-[0_0_70px_rgba(59,130,246,0.14)] [transform-style:preserve-3d]"
          animate={{ rotateX: [58, 68, 58], rotateZ: [-8, 8, -8], y: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-8 rounded-[24px] border border-orange-300/30 bg-black/30 [transform-style:preserve-3d]"
          animate={{ rotateY: [0, 180, 360], rotateX: [20, -20, 20] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-white/80" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">Your notes will appear here</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Paste a complete customer interaction and select Analyze Interaction to generate grounded Work Notes and Resolution Notes.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] text-slate-500">
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">No invented actions</span>
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">ServiceNow ready</span>
      </div>
    </div>
  );
}

function AnalysisLoader() {
  return (
    <div className="max-w-sm px-5 text-center">
      <div className="relative mx-auto mb-8 h-44 w-44 [perspective:900px]" aria-hidden>
        <motion.div
          className="absolute inset-3 rounded-full border border-blue-300/35"
          animate={{ rotateX: [0, 70, 0], rotateY: [0, 180, 360] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-7 rounded-full border border-violet-300/35"
          animate={{ rotateX: [75, 0, 75], rotateZ: [0, -180, -360] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-11 rounded-full border border-orange-300/45"
          animate={{ rotateY: [70, 0, 70], rotateZ: [0, 180, 360] }}
          transition={{ duration: 2.9, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-orange-400 shadow-[0_0_65px_rgba(99,102,241,0.7)]"
          animate={{ rotate: [0, 90, 180, 270, 360], scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <h3 className="text-lg font-semibold text-white">Building support documentation</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Extracting the reported issue, verified actions, observed outcome, and concise resolution.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-blue-300">
        <ShieldCheck className="h-4 w-4" />
        Grounded only in the supplied transcript
      </div>
    </div>
  );
}

function ResultsBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 20, 0], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"
        animate={{ x: [0, 28, 0], y: [0, -18, 0], scale: [1.05, 0.92, 1.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.32)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}
