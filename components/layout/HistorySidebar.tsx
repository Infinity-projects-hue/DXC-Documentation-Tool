"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PanelLeftClose,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon,
  MessageSquare,
  Mail,
  Lock,
  Wifi,
  Printer,
  FileText,
  CloudOff,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, relativeTime } from "@/lib/utils";
import type { DocumentationOutput } from "@/store/useAppStore";

export type IconTone = "blue" | "orange" | "purple" | "green" | "red" | "slate";

export interface HistoryEntry {
  id: string;
  title: string;
  createdAt: Date;
  priority: "High" | "Medium" | "Low";
  agent: string;
  application?: string;
  tags: string[];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconTone: IconTone;
  summary: string;
  originalTranscript: string;
  output: DocumentationOutput;
}

const toneMap: Record<IconTone, { bg: string; ring: string; text: string }> = {
  blue: {
    bg: "bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-transparent",
    ring: "ring-sky-500/25",
    text: "text-sky-700 dark:text-sky-300",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-500/25 via-orange-500/10 to-transparent",
    ring: "ring-orange-500/25",
    text: "text-orange-700 dark:text-orange-300",
  },
  purple: {
    bg: "bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent",
    ring: "ring-violet-500/25",
    text: "text-violet-700 dark:text-violet-300",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent",
    ring: "ring-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  red: {
    bg: "bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-transparent",
    ring: "ring-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-500/15 via-slate-500/5 to-transparent",
    ring: "ring-slate-500/20",
    text: "text-slate-700 dark:text-slate-300",
  },
};

function priorityBadgeVariant(p: HistoryEntry["priority"]) {
  switch (p) {
    case "High":
      return "destructive";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
  }
}

const today = new Date("2026-07-26T10:30:00Z");
const yesterday = new Date("2026-07-25T15:10:00Z");
const twoDays = new Date("2026-07-24T09:20:00Z");
const threeDays = new Date("2026-07-23T17:40:00Z");

const DEFAULT_TRANSCRIPT = `[10:12] Analyst: Good morning! Thanks for reaching out to DXC Service Desk. I see you are logged in as John Carter from the Finance team. Before I dive in — are you on a laptop on-site, or working remote via VPN?
[10:12] User: Hi. I'm remote on my DXC laptop. Outlook keeps popping up asking me to re-enter my Windows credentials every 5 to 10 minutes, and then I get disconnected from Exchange. Very disruptive — I need this fixed before my client call at 11am.
[10:13] Analyst: Understood, let's sort this. Can you tell me exactly what the credential prompt says?
[10:13] User: The Windows Security box that says "Windows Security: Enter your credentials for Microsoft Outlook". Username is populated as john.carter@dxc.example. Password field is blank. When I enter my password it works for ~10min then it prompts again.
[10:14] Analyst: Ok thanks. This pattern is very common when Modern Auth breaks on the tenant or on the local credential cache. A few checks with you then a clean reset of the Outlook client profile should resolve.
[10:14] Analyst: First — are you currently connected on corporate VPN or on-site?
[10:14] User: Corporate VPN (GlobalProtect), connected for ~2 hours already, no disconnection reported. Teams + drive mapping are fine, only Outlook has the issue.
[10:15] Analyst: Perfect, so reachability is fine. Quick questions: 1) Are you seeing a balloon about "Need Password" / "Type Exchange password" in bottom-right? 2) Is Outlook showing "Trying to connect…" or "Disconnected" in status bar?
[10:16] User: Yes, exactly — "Need Password" yellow banner. And status alternates between "Trying to connect" and "Connected to: Microsoft Exchange".
[10:17] Analyst: Thanks — that's classic token expiry / modern-auth glitch. Let's walk through the cleanest resolution path together:

Step A — Clear the remembered credential from Credential Manager
Step B — Start Outlook with the /resetnavpane switch
Step C — Rebuild local OST if needed
Step D — Verify Modern Auth in registry + confirm via EXO RPS

Shall we do A first?

[10:18] User: Yes please, walk me through Step A.
[10:18] Analyst: In the Windows 11 Start search, type Credential Manager. Open the Control Panel one (not Settings). Click Windows Credentials. Under Generic Credentials — look for anything with "MicrosoftOffice16", "Outlook", "Microsoft365", or your UPN. Remove each one you find. I'll stay with you while you do that.
[10:22] User: Deleted 4 entries: MicrosoftOffice16_Data:orgid:xxxxx, Live ID, and my UPN cached twice. Done.
[10:22] Analyst: Excellent. Keep Credential Manager open, don't close it yet.

Step B — Close Outlook fully (from tray: right-click Outlook icon → Close Outlook). Then press Win+R and paste:
  outlook.exe /resetnavpane
then OK.

[10:25] User: Outlook opened. It didn't prompt for credentials this time. Status bar now shows "Connected to Microsoft Exchange".
[10:26] Analyst: Great — half-way there. Let me remote check EXO for your tenant so this doesn't recur. Please accept my MSRA remote assistance invitation.
[10:29] User: Accepted. Screen shared.
[10:30] Analyst: Remote diagnostics complete — Modern Auth is already enabled tenant-wide. Your user's auth tokens actually expired at 10:02 (10min before you opened the ticket) which perfectly matches when your prompts began. There was a minor token refresh glitch on the endpoint. I've also ensured your profile won't fall back to basic auth by setting:
  HKCU\\Software\\Microsoft\\Office\\16.0\\Common\\Identity\\EnableADAL → DWORD 1
  HKCU\\Software\\Microsoft\\Office\\16.0\\Outlook\\AutoDiscover\\ExcludeExplicitO365Endpoint → DWORD 0
[10:32] Analyst: All set. I'll keep it open another 5 minutes — please send an email to the test mailbox I just put on your Notepad. If no credential prompt fires in 10min you are clear. If it does, I'll rebuild the OST with you.
[10:38] User: Test email sent & received. No credential prompts in 6 minutes. Looks solid! What's the next step / should I close MSRA now?
[10:39] Analyst: Perfect! Next step for you — no action needed from your side. If the issue recurs within the next 24 hours, reply to the ticket notification to re-open — otherwise the incident closes automatically tomorrow morning. You can safely end MSRA now. Thanks for your time today, enjoy the rest of your morning!
[10:40] User: Thank you! 🎉`;

export const historySeed: HistoryEntry[] = [
  {
    id: "inc-outlook-001",
    title: "Outlook keeps prompting for credentials",
    createdAt: today,
    priority: "High",
    agent: "Alex Chen",
    application: "Microsoft Outlook / Microsoft 365",
    tags: ["Outlook", "Modern Auth", "Credential Manager"],
    icon: Mail,
    iconTone: "blue",
    summary:
      "Cleared stale Office365 tokens from Credential Manager, reset navigation pane, confirmed Modern Auth enabled tenant-wide.",
    originalTranscript: DEFAULT_TRANSCRIPT,
    output: {
      workNotes: {
        issue:
          "User (John Carter / Finance / remote on GlobalProtect VPN) experiencing repeated Windows Security credential prompts in Outlook every 5–10 minutes, accompanied by the yellow 'Need Password' banner in the notification area and status bar alternating between 'Trying to connect' and 'Connected to: Microsoft Exchange'. Issue began ~10:05 and is blocking client call at 11:00. All other Office + network services (Teams, drive mapping, VPN) remain functional.",
        tsPerformed: [
          "Verified VPN reachability and confirmed single-service impact (Outlook only — Teams + SMB OK) to rule out general network/auth outage.",
          "Walked user through Credential Manager → Windows Credentials → removed 4 stale cached Generic Credentials under Office 2016/365 family.",
          "Closed Outlook via tray and relaunched with `outlook.exe /resetnavpane` to clean stale navigation state before fresh auth attempt.",
          "Obtained MSRA remote share to validate client-side registry overrides: HKCU\\…\\Identity\\EnableADAL=1 and HKCU\\…\\AutoDiscover\\ExcludeExplicitO365Endpoint=0.",
          "Remote-verified via EXO that Modern Auth is enabled tenant-wide and correlated user's token expiry at 10:02 with start of prompts.",
          "Sent a test email + user confirmed send & receive OK with no credential prompts in 6-minute observation window.",
        ],
        output:
          "No credential prompts in 6-minute observation window after Credential Manager clear + /resetnavpane + ADAL registry assurance. Status bar steady on 'Connected to Microsoft Exchange'. Send/receive validated via test mailbox. Root cause: user-specific refresh-token glitch (tokens expired at 10:02) — no tenant-wide change needed.",
        nextAction:
          "Close ticket automatically tomorrow morning if no user reply. Instruct user to reply to notification within 24h to re-open if prompts recur; next escalation tier: ExO — rebuild local OST, then engage EXO Service Delivery for targeted token revocation if needed.",
      },
      resolutionNotes:
        "Resolved — multiple credential prompts every 5–10 minutes caused by stale Microsoft 365 authentication tokens on the local endpoint. Technician cleared 4 Generic Credentials under Credential Manager, launched Outlook with /resetnavpane, remotely validated that Modern Authentication is enabled tenant-wide via Exchange Online and ensured correct ADAL/AutoDiscover registry values on the user's HKCU hive. Send/receive was validated with a test mailbox and the 6-minute observation window completed with no credential prompts. Root cause: user-specific refresh-token expiry with minor refresh glitch. Escalation path documented: OST rebuild then EXO Service Delivery for targeted revocation.",
      rca: {
        rootCause:
          "Microsoft 365 refresh token for the user's UPN silently expired at 10:02 with a transient refresh glitch. Because Outlook cached a stale set of Generic Credentials (including duplicate UPN entries), every auto-discovery triggered a repeated prompt rather than falling through to the broker silently.",
        impact:
          "Single-user impact on Finance John Carter. Approx. 35 minutes of degraded productivity with intermittent disconnection before the ticket. No other users reported same symptoms, so no tenant-level blast radius, but blocked a client call scheduled at 11:00.",
        correctiveAction:
          "Credential Manager clear of Office / Generic UPN entries; Outlook /resetnavpane launch; HKCU registry values for EnableADAL=1 and ExcludeExplicitO365Endpoint=0 to guarantee Modern Auth always takes the broker path; 6-min verification window with test mailbox.",
        preventiveAction:
          "Add Credential Manager stale-token hygiene script to Monthly Device Health remediation run. Expose a Modern-Auth health badge (including registry state) in the Endpoint portal for analysts. Review AutoDiscover exclusions globally; if similar patterns grow, escalate to EXO Service Delivery to temporarily reduce token lifetime on affected users.",
      },
    },
  },
  {
    id: "inc-vpn-002",
    title: "VPN Error 691 — Remote access connection denied",
    createdAt: today,
    priority: "High",
    agent: "Priya Kapoor",
    application: "Pulse Secure VPN",
    tags: ["VPN", "AD Account", "Lockout"],
    icon: Wifi,
    iconTone: "orange",
    summary:
      "Unlocked AD account, verified NPS policy and forced password change via Self-Service portal.",
    originalTranscript:
      "[09:12] Analyst: Hi Aisha, let me check your AD status.\n[09:13] User: VPN RAS Error 691 every time I connect. Credentials are correct.\n[09:14] Analyst: Account was locked at 09:10 from 3 bad attempts. Unlocked; also forcing SSPR.\n[09:20] User: Changed password, VPN connected successfully. ✓\n",
    output: {
      workNotes: {
        issue:
          "User reports Pulse Secure VPN Error 691 (Remote Access Connection Denied) with correct credentials. Unable to work remotely.",
        tsPerformed: [
          "Checked Active Directory — account locked at 09:10 after 3 failed RADIUS attempts.",
          "Unlocked account via ADUC, confirmed no disable/expiry flags.",
          "Directed user through SSPR password change to clear any bad cached passwords.",
          "Verified NPS Access Policies allow VPN group for the user's OU.",
        ],
        output:
          "VPN session established successfully after SSPR. NPS logs show MS-CHAPv2 success.",
        nextAction:
          "Close ticket 24h post-resolution; advise user to update stored credentials on any mobile clients.",
      },
      resolutionNotes:
        "Error 691 resolved — AD account was locked out after 3 failed RADIUS attempts on Pulse Secure. Analyst unlocked the account and guided the user through a Self-Service Password Reset to remove any stale cached credentials on mobile devices; NPS policy verified and VPN session successfully established post-reset.",
      rca: {
        rootCause:
          "Mobile client with stale cached password caused repeated RADIUS auth failures, leading to automatic AD account lockout after 3 failed attempts.",
        impact: "Single user remote access outage, approx 25 min until resolved.",
        correctiveAction:
          "AD unlock + SSPR; notify user to update device credentials.",
        preventiveAction:
          "Tune AD lockout threshold for VPN; enable lockout alerts on SIEM dashboard.",
      },
    },
  },
  {
    id: "inc-adlock-003",
    title: "Active Directory account keeps locking out",
    createdAt: yesterday,
    priority: "Medium",
    agent: "Marcus Lee",
    application: "Active Directory / Azure AD",
    tags: ["AD Connect", "Lockout", "Mobile"],
    icon: Lock,
    iconTone: "red",
    summary:
      "Used LockoutStatus to trace bad password source → old iOS mail profile re-polling stale creds.",
    originalTranscript:
      "[15:10] User: My account locked 3 times in 2 hours.\n[15:11] Analyst: LockoutStatus shows origin Caller Computer: PRD-MOB-IRIS-01 (Microsoft-Server-ActiveSync).\n[15:15] Analyst: Remote wiped the stale iOS mail profile and enrolled Intune Company Portal.\n[15:25] User: No locks in 10 min. Good.\n",
    output: {
      workNotes: {
        issue:
          "User's AD account locking out every 30–40 minutes. User claims no password typos.",
        tsPerformed: [
          "Pulled LockoutStatus.exe results and correlated badPwdCount against DC logs.",
          "Traced lockout source to legacy iOS mail profile on PRD-MOB-IRIS-01 (EAS).",
          "Removed stale Exchange ActiveSync device partnership.",
          "Enrolled user into Intune Company Portal; installed Outlook Mobile + CA-compliant profile.",
        ],
        output:
          "No lockouts in 10-minute observation post-Intune migration; badPwdCount=0 on all DCs.",
        nextAction:
          "Schedule 3-day follow-up via ticket, close if clean. Advise users with legacy mail clients to migrate.",
      },
      resolutionNotes:
        "Repeated AD account lockouts traced to a stale iOS native-mail profile submitting expired credentials via Microsoft-Server-ActiveSync. Legacy device partnership was removed from EXO and the user was migrated to Intune Company Portal + Outlook Mobile, eliminating the bad-password source. No lockouts observed post-migration.",
      rca: {
        rootCause:
          "Password changed on 2026-07-20 but native iOS mail profile still cached old password; every EAS heartbeat was interpreted as bad password.",
        impact: "Approx 4 lockout events in 2 hours, service degraded.",
        correctiveAction: "Remove old device partnership + migrate to Intune-managed Outlook Mobile.",
        preventiveAction: "Block legacy ActiveSync for Pilot groups; enforce Conditional Access Require Compliant Device.",
      },
    },
  },
  {
    id: "inc-print-004",
    title: "Network printer not showing duplex option",
    createdAt: yesterday,
    priority: "Low",
    agent: "Sofia Alvarez",
    application: "PaperCut MF 633 on Floor 3",
    tags: ["Print", "Driver"],
    icon: Printer,
    iconTone: "slate",
    summary:
      "Re-installed v4 class driver from print server and re-mapped via PaperCut MF client.",
    originalTranscript:
      "[17:42] User: I can't duplex. Driver shows 'Basic' features only.\n[17:43] Analyst: Wrong driver; switching to Xerox V4 Global PS via \\PRINT-03\\PRT-F3-RICOH633.\n[17:48] User: Duplex + staple options now available. ✓\n",
    output: {
      workNotes: {
        issue:
          "Duplex and staple options missing in Office apps for PRT-F3-RICOH633.",
        tsPerformed: [
          "Uninstalled current in-box Class driver via printui /s /t2.",
          "Mapped queue via FQDN print server share → pulled v4 Xerox Global PS.",
          "Test job: duplex + staple output confirmed via operator console.",
        ],
        output: "Duplex, staple and booklet modes now visible in Office + Acrobat.",
        nextAction: "Close ticket. Monitor queue; package driver in Intune Win32 app.",
      },
      resolutionNotes:
        "Missing advanced printer features resolved by replacing the Windows in-box driver with the Xerox V4 Global PostScript driver served from the print server share. Queue was re-mapped via FQDN and a test duplex + staple job was successfully output.",
      rca: {
        rootCause: "In-box driver is feature-stripped; does not expose device options.",
        impact: "User convenience; cosmetic / productivity.",
        correctiveAction: "Install v4 driver from print server share.",
        preventiveAction: "Package v4 driver as Intune Win32 app; retire in-box assignment.",
      },
    },
  },
  {
    id: "inc-excel-005",
    title: "Excel Power Query refresh extremely slow",
    createdAt: twoDays,
    priority: "Medium",
    agent: "Tom Nguyen",
    application: "Excel 2016 32-bit → 64-bit",
    tags: ["Excel", "Power Query", "M365"],
    icon: FileText,
    iconTone: "green",
    summary:
      "Migrated from Office 32-bit to 64-bit and enabled background analysis + Fast Combine.",
    originalTranscript:
      "[09:22] User: Sales dashboard refresh took 2h45 yesterday.\n[09:23] Analyst: Running 32-bit Excel on a 250k-row dataset. Moving to 64-bit.\n[09:38] Analyst: Switched O365 channel; enabled Fast Combine; backgroundAnalysis=true.\n[09:40] User: Same file now refreshes in 7 min. Thank you!\n",
    output: {
      workNotes: {
        issue:
          "Excel Power Query refresh runs 2+ hours on 250k-row sales dataset.",
        tsPerformed: [
          "Validated dataset size (258k rows × 47 cols, 38MB xlsx).",
          "Switched Office installation from 32-bit to 64-bit via ODT XML.",
          "Set PrivacyLevels.AlwaysIgnorePrivacy + EnableFolding = True.",
          "Verified refresh post-upgrade: 7 minutes 12 seconds vs 2h45m.",
        ],
        output:
          "Refresh completes in ~7 min; enabled Query Dependencies UI; M-query column folds to SQL.",
        nextAction:
          "Share Power Query best-practice deck; recommend incremental refresh in PBI.",
      },
      resolutionNotes:
        "Excel 32-bit was constraining the Power Query mashup engine memory, which serialised all joins and prevented query folding. Analyst migrated Office C2R to 64-bit, enabled Fast Combine, and forced folding of the fact-table filter to the SQL source. Refresh time dropped from ~2h45m to ~7m.",
      rca: {
        rootCause:
          "32-bit Office install with large M-mashup → GC thrashing + no folding on SQL source.",
        impact: "User blocked daily reconciliation tasks.",
        correctiveAction: "64-bit O365 + Fast Combine + folding hints.",
        preventiveAction: "Standardise 64-bit for Analyst BU; add memory baseline in Intune device compliance script.",
      },
    },
  },
  {
    id: "inc-onedrive-006",
    title: "OneDrive sync stuck 'Processing changes'",
    createdAt: threeDays,
    priority: "Medium",
    agent: "Sam Rivera",
    application: "OneDrive for Business",
    tags: ["OneDrive", "Sync"],
    icon: CloudOff,
    iconTone: "purple",
    summary:
      "Cleared Office Upload Centre cache, reset OneDrive via /reset switch and re-linked the sync root.",
    originalTranscript:
      "[17:40] User: OneDrive shows 'Processing changes' for 4 hours.\n[17:41] Analyst: Clearing Upload Center cache + run OneDrive.exe /reset.\n[17:46] Analyst: Re-linked OneDrive Business. \n[17:50] User: Files syncing green ticks. ✓\n",
    output: {
      workNotes: {
        issue: "OneDrive for Business stuck on 'Processing changes' status for 4+ hours.",
        tsPerformed: [
          "Killed Office Upload Centre and Groove.exe and cleared %localappdata%\\Microsoft\\Office\\16.0\\OfficeFileCache.",
          "Ran OneDrive.exe /reset to reset the sync engine state.",
          "Unlinked Work/School account and re-linked user's UPN.",
          "Resumed sync — 14,220 files remapped; only 3 conflicts (auto-resolved with latest server copy).",
        ],
        output:
          "Full green status — 14,220 files in sync with no conflicts after ~8 minutes.",
        nextAction:
          "Enable 'Always keep on this device' for critical folders; monitor Known Folder Move.",
      },
      resolutionNotes:
        "OneDrive 'Processing changes' resolved by flushing the Office Upload Centre file cache, running `OneDrive.exe /reset`, and re-linking the user's Work/School account. 14,220 files successfully synced back; minor server-wins conflict resolution on 3 files.",
      rca: {
        rootCause:
          "Corrupt %localappdata% OfficeFileCache caused sync engine deadlock with stale LCK files.",
        impact: "Single user sync outage ~4h.",
        correctiveAction: "Clear cache + OneDrive.exe /reset + relink.",
        preventiveAction:
          "Enable Known Folder Move policies; add proactive OneDrive health monitoring (OD Health API).",
      },
    },
  },
];

export function HistorySidebar({
  className,
  open,
  onClose,
  onSelect,
  selectedId,
}: {
  className?: string;
  open: boolean;
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  selectedId?: string;
}) {
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<
    "All" | HistoryEntry["priority"]
  >("All");

  const filtered = React.useMemo(() => {
    return historySeed.filter((e) => {
      if (priorityFilter !== "All" && e.priority !== priorityFilter) return false;
      if (search.trim().length === 0) return true;
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        (e.application ?? "").toLowerCase().includes(q) ||
        e.agent.toLowerCase().includes(q)
      );
    });
  }, [search, priorityFilter]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        ) : null}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "group fixed z-40 top-16 bottom-0 left-0 w-[338px] max-w-[92vw] shrink-0 border-r border-border/70 bg-background/95 backdrop-blur-xl shadow-[6px_0_30px_-14px_rgba(15,23,42,0.25)] transition-transform duration-300 ease-out md:top-[72px] md:h-[calc(100vh-72px-5rem)] md:sticky md:shadow-none",
          className,
          open
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-[360px]",
        )}
      >
        <div className="relative flex h-full w-full flex-col">
          {/* Header: "History" title + search */}
          <div className="relative z-10 border-b border-border/60 px-4 pt-4 pb-3 md:px-4 md:pt-5 md:pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 via-orange-500/10 to-violet-500/15 ring-1 ring-border/70 shadow-sm">
                  <HistoryIcon
                    className="h-[18px] w-[18px] text-sky-700 dark:text-sky-300"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[14.5px] font-semibold tracking-tight md:text-[15px]">
                    History
                  </span>
                  <span className="text-[11px] text-muted-foreground md:text-[11.5px]">
                    {filtered.length} item{filtered.length === 1 ? "" : "s"} · Recent at top
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                onClick={onClose}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose
                  className="h-4.5 w-4.5"
                  strokeWidth={2}
                />
              </Button>
            </div>

            {/* Search */}
            <div className="mt-3.5 relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80"
                strokeWidth={2}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, tag, app, agent..."
                className="h-9.5 pl-9 pr-9 rounded-xl border border-border/70 bg-background/70 text-[13px] shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground/90 hover:bg-accent/30 hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Priority filter chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {(["All", "High", "Medium", "Low"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setPriorityFilter(val)}
                  className={cn(
                    "inline-flex h-7 items-center rounded-full border px-2.5 text-[11.5px] font-medium transition-all",
                    priorityFilter === val
                      ? "border-transparent bg-gradient-to-r from-[#2E6BE6]/15 via-[#FF7A1A]/15 to-[#8B4EE6]/15 text-foreground ring-1 ring-[#2E6BE6]/20 shadow-sm"
                      : "border-border/70 bg-background/60 text-muted-foreground hover:bg-accent/15 hover:text-foreground",
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Entries - flat list, all start right after the header at top, NO date grouping */}
          <div className="relative flex-1 overflow-y-auto scrollbar-thin px-3 pb-10 pt-3 md:px-3 md:pt-3">
            {filtered.length === 0 ? (
              <div className="mt-14 flex flex-col items-center justify-center text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/60" />
                <p className="mt-3 text-[13.5px] font-medium text-foreground/80">
                  No matches
                </p>
                <p className="mt-1 max-w-[250px] text-[12px] text-muted-foreground">
                  Try clearing your search or the priority filter.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5 pb-4">
                {filtered.map((entry) => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    onClick={() => onSelect(entry)}
                    selected={selectedId === entry.id}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>

      {/* Floating history re-open toggle when sidebar is closed on desktop */}
      <AnimatePresence>
        {!open ? (
          <motion.button
            key="history-open-toggle"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed left-0 top-[112px] z-30 hidden items-center gap-2 rounded-r-2xl border border-l-0 border-border/80 bg-background/90 px-2.5 pr-3 py-2.5 text-[12px] font-semibold shadow-[4px_0_24px_-10px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all hover:pr-4 hover:shadow-lg md:inline-flex"
            title="Show History sidebar"
            aria-label="Show History sidebar"
          >
            <ChevronRight
              className="h-4 w-4 text-sky-600 dark:text-sky-400"
              strokeWidth={2.2}
            />
            <span className="flex items-center gap-1.5">
              <HistoryIcon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" strokeWidth={2.2} />
              History
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function HistoryItem({
  entry,
  onClick,
  selected,
}: {
  entry: HistoryEntry;
  onClick: () => void;
  selected: boolean;
}) {
  const tone = toneMap[entry.iconTone];
  const Icon = entry.icon;
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "group relative w-full rounded-2xl border p-3 text-left transition-all duration-200 hover:shadow-card",
          selected
            ? "border-[#2E6BE6]/40 bg-gradient-to-br from-[#2E6BE6]/8 via-background to-[#FF7A1A]/8 ring-1 ring-[#2E6BE6]/20 shadow-[0_10px_28px_-22px_rgba(46,107,230,0.55)]"
            : "border-border/65 bg-background/60 hover:border-border/80 hover:bg-background/90",
        )}
      >
        {/* Selection bar */}
        <span
          className={cn(
            "absolute left-0 top-3 h-8 w-[4px] rounded-r-full bg-dxc-gradient opacity-0 transition-opacity duration-200",
            selected && "opacity-100",
          )}
        />
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
              tone.bg,
              tone.ring,
            )}
          >
            <Icon
              className={cn("h-5 w-5", tone.text)}
              strokeWidth={2.1}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="truncate text-[13px] font-semibold leading-snug text-foreground md:text-[13.5px]">
                {entry.title}
              </h4>
              <Badge
                variant={priorityBadgeVariant(entry.priority)}
                className="h-5 px-1.5 text-[9.5px] font-semibold tracking-wide uppercase shrink-0"
              >
                {entry.priority}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
              <span>{entry.agent}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{relativeTime(entry.createdAt)}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground/95">
              {entry.summary}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex h-5 items-center rounded-full border border-border/70 bg-muted/20 px-2 text-[10px] font-medium uppercase tracking-wider text-foreground/75"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer row: date + ArrowRight hint */}
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-border/50 pt-2.5">
          <span className="text-[10.5px] text-muted-foreground">
            {formatDate(entry.createdAt)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold transition-all",
              selected
                ? "bg-gradient-to-r from-[#2E6BE6]/10 via-[#FF7A1A]/10 to-[#8B4EE6]/10 text-sky-700 dark:text-sky-300"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            Open
            <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
          </span>
        </div>
      </button>
    </li>
  );
}
