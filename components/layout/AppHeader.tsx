"use client";

import { motion } from "framer-motion";
import { DxcLogo } from "@/components/brand/DxcLogo";

export function AppHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="glass-header sticky top-0 z-40 w-full border-b border-border/60"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center px-4 md:h-[72px] md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-3.5">
          <DxcLogo className="h-8 w-auto md:h-[38px]" />
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-border/80 to-transparent" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[14px] font-semibold tracking-tight md:text-[15px]">
              Service Desk{" "}
              <span className="text-gradient-dxc">Documentation Assistant</span>
            </span>
            <span className="truncate text-[10.5px] text-muted-foreground md:text-[11.5px]">
              Convert chats · tickets · transcripts to ITSM notes
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
