import { NextResponse } from "next/server";
import {
  analyzeTranscriptLocally,
  type AnalyzerOutput,
} from "@/lib/analyzeTranscript";

export const runtime = "nodejs";

const schema = {
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

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        (part as { type?: unknown }).type === "output_text" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
    }
  }

  return null;
}

function isValidOutput(value: unknown): value is AnalyzerOutput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AnalyzerOutput;
  return (
    typeof candidate.workNotes?.issue === "string" &&
    Array.isArray(candidate.workNotes?.tsPerformed) &&
    candidate.workNotes.tsPerformed.every((item) => typeof item === "string") &&
    typeof candidate.workNotes?.output === "string" &&
    typeof candidate.resolutionNotes === "string"
  );
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

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        store: false,
        max_output_tokens: 1200,
        instructions: [
          "You create professional IT service desk documentation from a supplied support interaction.",
          "Use only facts explicitly present in the transcript.",
          "Never invent troubleshooting, outcomes, commands, causes, or resolutions.",
          "Return only Work Notes and Resolution Notes in the provided schema.",
          "Work Notes issue must briefly explain the reported problem.",
          "Work Notes tsPerformed must contain only actual checks, changes, commands, investigations, and actions performed. Remove duplicates, greetings, identity verification, and irrelevant conversation.",
          "Work Notes output must state the observed result of those actions.",
          "Resolution Notes must be exactly one concise professional sentence.",
          "When no resolution is confirmed, use exactly: The issue remains unresolved, and further investigation is required.",
        ].join(" "),
        input: transcript,
        text: {
          format: {
            type: "json_schema",
            name: "support_documentation",
            description: "Grounded ITSM work notes and one-sentence resolution notes.",
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);
    const parsed = outputText ? (JSON.parse(outputText) as unknown) : null;

    if (!isValidOutput(parsed)) {
      throw new Error("The analyzer returned an invalid response shape.");
    }

    return NextResponse.json({ output: parsed, mode: "ai" });
  } catch (error) {
    console.error("AI analysis failed; using grounded local fallback.", error);
    return NextResponse.json({
      output: analyzeTranscriptLocally(transcript),
      mode: "local",
    });
  }
}
