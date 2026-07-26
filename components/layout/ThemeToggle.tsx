"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Option = "light" | "dark" | "system";

const options: { value: Option; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const active = (mounted ? theme ?? "system" : "system") as Option;

  const activeIndex = options.findIndex((o) => o.value === active);
  const bgLeft =
    activeIndex === 0 ? "4px" : activeIndex === 1 ? "calc(33.33% + 2px)" : "calc(66.66% + 0px)";
  const bgWidth = "calc(33.33% - 6px)";

  return (
    <div
      className={cn(
        "relative inline-flex h-10 items-center rounded-2xl border border-border/70 bg-secondary/60 p-1 shadow-inner",
        className,
      )}
    >
      {mounted && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 rounded-xl bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 ease-out"
          style={{ left: bgLeft, width: bgWidth }}
        />
      )}
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = mounted && active === value;
        return (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "relative z-10 inline-flex h-8 w-[calc((100%-8px)/3)] items-center justify-center gap-1.5 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80",
                )}
                aria-label={`Set theme to ${label}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label} theme</TooltipContent>
          </Tooltip>
        );
      })}
      <span className="sr-only">
        Current: {mounted ? `${active}${resolvedTheme ? ` (${resolvedTheme})` : ""}` : "loading"}
      </span>
    </div>
  );
}
