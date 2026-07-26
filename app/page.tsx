"use client";

import { AnimatePresence, motion } from "framer-motion";
import { InputCard } from "@/components/documentation/InputCard";
import { OutputCards } from "@/components/documentation/OutputCards";
import { GlobalActionsBar } from "@/components/documentation/GlobalActionsBar";
import { FileCog } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function HomeWorkspacePage() {
  const isGenerating = useAppStore((s) => s.isGenerating);
  const output = useAppStore((s) => s.output);

  return (
    <div className="relative mx-auto flex w-full max-w-[1600px] px-0 py-0 md:px-4">
      <motion.section
        layout
        className="relative mx-auto w-full min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[220px] opacity-70"
          style={{
            background:
              "radial-gradient(circle at 15% 0%, rgba(255,122,26,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 0%, rgba(46,107,230,0.18) 0%, transparent 45%), radial-gradient(circle at 50% 100%, rgba(139,78,230,0.16) 0%, transparent 55%)",
          }}
        />

        <motion.header
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dxc-gradient-soft ring-1 ring-border/60">
              <FileCog
                className="h-5 w-5 text-gradient-dxc"
                strokeWidth={2.1}
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
                Documentation Workspace
              </h1>
              <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
                Paste a chat transcript or call summary below to generate
                structured Work Notes and Resolution Notes.
              </p>
            </div>
          </div>
        </motion.header>

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
