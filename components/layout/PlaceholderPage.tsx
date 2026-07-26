"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Hammer, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  hint,
  status,
}: {
  eyebrow: string;
  title: string;
  description: string;
  hint: string;
  status: "Coming Soon" | "In Progress";
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] flex-col px-6 py-10 md:px-10 md:py-16">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 w-fit gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(46,107,230,0.14) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(255,122,26,0.14) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(139,78,230,0.14) 0%, transparent 50%)",
            }}
          />
          <CardHeader className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </div>
              <CardTitle className="mt-1 text-2xl md:text-3xl">
                {title}
              </CardTitle>
              <CardDescription className="mt-2 max-w-xl text-sm md:text-base">
                {description}
              </CardDescription>
            </div>
            <Badge
              variant={status === "In Progress" ? "warning" : "info"}
              className="w-fit gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              {status}
            </Badge>
          </CardHeader>
          <CardContent className="relative grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3 space-y-4 text-sm text-muted-foreground">
              <p className="rounded-2xl border border-border/70 bg-card/70 p-4 text-foreground/90">
                <span className="mr-1.5 inline-flex items-center rounded-lg bg-dxc-gradient-soft px-2 py-0.5 text-xs font-semibold ring-1 ring-border/60">
                  Phased Rollout
                </span>
                {hint}
              </p>
              <ul className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 text-foreground/85">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-sky-500 to-violet-500" />
                  Phase 1-2 — Responsive layout + themes are live today.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-orange-500 to-rose-500" />
                  Phase 3 — Supabase auth, RLS, tables next.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500" />
                  Phase 4+ — OpenAI streaming, export DOCX/PDF, analytics.
                </li>
              </ul>
            </div>
            <div className="md:col-span-2 flex items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-border/60 bg-gradient-to-br from-background to-card shadow-card">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-3xl bg-dxc-gradient opacity-15 blur"
                />
                <Hammer className="relative h-16 w-16 text-gradient-dxc" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
