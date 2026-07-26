"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  FileText,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore, type DocumentationOutput, type GenerationStep } from "@/store/useAppStore";

const MAX_TRANSCRIPT_LENGTH = 60_000;

export function InputCard() {
  const transcript = useAppStore((state) => state.transcript);
  const setTranscript = useAppStore((state) => state.setTranscript);
  const setOutput = useAppStore((state) => state.setOutput);
  const startGeneration = useAppStore((state) => state.startGeneration);
  const finishGeneration = useAppStore((state) => state.finishGeneration);
  const setStep = useAppStore((state) => state.setStep);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const currentStep = useAppStore((state) => state.currentStep);
  const [error, setError] = React.useState<string | null>(null);

  const charCount = transcript.length;
  const isOverLimit = charCount > MAX_TRANSCRIPT_LENGTH;

  const clearTranscript = () => {
    if (isGenerating) return;
    setTranscript("");
    setOutput(null);
    setStep(null);
    setError(null);
  };

  const analyzeInteraction = React.useCallback(async () => {
    const cleanTranscript = transcript.trim();

    if (!cleanTranscript) {
      setError("Paste an interaction transcript before analyzing.");
      return;
    }

    if (isOverLimit) {
      setError("The transcript must be under 60,000 characters.");
      return;
    }

    setError(null);
    startGeneration();

    let progressStep = 1;
    const progressTimer = window.setInterval(() => {
      progressStep = Math.min(progressStep + 1, 6);
      setStep(progressStep as GenerationStep);
    }, 720);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: cleanTranscript }),
      });

      const payload = (await response.json()) as {
        output?: DocumentationOutput;
        error?: string;
      };

      if (!response.ok || !payload.output) {
        throw new Error(payload.error || "The interaction could not be analyzed.");
      }

      setOutput(payload.output);
      setStep(7);
    } catch (analysisError) {
      setOutput(null);
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "The interaction could not be analyzed. Please try again.",
      );
    } finally {
      window.clearInterval(progressTimer);
      finishGeneration();
    }
  }, [finishGeneration, isOverLimit, setOutput, setStep, startGeneration, transcript]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-[0_32px_100px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
      aria-labelledby="transcript-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative z-10 flex min-h-[640px] flex-col p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-inner shadow-white/5">
              <FileText className="h-5 w-5 text-orange-300" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 id="transcript-heading" className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Interaction Transcript
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                Include the complete support conversation for the most accurate result.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-medium text-slate-400">
            {charCount.toLocaleString()} / {MAX_TRANSCRIPT_LENGTH.toLocaleString()}
          </span>
        </div>

        <div className="relative flex-1">
          <Textarea
            value={transcript}
            onChange={(event) => {
              setTranscript(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void analyzeInteraction();
              }
            }}
            disabled={isGenerating}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "transcript-error" : "transcript-help"}
            placeholder="Paste the complete chat transcript, call summary, or customer interaction here…"
            className="h-full min-h-[430px] resize-none rounded-[22px] border-white/10 bg-black/25 px-5 py-5 text-[15px] leading-7 text-slate-100 shadow-inner shadow-black/30 outline-none placeholder:text-slate-600 focus-visible:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-500/25 disabled:cursor-wait disabled:opacity-65"
            spellCheck={false}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 bottom-4 h-20 rounded-2xl bg-gradient-to-t from-[#080b12] via-[#080b12]/70 to-transparent"
          />
          <p id="transcript-help" className="pointer-events-none absolute bottom-4 left-5 text-[11px] text-slate-500">
            Press Ctrl/⌘ + Enter to analyze
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              id="transcript-error"
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 8 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center gap-4 rounded-2xl border border-blue-400/15 bg-blue-500/[0.07] px-4 py-3.5">
                <MiniAnalyzerOrb />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-100">
                      Analyzing interaction
                    </p>
                    <span className="text-[11px] text-blue-300">Step {Math.min(currentStep || 1, 6)} of 6</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-orange-400"
                      animate={{ width: `${(Math.min(currentStep || 1, 6) / 6) * 100}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={clearTranscript}
            disabled={isGenerating || (!transcript && !error)}
            className="h-12 justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-5 text-slate-300 hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-orange-400/50 sm:justify-start"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>

          <motion.div
            className="relative"
            whileHover={isGenerating ? undefined : { scale: 1.015 }}
            whileTap={isGenerating ? undefined : { scale: 0.985 }}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-[20px] bg-gradient-to-r from-blue-500 via-violet-500 to-orange-400 blur-lg"
              animate={
                isGenerating
                  ? { opacity: [0.25, 0.55, 0.25], scale: [0.98, 1.03, 0.98] }
                  : { opacity: [0.22, 0.42, 0.22] }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <Button
              type="button"
              onClick={() => void analyzeInteraction()}
              disabled={isGenerating || isOverLimit}
              className="relative h-12 w-full rounded-2xl border border-white/15 bg-gradient-to-r from-blue-600 via-violet-600 to-orange-500 px-6 font-semibold text-white shadow-[0_14px_38px_-18px_rgba(99,102,241,0.9)] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-orange-300/70 sm:w-auto"
            >
              {isGenerating ? (
                <MiniSpinner />
              ) : (
                <Sparkles className="h-4.5 w-4.5" strokeWidth={2} />
              )}
              {isGenerating ? "Analyzing Interaction" : "Analyze Interaction"}
              {!isGenerating && <ArrowUpRight className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function MiniSpinner() {
  return (
    <span className="relative h-4 w-4" aria-hidden>
      <span className="absolute inset-0 rounded-full border-2 border-white/25" />
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-white"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </span>
  );
}

function MiniAnalyzerOrb() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center [perspective:400px]" aria-hidden>
      <motion.span
        className="absolute h-9 w-9 rounded-full border border-blue-300/40"
        animate={{ rotateX: [0, 70, 0], rotateY: [0, 180, 360] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute h-7 w-7 rounded-full border border-orange-300/50"
        animate={{ rotateX: [70, 0, 70], rotateZ: [0, -180, -360] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
      />
      <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]" />
    </div>
  );
}
