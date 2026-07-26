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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore, type WorkNotes } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

type IconComp = React.ComponentType<{ className?: string; strokeWidth?: number }>;

function useCopyState() {
  const [copied, setCopied] = React.useState<string | null>(null);
  const doCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((x) => (x === id ? null : x)), 1800);
    } catch {
      /* ignore */
    }
  };
  return { copied, doCopy };
}

export function OutputCards() {
  const output = useAppStore((s) => s.output);
  const isGenerating = useAppStore((s) => s.isGenerating);

  const showSkeleton = isGenerating || !output;
  const showOutput = !!output && !isGenerating;

  return (
    <div className="relative mx-auto w-full max-w-[1440px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Generated Documentation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {showOutput
              ? "Structured Work Notes and Resolution Notes below. Click to copy."
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

      <div className="grid gap-6 xl:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {(showSkeleton || showOutput) && (
            <>
              {/* Work Notes - takes 3 cols, full content layout with Issue > TS Performed > Output > Next Action */}
              <OutputCardWrapper
                key="work-notes"
                title="Work Notes"
                icon={FileCog}
                tone="blue"
                description="Issue · TS Performed · Output · Next Action — ready to paste"
                className="xl:col-span-3"
              >
                {showOutput ? (
                  <WorkNotesContent data={output.workNotes} />
                ) : (
                  <SkeletonContent lines={[7, 5, 6, 5]} />
                )}
              </OutputCardWrapper>

              {/* Resolution Notes - takes 2 cols as separate box */}
              <OutputCardWrapper
                key="resolution"
                title="Resolution Notes"
                icon={Scale}
                tone="orange"
                description="Short paragraph — ready for ServiceNow"
                className="xl:col-span-2"
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

function OutputCardWrapper({
  title,
  description,
  icon: Icon,
  tone,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: IconComp;
  tone: "blue" | "orange";
  children: React.ReactNode;
  className?: string;
}) {
  const toneAccent = {
    blue: "from-sky-500/20 via-sky-500/10 to-transparent text-sky-700 dark:text-sky-300",
    orange:
      "from-orange-500/25 via-orange-500/10 to-transparent text-orange-700 dark:text-orange-300",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={className}
    >
      <Card className="relative flex h-full min-h-[420px] flex-col overflow-hidden">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${toneAccent} opacity-90`}
        />
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${toneAccent} ring-1 ring-border/60 shadow-sm`}
              >
                <Icon className="h-5.5 w-5.5" strokeWidth={2.1} />
              </div>
              <div>
                <CardTitle className="text-base md:text-[17px]">
                  {title}
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {description}
                </CardDescription>
              </div>
            </div>
            <CardActionsBar cardKey={title} />
          </div>
        </CardHeader>
        <Separator className="opacity-60" />
        <CardContent className="relative flex-1 pt-5">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CardActionsBar({ cardKey }: { cardKey: string }) {
  const { copied, doCopy } = useCopyState();
  const actions = [
    {
      id: `copy-${cardKey}`,
      icon: Copy,
      label: "Copy",
      onClick: () => doCopy(`copy-${cardKey}`, `[${cardKey}] copied`),
      active: copied === `copy-${cardKey}`,
    },
    { id: `edit-${cardKey}`, icon: Pencil, label: "Edit", onClick: () => {} },
    {
      id: `regen-${cardKey}`,
      icon: RefreshCw,
      label: "Regenerate",
      onClick: () => {},
    },
    {
      id: `dl-${cardKey}`,
      icon: Download,
      label: "Download",
      onClick: () => {},
    },
  ];
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/70 p-1 shadow-sm backdrop-blur">
      {actions.map(({ id, icon: I, label, onClick, active }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/15 hover:text-foreground",
                active && "text-emerald-600 dark:text-emerald-400",
              )}
              aria-label={label}
            >
              {active ? (
                <Check className="h-4 w-4" />
              ) : (
                <I className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="h-1 w-1 rounded-full bg-gradient-to-br from-sky-500 via-orange-500 to-violet-500" />
        {label}
      </div>
      <div className="pl-2.5 text-[14px] leading-relaxed text-foreground/90 border-l border-border/60">
        {children}
      </div>
    </div>
  );
}

function WorkNotesContent({ data }: { data: WorkNotes }) {
  return (
    <div className="flex flex-col gap-5">
      <Section label="Issue">
        <p className="pt-0.5">{data.issue}</p>
      </Section>
      <Section label="TS Performed">
        <ul className="space-y-2 pt-0.5">
          {data.tsPerformed.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[9px] inline-flex h-1.5 w-1.5 shrink-0 items-center justify-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-dxc-gradient" />
              </span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section label="Output">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-[13.5px] pt-2.5">
          {data.output}
        </div>
      </Section>
      <Section label="Next Action">
        <div className="rounded-xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-3 text-[13.5px] pt-2.5 dark:bg-sky-500/10">
          {data.nextAction}
        </div>
      </Section>
    </div>
  );
}

function ResolutionContent({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex-1 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-background/40 to-transparent p-5 dark:bg-orange-500/10">
        <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">
          <span className="h-1 w-1 rounded-full bg-dxc-gradient" />
          ServiceNow Ready
        </div>
        <p className="text-[14.5px] leading-[1.75] text-foreground/95">
          “{text}”
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between text-[11.5px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Badge variant="success" className="text-[10.5px]">
            ✓ Quality Pass
          </Badge>
          <span>{text.length} chars</span>
        </div>
        <span>Paste into Resolution Notes field</span>
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
  return (
    <div className="flex flex-col gap-5">
      {lines.map((len, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            Section {i + 1}
          </div>
          {paragraph ? (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-2.5 rounded-full bg-muted animate-pulse"
                  style={{ width: `${65 + Math.random() * 32}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2 border-l border-border/50 pl-2.5">
              {Array.from({ length: Math.max(2, Math.floor(len / 2)) }).map(
                (_, idx) => (
                  <div
                    key={idx}
                    className="h-2.5 rounded-full bg-muted animate-pulse"
                    style={{ width: `${55 + Math.random() * 40}%` }}
                  />
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
