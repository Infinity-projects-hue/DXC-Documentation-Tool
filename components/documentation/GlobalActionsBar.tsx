"use client";

import { motion } from "framer-motion";
import { Mail, BookOpenCheck, FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalActionsBar() {
  const output = useAppStore((s) => s.output);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const disabled = !output || isGenerating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="fixed bottom-0 inset-x-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-xl shadow-[0_-8px_32px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {output && !isGenerating ? (
            <Badge variant="success" className="gap-1.5 text-[11.5px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Documentation ready
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11.5px]">
              Awaiting output
            </Badge>
          )}
          <span
            className={cn(
              "hidden truncate text-[12px] text-muted-foreground transition-opacity md:inline",
              output && !isGenerating ? "opacity-100" : "opacity-80",
            )}
          >
            {output && !isGenerating
              ? "Work Notes and Resolution Notes generated. Export below."
              : "Paste a transcript and click Analyze Documentation to begin."}
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 overflow-x-auto scrollbar-thin">
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            className="shrink-0"
          >
            <Mail className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Customer Email</span>
            <span className="sm:hidden">Email</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            className="shrink-0"
          >
            <BookOpenCheck className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">KB Article</span>
            <span className="sm:hidden">KB</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            className="shrink-0"
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Export DOCX</span>
            <span className="sm:hidden">DOCX</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            className="shrink-0"
          >
            <FileDown className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
