"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileText,
  LoaderCircle,
  Rows3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, type DocumentationOutput } from "@/store/useAppStore";

function sentenceLines(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((item) =>
      item
        .replace(/\r/g, "")
        .split(/\n+/)
        .flatMap((line) => line.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) ?? [line]),
    )
    .map((line) =>
      line
        .trim()
        .replace(/^\s*(?:[>•*\-]|\d+[.)])\s*/, "")
        .replace(/\s+/g, " "),
    )
    .filter(Boolean);
}

function quoteLines(lines: string[]): string[] {
  return lines.map((line) => `> ${line}`);
}

function workNotesText(output: DocumentationOutput): string {
  return [
    "WORK NOTES",
    "",
    "Issue:",
    ...quoteLines(sentenceLines(output.workNotes.issue)),
    "",
    "TS Performed:",
    ...quoteLines(sentenceLines(output.workNotes.tsPerformed)),
    "",
    "Output:",
    ...quoteLines(sentenceLines(output.workNotes.output)),
  ].join("\n");
}

function resolutionText(output: DocumentationOutput): string {
  return [
    "RESOLUTION NOTES",
    "",
    ...quoteLines(sentenceLines(output.resolutionNotes)),
  ].join("\n");
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

type CopyTarget = "work" | "resolution" | "all";

export function OutputCards() {
  const output = useAppStore((state) => state.output);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const [copied, setCopied] = React.useState<CopyTarget | null>(null);

  const copy = React.useCallback(
    async (target: CopyTarget) => {
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[640px] overflow-hidden rounded-[24px] border border-slate-800 bg-[#090d14] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)]"
      aria-labelledby="results-heading"
    >
      <TechnicalBackdrop />

      <div className="relative z-10 flex min-h-[640px] flex-col p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-400/[0.06]">
              <Rows3 className="h-4.5 w-4.5 text-blue-300" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Documentation record
              </p>
              <h2 id="results-heading" className="mt-1 text-lg font-semibold tracking-tight text-white">
                Generated Notes
              </h2>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void copy("all")}
            disabled={!output || isGenerating}
            className="h-11 rounded-xl border border-orange-300/30 bg-orange-500 px-5 font-semibold text-[#111318] shadow-none hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-300/70 disabled:opacity-35"
          >
            {copied === "all" ? <Check className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
            {copied === "all" ? "Copied successfully" : "Copy All Notes"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center"
            >
              <AnalysisLoader />
            </motion.div>
          ) : output ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-1 flex-col gap-4"
            >
              <RecordCard
                title="Work Notes"
                code="WN"
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
                <RecordRow index="01" label="Issue" lines={sentenceLines(output.workNotes.issue)} accent="blue" />
                <RecordRow
                  index="02"
                  label="TS Performed"
                  lines={sentenceLines(output.workNotes.tsPerformed)}
                  accent="orange"
                />
                <RecordRow index="03" label="Output" lines={sentenceLines(output.workNotes.output)} accent="blue" last />
              </RecordCard>

              <RecordCard
                title="Resolution Notes"
                code="RN"
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
                <RecordRow
                  index="04"
                  label="Resolution"
                  lines={sentenceLines(output.resolutionNotes)}
                  accent="orange"
                  last
                />
              </RecordCard>
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
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-300/25 bg-[#0d1716] px-4 py-2.5 text-xs font-medium text-emerald-200 shadow-2xl"
          >
            <Check className="h-3.5 w-3.5" />
            Copied successfully
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function TechnicalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(148,163,184,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.42)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute left-0 top-0 h-full w-px bg-blue-400/30" />
      <div className="absolute right-0 top-0 h-28 w-px bg-orange-400/40" />
      <div className="absolute right-0 top-0 h-px w-28 bg-orange-400/40" />
      <div className="absolute bottom-0 left-0 h-20 w-px bg-blue-400/25" />
      <div className="absolute bottom-0 left-0 h-px w-20 bg-blue-400/25" />
    </div>
  );
}

type RecordCardProps = {
  title: string;
  code: string;
  icon: React.ElementType;
  accent: "blue" | "orange";
  action: React.ReactNode;
  children: React.ReactNode;
};

function RecordCard({ title, code, icon: Icon, accent, action, children }: RecordCardProps) {
  const tone =
    accent === "blue"
      ? "border-blue-400/20 bg-blue-400/[0.04] text-blue-300"
      : "border-orange-400/20 bg-orange-400/[0.04] text-orange-300";

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-[20px] border border-slate-800 bg-[#0c111a]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${tone}`}>
            <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-semibold tracking-tight text-white">{title}</h3>
            <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-slate-600">{code}</span>
          </div>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </motion.article>
  );
}

function RecordRow({
  index,
  label,
  lines,
  accent,
  last = false,
}: {
  index: string;
  label: string;
  lines: string[];
  accent: "blue" | "orange";
  last?: boolean;
}) {
  const quoteTone = accent === "blue" ? "text-blue-300" : "text-orange-300";

  return (
    <section
      className={`grid gap-3 px-4 py-5 sm:px-5 md:grid-cols-[42px_150px_minmax(0,1fr)] md:gap-4 ${
        last ? "" : "border-b border-slate-800"
      }`}
    >
      <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-slate-600">{index}</span>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</h4>
      <div className="space-y-2.5">
        {lines.map((line, lineIndex) => (
          <motion.p
            key={`${index}-${lineIndex}-${line}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lineIndex * 0.025 }}
            className="grid grid-cols-[18px_minmax(0,1fr)] gap-2 text-[14px] leading-6 text-slate-300"
          >
            <span className={`font-mono font-bold ${quoteTone}`}>&gt;</span>
            <span>{line}</span>
          </motion.p>
        ))}
      </div>
    </section>
  );
}

function CopyButton({ label, copied, onClick }: { label: string; copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-[#111823] px-3 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-[#151e2b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-sm px-5 text-center">
      <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center" aria-hidden>
        <div className="absolute inset-0 rounded-[24px] border border-slate-700 bg-[#0c111a]" />
        <div className="absolute inset-4 rounded-[16px] border border-blue-400/25" />
        <div className="absolute left-6 right-6 top-1/2 h-px bg-orange-400/50" />
        <FileText className="relative h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">Awaiting analysis</p>
      <h3 className="mt-3 text-lg font-semibold text-white">Your documentation will appear here</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Paste an interaction on the left and run the analyzer to create Work Notes and Resolution Notes.
      </p>
    </div>
  );
}

function AnalysisLoader() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-7 flex h-32 w-32 items-center justify-center" aria-hidden>
        <motion.div
          className="absolute inset-0 rounded-[28px] border border-blue-400/30"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 rounded-[20px] border border-orange-400/35"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <LoaderCircle className="h-8 w-8 text-white" strokeWidth={1.4} />
      </div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-300">
        Processing interaction
      </p>
      <p className="mt-3 text-sm text-slate-500">Extracting only documented actions and confirmed status.</p>
    </div>
  );
}
