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
  "performed",
  "instructed",
  "advised",
  "provided",
  "sent",
  "revoked",
  "guided",
  "assisted",
  "identified",
  "determined",
  "explained",
  "submitted",
  "requested",
  "kept",
  "shared",
];

const SUCCESS_MARKERS = [
  "resolved",
  "fixed",
  "working",
  "works",
  "successful",
  "successfully",
  "no longer",
  "no prompt",
  "no popup",
  "connected",
  "restored",
  "synchronized",
  "synced",
  "able to access",
  "able to log in",
  "login succeeded",
  "functioning as expected",
];

const UNRESOLVED_MARKERS = [
  "pending",
  "escalated",
  "referred",
  "specialized team",
  "specialist team",
  "further investigation",
  "not resolved",
  "still unable",
  "still failing",
  "invalidated",
  "awaiting",
  "license assignment",
  "licence assignment",
];

function stripSummaryHeading(value: string): string {
  return value.replace(/^\s*summary\s*[:\-]?\s*/i, "").trim();
}

function normalizeLine(line: string): string {
  return stripSummaryHeading(line)
    .replace(/^\s*\[[^\]]+\]\s*/, "")
    .replace(
      /^\s*(user|customer|caller|client|agent|analyst|technician|support|engineer)(\s*\([^)]*\))?\s*:\s*/i,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(value: string): string[] {
  return stripSummaryHeading(value)
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [line])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function ensureSentence(value: string): string {
  const cleaned = value
    .trim()
    .replace(/^[>•*\-\d.)\s]+/, "")
    .replace(/octoverify/gi, "Okta Verify")
    .replace(/\s+/g, " ");
  if (!cleaned) return "";
  const capitalized = `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
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

function hasActionVerb(value: string): boolean {
  return ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(value));
}

function removeActorPrefix(value: string): string {
  return value
    .replace(/^the\s+(agent|analyst|technician|support engineer|engineer)\s+/i, "")
    .replace(/^the\s+(customer|user|caller|client)\s+/i, "")
    .trim();
}

function splitActionSentence(value: string): string[] {
  const clean = removeActorPrefix(value);
  const pieces = clean
    .split(/\s*(?:;|,\s+and\s+|\s+and\s+)(?=(?:the\s+)?(?:agent|analyst|technician|support|engineer|customer|user|caller|client)?\s*[a-z])/i)
    .map((part) => removeActorPrefix(part))
    .filter(Boolean);

  if (pieces.length <= 1) return [clean];

  const actionable = pieces.filter(hasActionVerb);
  return actionable.length >= 2 ? actionable : [clean];
}

function professionalizeIssue(value: string): string {
  return ensureSentence(
    removeActorPrefix(value)
      .replace(/^requested\s+/i, "User requested ")
      .replace(/^reported\s+/i, "User reported ")
      .replace(/^required\s+/i, "User required "),
  );
}

function compactBlocker(value: string): string {
  const lower = value.toLowerCase();

  if (/no\s+(?:microsoft\s+)?licen[cs]e|no\s+(?:microsoft\s+)?licence/.test(lower)) {
    return "No Microsoft license was assigned to the account, preventing access to Teams and Outlook.";
  }

  if (/invalidated/.test(lower) && /okta|octoverify|verification/.test(lower)) {
    return "Okta Verify enrollment failed because the device or account was invalidated.";
  }

  const focused = value
    .replace(/^.*?\b(?:determined|confirmed|identified|encountered)\b\s*/i, "")
    .replace(/^that\s+/i, "");
  return ensureSentence(focused || removeActorPrefix(value));
}

function containsSuccess(value: string): boolean {
  const lower = value.toLowerCase();
  if (
    /(not working|not resolved|still failing|still unable|unable to|cannot|can't|failed|failure|error|invalidated|disconnected|no access|did not work|pending|awaiting|escalated)/i.test(
      lower,
    )
  ) {
    return false;
  }

  return SUCCESS_MARKERS.some((marker) => lower.includes(marker));
}

function containsProblemOrStatus(value: string): boolean {
  return /(unable|cannot|can't|issue|error|fails?|failed|problem|not working|keeps|disconnected|locked|prompt|timeout|slow|missing|no\s+(?:microsoft\s+)?licen[cs]e|not assigned|invalidated|pending|escalated|referred|awaiting)/i.test(
    value,
  );
}

function buildIssue(sentences: string[], fallbackParts: string[]): string {
  const all = sentences.join(" ").toLowerCase();

  if (/teams/.test(all) && /outlook/.test(all) && /no\s+(?:microsoft\s+)?licen[cs]e|not assigned/.test(all)) {
    return "User was unable to access Teams and Outlook on the newly created account because no Microsoft license was assigned.";
  }

  if (/okta|octoverify|authentication verification/.test(all) && /invalidated/.test(all)) {
    return "User required an Okta Verify reset to complete the exception approval process but could not finish enrollment because the device or account was invalidated.";
  }

  return fallbackParts.slice(0, 2).join(" ") ||
    ensureSentence(normalizeLine(sentences[0] || "The reported issue could not be determined from the supplied interaction"));
}

function buildPendingResolution(sentences: string[]): string {
  const all = sentences.join(" ").toLowerCase();

  if (/e3|microsoft\s+licen[cs]e|licen[cs]e assignment/.test(all)) {
    return "The issue remains pending Microsoft E3 license assignment by the licensing team, after which Teams and Outlook access can be verified.";
  }

  if (/okta|octoverify|authentication verification/.test(all) && /escalated|specialized team|specialist team/.test(all)) {
    return "The issue was not resolved during the session and was escalated to the specialist authentication support team for further investigation.";
  }

  if (/escalated|specialized team|specialist team|referred/.test(all)) {
    return "The issue was not resolved during the session and was escalated to the appropriate specialist team for further investigation.";
  }

  return "The issue remains unresolved, and further investigation is required.";
}

export function analyzeTranscriptLocally(transcript: string): AnalyzerOutput {
  const source = stripSummaryHeading(transcript.replace(/\r/g, ""));
  const rawLines = source
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const allSentences = splitSentences(source);

  const userLines = rawLines
    .filter((line) =>
      /^(?:\s*\[[^\]]+\]\s*)?(user|customer|caller|client)(\s*\([^)]*\))?\s*:/i.test(line),
    )
    .map(normalizeLine)
    .filter((line) => !isLikelyGreeting(line));
  const agentLines = rawLines
    .filter((line) =>
      /^(?:\s*\[[^\]]+\]\s*)?(agent|analyst|technician|support|engineer)(\s*\([^)]*\))?\s*:/i.test(line),
    )
    .map(normalizeLine)
    .filter((line) => !isLikelyGreeting(line));

  const narrativeUserSentences = allSentences.filter((sentence) =>
    /^(the\s+)?(customer|user|caller|client)\b/i.test(sentence),
  );
  const narrativeAgentSentences = allSentences.filter((sentence) =>
    /^(the\s+)?(agent|analyst|technician|support|engineer)\b/i.test(sentence),
  );

  const effectiveUserSentences = userLines.length
    ? userLines.flatMap(splitSentences)
    : narrativeUserSentences;
  const effectiveAgentSentences = agentLines.length
    ? agentLines.flatMap(splitSentences)
    : narrativeAgentSentences;

  const firstUserRequest = effectiveUserSentences.find(
    (sentence) => !isLikelyGreeting(removeActorPrefix(sentence)),
  );
  const explicitBlocker = allSentences.find(
    (sentence) =>
      containsProblemOrStatus(sentence) &&
      !/ticket will remain open|may take|can sometimes|email confirmation/i.test(sentence),
  );

  const issueParts = uniqueSentences(
    [firstUserRequest && professionalizeIssue(firstUserRequest), explicitBlocker && compactBlocker(explicitBlocker)].filter(
      (value): value is string => Boolean(value),
    ),
  );
  const issue = buildIssue(allSentences, issueParts);

  const actionSource = effectiveAgentSentences.length
    ? effectiveAgentSentences
    : allSentences.filter((sentence) => hasActionVerb(sentence));

  const actionCandidates = uniqueSentences(
    actionSource
      .flatMap(splitActionSentence)
      .filter((line) => hasActionVerb(line) && !isLikelyGreeting(line))
      .map((line) => ensureSentence(removeActorPrefix(line))),
  );

  const documentedFollowUp = allSentences
    .filter((sentence) => /ticket will remain open|kept the ticket open|follow[- ]?up|monitor/i.test(sentence))
    .map((sentence) =>
      ensureSentence(
        sentence
          .replace(/^the ticket will remain open for the agent to\s+/i, "Kept the ticket open to ")
          .replace(/^the ticket will remain open\s+/i, "Kept the ticket open "),
      ),
    );

  const actions = uniqueSentences([...actionCandidates, ...documentedFollowUp]).slice(0, 12);

  const blockerSentences = allSentences.filter((sentence) =>
    /(no\s+(?:microsoft\s+)?licen[cs]e|not assigned|invalidated|error|failed|unable|missing|escalated|referred)/i.test(
      sentence,
    ),
  );
  const successSentences = allSentences.filter(containsSuccess);
  const unresolved = allSentences.some((sentence) =>
    UNRESOLVED_MARKERS.some((marker) => sentence.toLowerCase().includes(marker)),
  );

  let outcome: string;
  let resolutionNotes: string;

  if (successSentences.length > 0 && !unresolved) {
    outcome = uniqueSentences(successSentences.map((sentence) => ensureSentence(removeActorPrefix(sentence))))
      .slice(-2)
      .join(" ");
    resolutionNotes =
      "The issue was resolved after the documented troubleshooting actions were completed and successful functionality was confirmed in the interaction.";
  } else {
    const statusParts = uniqueSentences(
      blockerSentences.map((sentence) => {
        if (/escalated|referred/i.test(sentence)) {
          return ensureSentence(
            removeActorPrefix(sentence)
              .replace(/^escalated\s+(?:the\s+issue\s+)?to\s+/i, "The case was escalated to ")
              .replace(/^referred\s+(?:the\s+user\s+|the\s+case\s+)?to\s+/i, "The case was referred to "),
          );
        }
        return compactBlocker(sentence);
      }),
    );
    outcome =
      statusParts.slice(-2).join(" ") ||
      "The supplied interaction does not contain a confirmed successful outcome, and further investigation is required.";
    resolutionNotes = buildPendingResolution(allSentences);
  }

  return {
    workNotes: {
      issue,
      tsPerformed:
        actions.length > 0
          ? actions
          : ["No troubleshooting actions were clearly documented in the supplied interaction."],
      output: outcome,
    },
    resolutionNotes,
  };
}
