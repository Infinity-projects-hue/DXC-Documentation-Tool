"use client";

import { create } from "zustand";

export type GenerationStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;

export interface WorkNotes {
  issue: string;
  tsPerformed: string[];
  output: string;
}

export interface DocumentationOutput {
  workNotes: WorkNotes;
  resolutionNotes: string;
}

export interface AppState {
  transcript: string;
  setTranscript: (transcript: string) => void;

  isGenerating: boolean;
  currentStep: GenerationStep;
  startGeneration: () => void;
  setStep: (step: GenerationStep) => void;
  finishGeneration: () => void;

  output: DocumentationOutput | null;
  setOutput: (output: DocumentationOutput | null) => void;

  editableField:
    | null
    | "workNotes.issue"
    | "workNotes.output"
    | "workNotes.tsPerformed"
    | "resolutionNotes";
  setEditableField: (field: AppState["editableField"]) => void;
  updateOutput: (patch: Partial<DocumentationOutput>) => void;
}

const stepMessages: Record<number, string> = {
  1: "Reading interaction...",
  2: "Understanding the reported issue...",
  3: "Extracting completed actions...",
  4: "Building Work Notes...",
  5: "Building Resolution Notes...",
  6: "Validating transcript grounding...",
  7: "Completed.",
};

export { stepMessages };

const emptyWorkNotes: WorkNotes = {
  issue: "",
  tsPerformed: [],
  output: "",
};

export const useAppStore = create<AppState>((set) => ({
  transcript: "",
  setTranscript: (transcript) => set({ transcript }),

  isGenerating: false,
  currentStep: null,
  startGeneration: () => set({ isGenerating: true, currentStep: 1, output: null }),
  setStep: (currentStep) => set({ currentStep }),
  finishGeneration: () => set({ isGenerating: false, currentStep: 7 }),

  output: null,
  setOutput: (output) => set({ output }),

  editableField: null,
  setEditableField: (editableField) => set({ editableField }),
  updateOutput: (patch) =>
    set((state) => {
      if (!state.output) return state;
      return {
        output: {
          ...state.output,
          ...patch,
          workNotes: {
            ...state.output.workNotes,
            ...(patch.workNotes ?? {}),
          },
        },
      };
    }),
}));

export { emptyWorkNotes };
