"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowUpRight, FileText, LoaderCircle, Trash2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[640px] overflow-hidden rounded-[24px] border border-slate-800 bg-[#090d14] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)]"
      aria-labelledby="transcript-heading"
    >
      <div aria-hidden className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(148,163,184,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.38)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div aria-hidden className="absolute left-0 top-0 h-28 w-px bg-orange-400/40" />
      <div aria-hidden className="absolute left-0 top-0 h-px w-28 bg-orange-400/40" />

      <div className="relative z-10 flex min-h-[640px] flex-col p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-400/[0.06]">
              <FileText className="h-4.5 w-4.5 text-orange-300" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Input record / IN-01</p>
              <h2 id="transcript-heading" className="mt-1 text-lg font-semibold tracking-tight text-white">
                Interaction Transcript
              </h2>
            </div>
          </div>
          <span className={`font-mono text-[10px] font-semibold ${isOverLimit ? "text-rose-300" : "text-slate-500"}`}>
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
            className="h-full min-h-[430px] resize-none rounded-[18px] border-slate-700 bg-[#070b11] px-5 py-5 text-[15px] leading-7 text-slate-100 shadow-inner shadow-black/30 outline-none placeholder:text-slate-600 focus-visible:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-wait disabled:opacity-65"
            spellCheck={false}
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-3 bottom-3 h-16 rounded-xl bg-gradient-to-t from-[#070b11] via-[#070b11]/85 to-transparent" />
          <p id="transcript-help" className="pointer-events-none absolute bottom-4 left-5 font-mono text-[10px] text-slate-600">
            CTRL / CMD + ENTER TO ANALYZE
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
              className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200"
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
              <AnalysisStatus step={Math.min(currentStep || 1, 6)} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={clearTranscript}
            disabled={isGenerating || (!transcript && !error)}
            className="h-12 justify-center rounded-xl border border-slate-700 bg-[#0d131d] px-5 text-slate-300 hover:bg-[#131c28] hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/50 sm:justify-start"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>

          <Button
            type="button"
            onClick={() => void analyzeInteraction()}
            disabled={isGenerating || isOverLimit}
            className="h-12 w-full rounded-xl border border-orange-300/40 bg-orange-500 px-6 font-semibold text-[#111318] shadow-[0_12px_28px_-18px_rgba(249,115,22,0.8)] hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-300/70 sm:w-auto"
          >
            {isGenerating ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <FileText className="h-4.5 w-4.5" />}
            {isGenerating ? "Analyzing Interaction" : "Analyze Interaction"}
            {!isGenerating && <ArrowUpRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

function AnalysisStatus({ step }: { step: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/[0.045] px-4 py-3.5">
      <div className="flex items-center gap-4">
        <motion.div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/30"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          aria-hidden
        >
          <span className="h-2 w-2 rounded-sm bg-orange-300" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-100">Analyzing interaction</p>
            <span className="font-mono text-[10px] text-blue-300">STEP {step} / 6</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-blue-400"
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
