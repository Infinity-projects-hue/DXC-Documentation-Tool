import { NextResponse } from "next/server";
import {
  analyzeTranscriptLocally,
  type AnalyzerOutput,
} from "@/lib/analyzeTranscript";

export const runtime = "nodejs";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    workNotes: {
      type: "object",
      additionalProperties: false,
      properties: {
        issue: { type: "string" },
        tsPerformed: {
          type: "array",
          items: { type: "string" },
        },
        output: { type: "string" },
      },
      required: ["issue", "tsPerformed", "output"],
    },
    resolutionNotes: { type: "string" },
  },
  required: ["workNotes", "resolutionNotes"],
} as const;

const systemInstruction = [
  "You are a Senior IT Service Desk Analyst documenting incidents in ServiceNow after a support interaction.",
  "The input may be a live chat transcript, call transcript, AI-generated call summary, chat summary, incident notes, ticket description, or any combination of these.",
  "Analyze the incident like an experienced DXC Service Desk engineer; do not summarize the conversation.",
  "Silently identify the primary issue, affected application/service/device/account, business impact, clearly supported root cause, every Agent action, chronological troubleshooting order, final technical finding, and current incident status before writing.",
  "Use only facts explicitly present in the supplied input. Infer only what is reasonably supported when the input is a summary.",
  "Never fabricate troubleshooting, escalations, technical findings, root causes, resolutions, User actions, approvals, timelines, callbacks, ticket status, or future work.",
  "Return only the JSON required by the schema: workNotes.issue, workNotes.tsPerformed, workNotes.output, and resolutionNotes.",
  "Do not return Summary, Next Action, RCA, recommendations, greetings, conversation recap, or any additional section.",

  "ISSUE RULES:",
  "Write exactly one Issue entry as one string containing 2 to 3 professional sentences when the available facts support that length.",
  "Begin with the User's technical impact, then identify the affected application, service, device, or account, and include the known cause only when clearly evident.",
  "Describe the technical problem rather than the conversation.",
  "Do not include bullet symbols in the string because the interface adds the > prefix.",

  "TS PERFORMED RULES:",
  "Include every troubleshooting action actually performed or explicitly communicated by the Agent, in chronological order.",
  "Return one concise action per array item and use professional past-tense wording.",
  "Include relevant actions such as issue review, identity verification, account checks, licensing checks, configuration checks, troubleshooting, guidance, remote session activity, screenshots or logs requested, resets, updates, escalation, ticket creation or reference, callbacks, next-step advice, replacement arrangements, or hold status only when explicitly present.",
  "Do not combine unrelated actions into one item when they can be written as separate chronological actions.",
  "Remove duplicate actions, greetings, filler, repeated information, and unrelated conversation.",
  "Do not invent any troubleshooting step.",
  "Do not include bullet symbols in array items because the interface adds the > prefix.",

  "OUTPUT RULES:",
  "Write exactly one Output entry as one string containing 1 to 3 concise professional sentences.",
  "State only the final technical finding or conclusion after troubleshooting.",
  "Do not describe future actions and do not treat pending status as a resolution.",
  "Do not repeat Resolution Notes.",
  "Do not include bullet symbols in the string because the interface adds the > prefix.",

  "RESOLUTION NOTES RULES:",
  "Write exactly one Resolution Notes entry as one string containing 2 to 3 concise professional sentences when supported by the facts.",
  "Describe only the current incident status, such as Resolved, Pending User Action, Pending Manager Approval, Pending License Assignment, Pending Replacement, Pending Restart, Pending Validation, Pending Callback, Pending Synchronization, Escalated, Awaiting Specialist Team, Awaiting Hardware, Awaiting Remote Session, Awaiting Admin Credentials, On Hold, or Transferred.",
  "Do not repeat the technical finding from Output.",
  "When no resolution is confirmed, clearly state the actual pending or escalated status supported by the input.",
  "Do not include bullet symbols in the string because the interface adds the > prefix.",

  "TERMINOLOGY AND STYLE:",
  "Always use the terms User, Agent, Incident, Ticket, or Case where applicable.",
  "Never use Customer, Caller, Client, I, We, You, He, She, or They.",
  "Use concise, professional, technical ServiceNow wording suitable for direct pasting into Work Notes.",
  "Correct grammar and product names while preserving technical meaning.",
  "Keep the Issue analytical, troubleshooting chronological, Output technical, and Resolution Notes status-focused.",
  "Before returning, verify no troubleshooting or resolution was invented and all four fields comply with these rules.",
].join(" ");

function isValidOutput(value: unknown): value is AnalyzerOutput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AnalyzerOutput;
  return (
    typeof candidate.workNotes?.issue === "string" &&
    candidate.workNotes.issue.trim().length > 0 &&
    Array.isArray(candidate.workNotes?.tsPerformed) &&
    candidate.workNotes.tsPerformed.length > 0 &&
    candidate.workNotes.tsPerformed.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    ) &&
    typeof candidate.workNotes?.output === "string" &&
    candidate.workNotes.output.trim().length > 0 &&
    typeof candidate.resolutionNotes === "string" &&
    candidate.resolutionNotes.trim().length > 0
  );
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const direct = (payload as { output_text?: unknown }).output_text;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const type = (part as { type?: unknown }).type;
      const text = (part as { text?: unknown }).text;
      if (type === "output_text" && typeof text === "string" && text.trim()) {
        return text.trim();
      }
    }
  }

  return null;
}

function parseStructuredOutput(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as unknown;
}

function cleanSentence(value: string): string {
  return value
    .trim()
    .replace(/^\s*(?:[>•*\-]|\d+[.)])\s*/, "")
    .replace(/\s+/g, " ");
}

function normalizeOutput(output: AnalyzerOutput): AnalyzerOutput {
  const uniqueActions = Array.from(
    new Map(
      output.workNotes.tsPerformed
        .map(cleanSentence)
        .filter(Boolean)
        .map((item) => [item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), item]),
    ).values(),
  ).slice(0, 18);

  return {
    workNotes: {
      issue: cleanSentence(output.workNotes.issue),
      tsPerformed:
        uniqueActions.length > 0
          ? uniqueActions
          : ["No troubleshooting actions were clearly documented in the supplied interaction."],
      output: cleanSentence(output.workNotes.output),
    },
    resolutionNotes: cleanSentence(output.resolutionNotes),
  };
}

export async function POST(request: Request) {
  let transcript = "";

  try {
    const body = (await request.json()) as { transcript?: unknown };
    transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "Paste an interaction transcript before analyzing." },
      { status: 400 },
    );
  }

  if (transcript.length > 60_000) {
    return NextResponse.json(
      { error: "The transcript is too long. Please keep it under 60,000 characters." },
      { status: 413 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      output: analyzeTranscriptLocally(transcript),
      mode: "local",
    });
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 1800,
        instructions: systemInstruction,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Generate DXC-standard ServiceNow Work Notes from the following incident information. Use only the supplied information.\n\n${transcript}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "dxc_servicenow_work_notes",
            description:
              "Structured DXC ServiceNow documentation containing Issue, chronological TS Performed, Output, and Resolution Notes.",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `OpenAI request failed with status ${response.status}: ${detail.slice(0, 400)}`,
      );
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);
    const parsed = outputText ? parseStructuredOutput(outputText) : null;

    if (!isValidOutput(parsed)) {
      throw new Error("OpenAI returned an invalid documentation response.");
    }

    return NextResponse.json({ output: normalizeOutput(parsed), mode: "openai" });
  } catch (error) {
    console.error("OpenAI analysis failed; using grounded local fallback.", error);
    return NextResponse.json({
      output: analyzeTranscriptLocally(transcript),
      mode: "local",
    });
  }
}
