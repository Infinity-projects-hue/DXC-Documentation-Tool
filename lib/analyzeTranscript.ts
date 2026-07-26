export type AnalyzerOutput = {
  workNotes: {
    issue: string;
    tsPerformed: string[];
    output: string;
  };
  resolutionNotes: string;
};

const ACTION_VERBS = [
  "checked",
  "verified",
  "validated",
  "reviewed",
  "investigated",
  "tested",
  "ran",
  "executed",
  "opened",
  "closed",
  "cleared",
  "removed",
  "deleted",
  "reset",
  "restarted",
  "rebooted",
  "recreated",
  "rebuilt",
  "updated",
  "installed",
  "uninstalled",
  "configured",
  "enabled",
  "disabled",
  "unlocked",
  "changed",
  "reconnected",
  "connected",
  "escalated",
  "applied",
  "created",
  "modified",
  "confirmed",
];

const RESOLUTION_MARKERS = [
  "resolved",
  "fixed",
  "working",
  "works",
  "successful",
  "successfully",
  "no longer",
  "no prompt",
  "connected",
  "restored",
  "synchronized",
  "synced",
  "able to",
];

function normalizeLine(line: string): string {
  return line
    .replace(/^\s*\[[^\]]+\]\s*/, "")
    .replace(/^\s*(user|customer|caller|client|agent|analyst|technician|support|engineer)(\s*\([^)]*\))?\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(value: string): string[] {
  return value
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [line])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function ensureSentence(value: string): string {
  const cleaned = value.trim().replace(/^[•*\-\d.)\s]+/, "");
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function uniqueSentences(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isLikelyGreeting(value: string): boolean {
  return /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|you'?re welcome|have a good)/i.test(
    value,
  );
}

export function analyzeTranscriptLocally(transcript: string): AnalyzerOutput {
  const rawLines = transcript
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const normalized = rawLines.map(normalizeLine).filter(Boolean);
  const userLines = rawLines
    .filter((line) => /^(?:\s*\[[^\]]+\]\s*)?(user|customer|caller|client)(\s*\([^)]*\))?\s*:/i.test(line))
    .map(normalizeLine)
    .filter((line) => !isLikelyGreeting(line));

  const issueCandidates = uniqueSentences(
    (userLines.length ? userLines : normalized)
      .flatMap(splitSentences)
      .filter((line) =>
        /(unable|cannot|can't|issue|error|fails?|failed|problem|not working|keeps|disconnected|locked|prompt|timeout|slow|missing|unable to access)/i.test(
          line,
        ),
      )
      .map(ensureSentence),
  );

  const issue =
    issueCandidates.slice(0, 2).join(" ") ||
    ensureSentence(userLines[0] || normalized[0] || "The reported issue could not be determined from the transcript");

  const actionCandidates = uniqueSentences(
    normalized
      .flatMap(splitSentences)
      .filter((line) => {
        if (isLikelyGreeting(line)) return false;
        const lower = line.toLowerCase();
        return ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(lower));
      })
      .filter((line) => !RESOLUTION_MARKERS.some((marker) => line.toLowerCase().startsWith(marker)))
      .map(ensureSentence),
  );

  const resolutionCandidates = uniqueSentences(
    normalized
      .flatMap(splitSentences)
      .filter((line) => {
        const lower = line.toLowerCase();
        if (
          /(not working|not resolved|still failing|still unable|unable to|cannot|can't|failed|failure|error|disconnected|no access|did not work)/i.test(
            lower,
          )
        ) {
          return false;
        }

        return RESOLUTION_MARKERS.some((marker) =>
          marker.includes(" ")
            ? lower.includes(marker)
            : new RegExp(`\\b${marker}\\b`, "i").test(lower),
        );
      })
      .filter((line) => !isLikelyGreeting(line))
      .map(ensureSentence),
  );

  const confirmed = resolutionCandidates.length > 0;
  const outcome = confirmed
    ? resolutionCandidates.slice(-2).join(" ")
    : "The transcript does not contain a confirmed successful outcome, and further investigation is required.";

  const actions = actionCandidates.length
    ? actionCandidates.slice(0, 10)
    : ["No troubleshooting actions were clearly documented in the supplied transcript."];

  const resolutionNotes = confirmed
    ? "The issue was resolved after the documented troubleshooting actions were completed, with successful functionality confirmed in the transcript."
    : "The issue remains unresolved, and further investigation is required.";

  return {
    workNotes: {
      issue,
      tsPerformed: actions,
      output: outcome,
    },
    resolutionNotes,
  };
}
