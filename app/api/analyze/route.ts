import { NextResponse } from "next/server";
import {
  analyzeTranscriptLocally,
  type AnalyzerOutput,
} from "@/lib/analyzeTranscript";

export const runtime = "nodejs";

const responseSchema = {
  type: "OBJECT",
  properties: {
    workNotes: {
      type: "OBJECT",
      properties: {
        issue: { type: "STRING" },
        tsPerformed: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        output: { type: "STRING" },
      },
      required: ["issue", "tsPerformed", "output"],
    },
    resolutionNotes: { type: "STRING" },
  },
  required: ["workNotes", "resolutionNotes"],
} as const;

const systemInstruction = [
  "You are a senior IT service desk documentation analyst.",
  "The input may be a chat transcript, call summary, or narrative interaction summary.",
  "Use only information explicitly available in the supplied interaction.",
  "Never invent troubleshooting actions, technical causes, outcomes, approvals, timelines, or resolutions.",
  "Return only Work Notes and Resolution Notes using the required JSON schema.",
  "Do not return a Summary section, Next Action, RCA, customer email, recommendations, or any other section.",
  "Work Notes issue must clearly state the user-facing problem and any confirmed blocker or status.",
  "Work Notes tsPerformed must include one concise past-tense action per array item.",
  "Include only actions actually completed or explicitly communicated by the agent, such as verification, checks, changes, instructions, links, ticket references, escalation, and documented follow-up.",
  "Do not add actions that are merely implied.",
  "Remove duplicate actions, greetings, filler, and repeated conversation.",
  "Work Notes output must state the observed result or current case status, including pending assignment or escalation when applicable.",
  "Do not label a pending, referred, or escalated case as resolved.",
  "Resolution Notes must be one concise professional sentence suitable for ServiceNow.",
  "For a confirmed resolution, state the actual fix and confirmation.",
  "For a pending or escalated case, state that it was not resolved and identify the pending dependency or receiving team.",
  "Correct grammar and product names while preserving the technical meaning.",
].join(" ");

function isValidOutput(value: unknown): value is AnalyzerOutput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AnalyzerOutput;
  return (
    typeof candidate.workNotes?.issue === "string" &&
    Array.isArray(candidate.workNotes?.tsPerformed) &&
    candidate.workNotes.tsPerformed.length > 0 &&
    candidate.workNotes.tsPerformed.every((item) => typeof item === "string") &&
    typeof candidate.workNotes?.output === "string" &&
    typeof candidate.resolutionNotes === "string"
  );
}

function extractGeminiText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const content = (candidate as { content?: unknown }).content;
    if (!content || typeof content !== "object") continue;
    const parts = (content as { parts?: unknown }).parts;
    if (!Array.isArray(parts)) continue;

    const text = parts
      .map((part) =>
        part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string"
          ? (part as { text: string }).text
          : "",
      )
      .join("")
      .trim();

    if (text) return text;
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

function normalizeOutput(output: AnalyzerOutput): AnalyzerOutput {
  const uniqueActions = Array.from(
    new Map(
      output.workNotes.tsPerformed
        .map((item) => item.trim().replace(/^[>•*\-\d.)\s]+/, ""))
        .filter(Boolean)
        .map((item) => [item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), item]),
    ).values(),
  ).slice(0, 12);

  return {
    workNotes: {
      issue: output.workNotes.issue.trim(),
      tsPerformed:
        uniqueActions.length > 0
          ? uniqueActions
          : ["No troubleshooting actions were clearly documented in the supplied interaction."],
      output: output.workNotes.output.trim(),
    },
    resolutionNotes: output.resolutionNotes.trim(),
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

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      output: analyzeTranscriptLocally(transcript),
      mode: "local",
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create grounded ITSM documentation from this interaction:\n\n${transcript}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1400,
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Gemini request failed with status ${response.status}: ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractGeminiText(payload);
    const parsed = outputText ? parseStructuredOutput(outputText) : null;

    if (!isValidOutput(parsed)) {
      throw new Error("Gemini returned an invalid documentation response.");
    }

    return NextResponse.json({ output: normalizeOutput(parsed), mode: "gemini" });
  } catch (error) {
    console.error("Gemini analysis failed; using grounded local fallback.", error);
    return NextResponse.json({
      output: analyzeTranscriptLocally(transcript),
      mode: "local",
    });
  }
}
