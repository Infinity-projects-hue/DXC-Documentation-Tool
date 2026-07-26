"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Clipboard,
  Mic,
  Trash2,
  Sparkles,
  FileUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/store/useAppStore";
import { ProgressStepper } from "./ProgressStepper";

const sampleTranscript = `User (John M.): Hey, since the migration my Outlook keeps popping up asking for credentials every 10 minutes. I enter them and then it happens again. Really slowing me down.

Agent (Alex C.): Thanks John, I'll help fix that. Let's check a few things.

Agent (Alex C.): First, can you close Outlook completely? I'll reset your stored credentials.

User (John M.): Sure, done.

Agent (Alex C.): Opened Credential Manager, removed all stale Office365/Outlook entries. Also removed the corrupted profile from Control Panel > Mail. Recreated profile with auto-discover. Started Outlook.

User (John M.): Ok, no prompt so far. Let me test a send/receive...
User (John M.): Works! No popup. Emails flowing.

Agent (Alex C.): Great. If it comes back in the next 24h, just reply here and we'll check modern auth. Have a good one!`;

export function InputCard() {
  const transcript = useAppStore((s) => s.transcript);
  const setTranscript = useAppStore((s) => s.setTranscript);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const startGeneration = useAppStore((s) => s.startGeneration);
  const setStep = useAppStore((s) => s.setStep);
  const setOutput = useAppStore((s) => s.setOutput);
  const finishGeneration = useAppStore((s) => s.finishGeneration);
  const currentStep = useAppStore((s) => s.currentStep);

  const txtRef = React.useRef<HTMLInputElement>(null);
  const docxRef = React.useRef<HTMLInputElement>(null);

  const onPaste = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const t = await navigator.clipboard.readText();
        const prev = useAppStore.getState().transcript;
        setTranscript(prev ? `${prev}\n\n${t}` : t);
      }
    } catch {
      // ignore
    }
  };

  const onClear = () => setTranscript("");

  const onLoadSample = () => setTranscript(sampleTranscript);

  const simulateGeneration = () => {
    startGeneration();
    const steps: Array<[number, number]> = [
      [1, 700],
      [2, 900],
      [3, 900],
      [4, 1100],
      [5, 700],
      [6, 900],
      [7, 400],
    ];
    let acc = 0;
    steps.forEach(([st, delay]) => {
      acc += delay;
      setTimeout(() => {
        setStep(st as any);
        if (st === 7) {
          // mock output
          setOutput({
            workNotes: {
              issue:
                "Outlook repeatedly prompts for credentials post-O365 migration. Authentication pop-up occurs approximately every 10 minutes despite correct credentials being entered, preventing productive email use.",
              tsPerformed: [
                "Confirmed end-user issue reproduction and validated ticket context.",
                "Closed Outlook client completely on user workstation.",
                "Opened Windows Credential Manager and removed all stale Office 365 / Outlook cached entries (5 entries removed).",
                "Navigated to Control Panel > Mail (32-bit) and removed the corrupted default MAPI profile.",
                "Recreated the Outlook profile using AutoDiscover against Exchange Online.",
                "Launched Outlook, validated first-run sync and performed test Send/Receive.",
                "Confirmed no credential prompts appeared post-recreation.",
              ],
              output:
                "Outlook launches cleanly; primary mailbox, shared calendars and public folders synchronise without authentication prompts. User performed one outbound and one inbound test message — both delivered successfully. Client status shows 'Connected to Microsoft Exchange' with all 4 service endpoints reported as Available.",
              nextAction:
                "Monitor the incident for 24 hours. If credential prompts reoccur, enable Modern Auth verbose logging and validate AAD Connect hybrid attribute consistency for the affected UPN. Close incident on user confirmation tomorrow.",
            },
            resolutionNotes:
              "Resolved by clearing stale Windows Credential Manager Office 365 entries and recreating the corrupted Outlook MAPI profile via AutoDiscover. User confirmed mailbox sync and no repeated credential prompts; test Send/Receive succeeded. Incident resolved successfully.",
            rca: {
              rootCause:
                "Stale legacy Basic Authentication credentials cached in the Windows Credential Manager, combined with a corrupted Outlook MAPI profile (Neutralbox SCP records), caused repeated authentication prompts after tenant Modern Auth enforcement in the migration window.",
              impact:
                "Single user impact (John M., Finance). Moderate productivity loss estimated at 45 minutes due to repeated password prompts and manual mailbox restarts; no data loss or downstream service impact.",
              correctiveAction:
                "Removed stale Office 365 Windows Credentials; deleted corrupted MAPI profile and recreated via AutoDiscover against Exchange Online Modern Auth endpoint.",
              preventiveAction:
                "1) Deploy script to clear legacy Office credentials during cutover migration batch. 2) GPO to disable cached Basic Auth tokens for Office 16.x clients. 3) Schedule monthly service desk KB refresh on Modern Auth migration issues.",
            },
          });
          finishGeneration();
        }
      }, acc);
    });
  };

  const charCount = transcript.length;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-dxc-gradient bg-[length:200%_200%] animate-gradient-x"
        />
        <CardHeader className="flex flex-col gap-1 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dxc-gradient-soft ring-1 ring-border/60">
                <FileText className="h-5 w-5 text-gradient-dxc" strokeWidth={2.1} />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">
                  Chat Transcript / Call Summary
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Paste Microsoft Teams chat, Call Transcript, Incident
                  Summary, Troubleshooting Notes or Email conversation.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span>{wordCount} words</span>
              <span className="text-border">·</span>
              <span>{charCount} chars</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Paste conversation here... Include user messages, agent actions and timestamps for best results."
              className="min-h-[350px] resize-y scrollbar-thin leading-relaxed"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              spellCheck={false}
              disabled={isGenerating}
            />
            {!transcript && (
              <button
                type="button"
                onClick={onLoadSample}
                className="absolute bottom-3 right-3 rounded-lg border border-dashed border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-ring/60 transition-colors"
              >
                Load sample transcript ↵
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                ref={txtRef}
                type="file"
                accept=".txt,.log,.md,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = () =>
                      setTranscript(String(r.result ?? ""));
                    r.readAsText(f);
                  }
                }}
              />
              <input
                ref={docxRef}
                type="file"
                accept=".docx,.doc"
                className="hidden"
              />
              <ToolbarButton
                tooltip="Upload TXT file"
                icon={Upload}
                label="Upload TXT"
                onClick={() => txtRef.current?.click()}
                disabled={isGenerating}
              />
              <ToolbarButton
                tooltip="Upload DOCX file"
                icon={FileUp}
                label="Upload DOCX"
                onClick={() => docxRef.current?.click()}
                disabled={isGenerating}
              />
              <ToolbarButton
                tooltip="Paste from clipboard (Ctrl+V)"
                icon={Clipboard}
                label="Paste Clipboard"
                onClick={onPaste}
                disabled={isGenerating}
              />
              <ToolbarButton
                tooltip="Voice input (coming soon)"
                icon={Mic}
                label="Voice Input"
                onClick={() => {}}
                disabled
              />
              <div className="mx-1 hidden h-6 w-px bg-border/70 sm:block" />
              <ToolbarButton
                tooltip="Clear all text"
                icon={Trash2}
                label="Clear"
                onClick={onClear}
                variant="ghost"
                disabled={isGenerating || !transcript}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={simulateGeneration}
                disabled={isGenerating || !transcript.trim()}
                size="lg"
                variant="gradient"
              >
                <Sparkles className="h-4.5 w-4.5" strokeWidth={2.2} />
                {isGenerating ? "Analyzing..." : "Analyze Documentation"}
              </Button>
            </div>
          </div>

          {/* Progress stepper */}
          {(isGenerating || currentStep !== null) && (
            <div className="pt-2">
              <ProgressStepper />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  tooltip,
  disabled,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
  variant?: "default" | "ghost";
}) {
  const base =
    variant === "ghost"
      ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      : "text-foreground/80 hover:bg-card hover:text-foreground";
  const btn = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border border-transparent px-2.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${base}`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
  if (!tooltip) return btn;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
