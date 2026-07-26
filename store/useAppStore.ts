"use client";

import { create } from "zustand";

export type GenerationStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;

export interface WorkNotes {
  issue: string;
  tsPerformed: string[];
  output: string;
  nextAction: string;
}

export interface RCA {
  rootCause: string;
  impact: string;
  correctiveAction: string;
  preventiveAction: string;
}

export interface DocumentationOutput {
  workNotes: WorkNotes;
  resolutionNotes: string;
  rca: RCA;
}

export interface AppState {
  transcript: string;
  setTranscript: (t: string) => void;

  isGenerating: boolean;
  currentStep: GenerationStep;
  startGeneration: () => void;
  setStep: (s: GenerationStep) => void;
  finishGeneration: () => void;

  output: DocumentationOutput | null;
  setOutput: (o: DocumentationOutput | null) => void;

  editableField:
    | null
    | "workNotes.issue"
    | "workNotes.output"
    | "workNotes.nextAction"
    | "workNotes.tsPerformed"
    | "resolutionNotes"
    | "rca.rootCause"
    | "rca.impact"
    | "rca.correctiveAction"
    | "rca.preventiveAction";
  setEditableField: (
    f: AppState["editableField"],
  ) => void;
  updateOutput: (patch: Partial<DocumentationOutput>) => void;
}

const stepMessages: Record<number, string> = {
  1: "Reading conversation...",
  2: "Understanding issue...",
  3: "Extracting troubleshooting...",
  4: "Generating Work Notes...",
  5: "Generating Resolution...",
  6: "Generating Root Cause Analysis...",
  7: "Completed.",
};

export { stepMessages };

const emptyWorkNotes: WorkNotes = {
  issue: "",
  tsPerformed: [],
  output: "",
  nextAction: "",
};

const emptyRCA: RCA = {
  rootCause: "",
  impact: "",
  correctiveAction: "",
  preventiveAction: "",
};

export const useAppStore = create<AppState>((set) => ({
  transcript: "",
  setTranscript: (t) => set({ transcript: t }),

  isGenerating: false,
  currentStep: null,
  startGeneration: () => set({ isGenerating: true, currentStep: 1, output: null }),
  setStep: (s) => set({ currentStep: s }),
  finishGeneration: () => set({ isGenerating: false, currentStep: 7 }),

  output: null,
  setOutput: (o) => set({ output: o }),

  editableField: null,
  setEditableField: (f) => set({ editableField: f }),
  updateOutput: (patch) =>
    set((s) => {
      if (!s.output) return s;
      return {
        output: {
          ...s.output,
          ...patch,
          workNotes: {
            ...s.output.workNotes,
            ...(patch.workNotes ?? {}),
          },
          rca: {
            ...s.output.rca,
            ...(patch.rca ?? {}),
          },
        },
      };
    }),
}));

export { emptyWorkNotes, emptyRCA };
