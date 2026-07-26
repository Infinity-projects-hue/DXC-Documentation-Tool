"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Pencil,
  RefreshCw,
  Download,
  Check,
  FileCog,
  Scale,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAppStore,
  type DocumentationOutput,
  type WorkNotes,
} from "@/store/useAppStore";
import { cn } from "@/lib/utils";

type IconComp = React.ComponentType<{ className?: string; strokeWidth?: number }>;
type Tone = "blue" | "violet" | "orange";

function splitIntoSentences(value: string): string[] {
  return value
    .replace(/\r/g, "")
    .split(/\n+/)
    .flatMap((line) => {
      const cleaned = line
        .trim()
        .replace(/^\s*(?:[>*•-]|\d+[.)])\s*/, "")
        .trim();

      if (!cleaned) return [];

      return (
        cleaned.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) ?? [cleaned]
      )
        .map((sentence) => sentence.trim())
        .filter(Boolean);
    });
}

function quoteLines(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap(splitIntoSentences);
}

function formatQuotedSection(title: string, lines: string[]): string {
  return [title, ...lines.map((line) => `> ${line}`)].join("\n");
}

function buildCombinedClipboardText(output: DocumentationOutput): string {
  return [
    "Work Notes",
    "",
    formatQuotedSection("Issue", quoteLines(output.workNotes.issue)),
    "",
    formatQuotedSection(
      "Troubleshooting Performed",
      quoteLines(output.workNotes.tsPerformed),
    ),
    "",
    formatQuotedSection("Output", quoteLines(output.workNotes.output)),
    "",
    "---",
    "",
    "Resolution Notes",
    "",
    ...quoteLines(output.resolutionNotes).map((line) => `> ${line}`),
  ].join("\n");
}

function useCopyState() {
  const [copied, setCopied] = React.useState<string | null>(null);

  const doCopy = async (id: string, text: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(
        () => setCopied((current) => (current === id ? null : current)),
        1800,
      );
    } catch {
      /* Clipboard access can be unavailable in restricted browser contexts. */
    }
  };

  return { copied, doCopy };
}

export function OutputCards() {
  const output = useAppStore((state) => state.output);
  const isGenerating = useAppStore((state) => state.isGenerating);

  const showSkeleton = isGenerating || !output;
  const showOutput = !!output && !isGenerating;
  const combinedClipboardText = showOutput
    ? buildCombinedClipboardText(output)
    : "";

  return (
    <div className="relative isolate mx-auto w-full max-w-[1440px] overflow-hidden rounded-[32px] border border-border/50 bg-background/60 px-4 py-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl md:px-6 md:py-7">
      <CinematicDocumentationBackdrop />

      <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Generated Documentation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {showOutput
              ? "Structured Work Notes and Resolution Notes below. Every sentence is ServiceNow-ready."
              : showSkeleton
                ? "Your documentation is being generated..."
                : "Paste a transcript or call summary above, then click Analyze."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">Work Notes</Badge>
          <Badge variant="warning">Resolution Notes</Badge>
        </div>
      </div>

      <div className="relative z-10 grid gap-5 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {(showSkeleton || showOutput) && (
            <>
              <OutputCardWrapper
                key="work-notes-issue"
                title="Work Notes · Issue"
                icon={FileCog}
                tone="blue"
                description="Reported symptoms, user impact and ticket context"
                copyText={combinedClipboardText}
                copyEnabled={showOutput}
                delay={0}
              >
                {showOutput ? (
                  <IssueContent data={output.workNotes} />
                ) : (
                  <SkeletonContent lines={[5, 4, 6]} />
                )}
              </OutputCardWrapper>

              <OutputCardWrapper
                key="work-notes-troubleshooting"
                title="Work Notes · Troubleshooting"
                icon={RefreshCw}
                tone="violet"
                description="Verified technical actions and resulting output"
                copyText={combinedClipboardText}
                copyEnabled={showOutput}
                delay={0.08}
              >
                {showOutput ? (
                  <TroubleshootingContent data={output.workNotes} />
                ) : (
                  <SkeletonContent lines={[7, 6, 5]} />
                )}
              </OutputCardWrapper>

              <OutputCardWrapper
                key="resolution-notes"
                title="Resolution Notes"
                icon={Scale}
                tone="orange"
                description="Professional closure notes ready for ServiceNow"
                copyText={combinedClipboardText}
                copyEnabled={showOutput}
                delay={0.16}
              >
                {showOutput ? (
                  <ResolutionContent text={output.resolutionNotes} />
                ) : (
                  <SkeletonContent lines={[5, 6, 5]} paragraph />
                )}
              </OutputCardWrapper>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CinematicDocumentationBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [perspective:1200px]"
    >
      <motion.div
        className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"
        animate={{
          x: [0, 34, 0],
          y: [0, 24, 0],
          scale: [0.92, 1.08, 0.92],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl"
        animate={{
          x: [0, -28, 0],
          y: [0, -22, 0],
          scale: [1.05, 0.9, 1.05],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[14%] top-[-46%] h-[480px] w-[720px] rounded-[42%] border border-sky-500/15 bg-gradient-to-br from-sky-500/10 via-violet-500/5 to-transparent shadow-[0_0_90px_rgba(46,107,230,0.08)] [transform-style:preserve-3d]"
        animate={{
          rotateX: [58, 66, 58],
          rotateY: [-18, 16, -18],
          rotateZ: [0, 10, 0],
          y: [0, 18, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-55%] right-[-12%] h-[430px] w-[600px] rounded-[44%] border border-orange-500/15 bg-gradient-to-tr from-orange-500/10 via-violet-500/5 to-transparent [transform-style:preserve-3d]"
        animate={{
          rotateX: [-54, -62, -54],
          rotateY: [18, -14, 18],
          rotateZ: [0, -12, 0],
          x: [0, -18, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ opacity: [0.15, 0.65, 0.15], scaleX: [0.75, 1, 0.75] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function OutputCardWrapper({
  title,
  description,
  icon: Icon,
  tone,
  children,
  copyText,
  copyEnabled,
  delay,
}: {
  title: string;
  description: string;
  icon: IconComp;
  tone: Tone;
  children: React.ReactNode;
  copyText: string;
  copyEnabled: boolean;
  delay: number;
}) {
  const toneAccent = {
    blue: "from-sky-500/20 via-sky-500/10 to-transparent text-sky-700 dark:text-sky-300",
    violet:
      "from-violet-500/20 via-violet-500/10 to-transparent text-violet-700 dark:text-violet-300",
    orange:
      "from-orange-500/25 via-orange-500/10 to-transparent text-orange-700 dark:text-orange-300",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -6, rotateX: 1.2, rotateY: -1.2 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="h-full [transform-style:preserve-3d]"
    >
      <Card className="relative flex h-full min-h-[460px] flex-col overflow-hidden border-border/70 bg-background/80 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <motion.div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b ${toneAccent}`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${toneAccent} ring-1 ring-border/60 shadow-sm`}
                animate={{ rotateY: [0, 10, 0], rotateX: [0, -6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="h-5.5 w-5.5" strokeWidth={2.1} />
              </motion.div>
              <div>
                <CardTitle className="text-base md:text-[17px]">
                  {title}
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {description}
                </CardDescription>
              </div>
            </div>
            <CardActionsBar
              cardKey={title}
              copyText={copyText}
              copyEnabled={copyEnabled}
            />
          </div>
        </CardHeader>
        <Separator className="opacity-60" />
        <CardContent className="relative flex-1 pt-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function CardActionsBar({
  cardKey,
  copyText,
  copyEnabled,
}: {
  cardKey: string;
  copyText: string;
  copyEnabled: boolean;
}) {
  const { copied, doCopy } = useCopyState();
  const copyId = `copy-${cardKey}`;
  const actions = [
    {
      id: copyId,
      icon: Copy,
      label: "Copy Work Notes and Resolution Notes",
      onClick: () => doCopy(copyId, copyText),
      active: copied === copyId,
      disabled: !copyEnabled,
    },
    {
      id: `edit-${cardKey}`,
      icon: Pencil,
      label: "Edit",
      onClick: () => {},
      disabled: false,
    },
    {
      id: `regen-${cardKey}`,
      icon: RefreshCw,
      label: "Regenerate",
      onClick: () => {},
      disabled: false,
    },
    {
      id: `dl-${cardKey}`,
      icon: Download,
      label: "Download",
      onClick: () => {},
      disabled: false,
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/70 p-1 shadow-sm backdrop-blur">
      {actions.map(
        ({ id, icon: ActionIcon, label, onClick, active, disabled }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/15 hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
                  active && "text-emerald-600 dark:text-emerald-400",
                )}
                aria-label={label}
              >
                {active ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ActionIcon className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ),
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  );
}

function QuoteLines({
  lines,
  tone = "blue",
}: {
  lines: string[];
  tone?: Tone;
}) {
  const quoteTone = {
    blue: "text-sky-700 dark:text-sky-300",
    violet: "text-violet-700 dark:text-violet-300",
    orange: "text-orange-700 dark:text-orange-300",
  }[tone];

  return (
    <div className="space-y-3">
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className="text-[14px] leading-7 text-foreground/90"
        >
          <span className={cn("mr-2 font-semibold", quoteTone)}>&gt;</span>
          {line}
        </p>
      ))}
    </div>
  );
}

function IssueContent({ data }: { data: WorkNotes }) {
  return (
    <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-background/60 to-transparent p-4">
      <SectionLabel>Issue</SectionLabel>
      <QuoteLines lines={quoteLines(data.issue)} tone="blue" />
    </div>
  );
}

function TroubleshootingContent({ data }: { data: WorkNotes }) {
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-background/60 to-transparent p-4">
        <SectionLabel>Troubleshooting Performed</SectionLabel>
        <QuoteLines lines={quoteLines(data.tsPerformed)} tone="violet" />
      </div>

      <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-background/60 to-transparent p-4">
        <SectionLabel>Output</SectionLabel>
        <QuoteLines lines={quoteLines(data.output)} tone="blue" />
      </div>
    </div>
  );
}

function ResolutionContent({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex-1 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-background/60 to-transparent p-5 dark:bg-orange-500/10">
        <SectionLabel>ServiceNow Ready</SectionLabel>
        <QuoteLines lines={quoteLines(text)} tone="orange" />
      </div>
      <div className="mt-auto flex items-center justify-between text-[11.5px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Badge variant="success" className="text-[10.5px]">
            ✓ Quality Pass
          </Badge>
          <span>{text.length} chars</span>
        </div>
        <span>Copies together with Work Notes</span>
      </div>
    </div>
  );
}

function SkeletonContent({
  lines,
  paragraph = false,
}: {
  lines: number[];
  paragraph?: boolean;
}) {
  const widths = [82, 68, 91, 74, 87, 63];

  return (
    <div className="flex flex-col gap-5">
      {lines.map((lineCount, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          <div className="h-2.5 w-28 rounded-full bg-muted animate-pulse" />
          <div
            className={cn(
              "space-y-2.5 rounded-2xl border border-border/60 bg-muted/20 p-4",
              paragraph && "min-h-[180px]",
            )}
          >
            {Array.from({ length: Math.max(2, Math.floor(lineCount / 2)) }).map(
              (_, lineIndex) => (
                <div key={lineIndex} className="flex items-center gap-2">
                  <div className="h-2.5 w-2 rounded-full bg-muted-foreground/35 animate-pulse" />
                  <div
                    className="h-2.5 rounded-full bg-muted animate-pulse"
                    style={{
                      width: `${widths[(sectionIndex + lineIndex) % widths.length]}%`,
                    }}
                  />
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
