"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAppStore, stepMessages } from "@/store/useAppStore";

export function ProgressStepper() {
  const currentStep = useAppStore((s) => s.currentStep) ?? 0;
  const isGenerating = useAppStore((s) => s.isGenerating);

  const totalSteps = 7;
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const pct = Math.min(
    100,
    Math.max(0, Math.round(((currentStep || 0) / totalSteps) * 100)),
  );

  const activeMessage =
    currentStep && stepMessages[currentStep]
      ? stepMessages[currentStep]
      : "Initializing...";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-border/70 bg-card/70 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dxc-orange opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-dxc-gradient" />
          </span>
          <div className="text-sm">
            <span className="font-semibold text-foreground">
              {isGenerating ? "Analyzing documentation" : "Analysis complete"}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeMessage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="ml-2 text-muted-foreground"
              >
                — {activeMessage}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <div className="text-xs font-medium text-muted-foreground tabular-nums">
          {Math.min(currentStep || 0, totalSteps)} / {totalSteps}
        </div>
      </div>

      <Progress value={pct} className="h-1.5" />

      {/* Step dots */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {steps.map((step) => {
          const done = currentStep > step;
          const active = currentStep === step;
          return (
            <div key={step} className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1 : done ? 1 : 0.95,
                }}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  done
                    ? "bg-dxc-gradient text-white shadow-sm"
                    : active
                    ? "bg-dxc-gradient text-white shadow-md shadow-black/10 ring-4 ring-dxc-gradient/20"
                    : "bg-muted text-muted-foreground/70"
                }`}
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pending"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: active ? 1.05 : 1 }}
                      className={active ? "animate-pulse-soft" : ""}
                    >
                      <Circle
                        className={`h-3 w-3 ${
                          active ? "text-white" : ""
                        }`}
                        strokeWidth={active ? 0 : 2.5}
                        fill={active ? "white" : "currentColor"}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <div
                className={`text-[9.5px] leading-tight text-center font-medium ${
                  done
                    ? "text-foreground"
                    : active
                    ? "text-foreground"
                    : "text-muted-foreground/70"
                }`}
              >
                {labelForStep(step)}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function labelForStep(s: number) {
  return (
    [
      "Read",
      "Understand",
      "Extract",
      "Work Notes",
      "Resolution",
      "RCA",
      "Done",
    ] as const
  )[s - 1];
}
