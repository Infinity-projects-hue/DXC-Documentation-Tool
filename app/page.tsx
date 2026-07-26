"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HistorySidebar, historySeed, type HistoryEntry } from "@/components/layout/HistorySidebar";
import { InputCard } from "@/components/documentation/InputCard";
import { OutputCards } from "@/components/documentation/OutputCards";
import { GlobalActionsBar } from "@/components/documentation/GlobalActionsBar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileCog } from "lucide-react";
import { useHistoryShell } from "@/app/providers";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export default function HomeWorkspacePage() {
  const { historyOpen, setHistoryOpen } = useHistoryShell();
  const setTranscript = useAppStore((s) => s.setTranscript);
  const setOutput = useAppStore((s) => s.setOutput);
  const setStep = useAppStore((s) => s.setStep);
  const finishGeneration = useAppStore((s) => s.finishGeneration);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const startGeneration = useAppStore((s) => s.startGeneration);
  const output = useAppStore((s) => s.output);

  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

  const handleSelect = React.useCallback(
    (e: HistoryEntry) => {
      setSelectedId(e.id);
      // Populate the workspace with the chosen history entry
      setTranscript(e.originalTranscript);
      if (e.output?.workNotes?.issue) {
        startGeneration();
        let s = 1;
        const timer = setInterval(() => {
          s++;
          setStep(s as any);
          if (s >= 7) {
            clearInterval(timer);
            setOutput(e.output);
            finishGeneration();
          }
        }, 180);
      } else {
        setOutput(null);
      }
    },
    [setTranscript, setOutput, setStep, startGeneration, finishGeneration],
  );

  return (
    <div className="relative mx-auto flex w-full max-w-[1600px] gap-0 px-0 py-0 md:px-4">
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(historyOpen ? false : true)}
        onSelect={handleSelect}
        selectedId={selectedId}
      />

      {/* Main Workspace */}
      <motion.section
        layout
        className="relative mx-auto w-full min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8"
      >
        {/* Subtle header strip + DXC gradient mesh */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[220px] opacity-70"
          style={{
            background:
              "radial-gradient(circle at 15% 0%, rgba(255,122,26,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 0%, rgba(46,107,230,0.18) 0%, transparent 45%), radial-gradient(circle at 50% 100%, rgba(139,78,230,0.16) 0%, transparent 55%)",
          }}
        />

        {/* Page Heading */}
        <motion.header
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dxc-gradient-soft ring-1 ring-border/60">
              <FileCog
                className="h-5 w-5 text-gradient-dxc"
                strokeWidth={2.1}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
                  Documentation Workspace
                </h1>
                <Badge variant="info" className="gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  GPT-5.5 · Enterprise
                </Badge>
              </div>
              <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
                Paste a chat transcript or call summary below. Generate
                structured Work Notes and Resolution Notes. Click any saved
                history entry on the left to reload it here.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "text-xs text-muted-foreground transition-opacity",
                output && !isGenerating ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!!output && !isGenerating ? false : true}
            >
              {output ? "Output ready — review and export below" : ""}
            </div>
          </div>
        </motion.header>

        {/* Workspace content */}
        <div className="space-y-6 pb-28">
          <div className="mx-auto w-full max-w-[1200px]">
            <InputCard />
          </div>

          <AnimatePresence>
            {(output || isGenerating) && (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <OutputCards />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      <GlobalActionsBar />
    </div>
  );
}
