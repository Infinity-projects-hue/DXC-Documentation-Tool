import { NextResponse } from "next/server";
import type { AnalyzerOutput } from "@/lib/analyzeTranscript";
import { POST as originalAnalyzePost } from "../analyze/route";

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
  "You are a Senior DXC IT Service Desk Analyst creating professional ServiceNow Work Notes from a complete raw support conversation.",
  "Identify the supported person as the User and DXC support personnel as the Agent from speaker labels, names, message order, questions, answers, and technical context.",
  "Ignore greetings, introductions, pleasantries, apologies, empathy statements, acknowledgements, hold messages, bot prompts, repeated dialogue, surveys, thank-you messages, and closing scripts.",
  "Do not summarize or retell the conversation. Extract only the User's technical Issue, the troubleshooting the Agent actually performed or instructed, the technical Output, and Resolution Notes.",
  "Use only facts supported by the interaction. Never invent troubleshooting, commands, checks, escalations, root causes, findings, User actions, approvals, timelines, resolutions, or validation.",
  "Issue must contain 1 to 3 professional sentences beginning with the User's technical impact and identifying the affected application, service, device, or account.",
  "TS Performed must list one concise Agent action or instruction per array item in chronological order. Use Guided the User to..., Advised the User to..., Instructed the User to..., or Requested the User to... when the Agent directed the User.",
  "Do not claim the Agent performed an action completed by the User. Do not claim an instructed User action was completed unless the conversation confirms completion.",
  "Output must contain 1 to 3 concise sentences stating only the actual technical result or final finding after troubleshooting.",
  "Resolution Notes must contain exactly two concise professional sentences. Sentence 1 states the current Incident status. Sentence 2 states the confirmed fix and User validation, or the exact outstanding dependency and ownership.",
  "Use User, Agent, Incident, Ticket, or Case where applicable. Do not use Customer, Caller, Client, I, We, You, He, She, or They.",
  "Return only valid JSON matching the supplied schema. Do not include headings, markdown, bullet characters, Summary, RCA, Next Action, or recommendations.",
].join(" ");

const CONVERSATIONAL_FILLER =
  /\b(?:hello|good morning|good afternoon|good evening|how are you|thank you for contacting|is there anything else|have a good day|you'?re welcome)\b/i;

class GeminiRequestError extends Error {
  constructor(
    readonly model: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GeminiRequestError";
  }
}

type GeminiResult = {
  output: AnalyzerOutput;
  validation: string[];
};

function sentenceCount(value: string): number {
  return (value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function isStructurallyValid(value: unknown): value is AnalyzerOutput {
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

function cleanEntry(value: string): string {
  return value
    .trim()
    .replace(/^\s*(?:[>•*\-]|\d+[.)])\s*/, "")
    .replace(/\s+/g, " ");
}

function normalizeOutput(output: AnalyzerOutput): AnalyzerOutput {
  const uniqueActions = Array.from(
    new Map(
      output.workNotes.tsPerformed
        .map(cleanEntry)
        .filter(Boolean)
        .map((item) => [item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), item]),
    ).values(),
  ).slice(0, 20);

  return {
    workNotes: {
      issue: cleanEntry(output.workNotes.issue),
      tsPerformed: uniqueActions,
      output: cleanEntry(output.workNotes.output),
    },
    resolutionNotes: cleanEntry(output.resolutionNotes),
  };
}

function validationIssues(output: AnalyzerOutput): string[] {
  const issues: string[] = [];
  const issueCount = sentenceCount(output.workNotes.issue);
  const outputCount = sentenceCount(output.workNotes.output);
  const resolutionCount = sentenceCount(output.resolutionNotes);

  if (issueCount < 1 || issueCount > 3) issues.push("Issue must contain 1 to 3 sentences");
  if (output.workNotes.tsPerformed.length > 20) {
    issues.push("TS Performed must contain no more than 20 chronological actions");
  }
  if (outputCount < 1 || outputCount > 3) issues.push("Output must contain 1 to 3 sentences");
  if (resolutionCount !== 2) issues.push("Resolution Notes must contain exactly two sentences");

  const allText = [
    output.workNotes.issue,
    ...output.workNotes.tsPerformed,
    output.workNotes.output,
    output.resolutionNotes,
  ].join(" ");

  if (CONVERSATIONAL_FILLER.test(allText)) {
    issues.push("Conversational greetings or closing filler must be removed");
  }

  return issues;
}

function parseStructuredOutput(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as unknown;
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

function buildPrompt(transcript: string, repairIssues: string[]): string {
  const repairInstruction = repairIssues.length
    ? `The previous generation failed these checks: ${repairIssues.join(
        "; ",
      )}. Regenerate and correct every listed problem.`
    : "";

  return [
    "Analyze the complete raw DXC support interaction below.",
    "Determine the User and Agent roles from labels and context.",
    "Extract the User's technical issue, the DXC Agent's actual troubleshooting and instructions in chronological order, the real technical outcome, and exactly two concise Resolution Notes sentences.",
    "Ignore all non-technical conversation.",
    repairInstruction,
    "",
    "<support_interaction>",
    transcript,
    "</support_interaction>",
  ]
    .filter(Boolean)
    .join("\n");
}

function generationConfig(model: string): Record<string, unknown> {
  if (model.startsWith("gemini-3")) {
    return {
      maxOutputTokens: 2200,
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: responseSchema,
        },
      },
    };
  }

  return {
    maxOutputTokens: 2200,
    responseMimeType: "application/json",
    responseJsonSchema: responseSchema,
  };
}

async function generateWithGemini({
  apiKey,
  model,
  transcript,
  repairIssues = [],
}: {
  apiKey: string;
  model: string;
  transcript: string;
  repairIssues?: string[];
}): Promise<GeminiResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: AbortSignal.timeout(55_000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(transcript, repairIssues) }],
          },
        ],
        generationConfig: generationConfig(model),
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new GeminiRequestError(
      model,
      response.status,
      `Gemini request failed: ${detail.slice(0, 700)}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const text = extractGeminiText(payload);
  const parsed = text ? parseStructuredOutput(text) : null;

  if (!isStructurallyValid(parsed)) {
    throw new Error("Gemini returned an invalid structured documentation response.");
  }

  const output = normalizeOutput(parsed);
  return { output, validation: validationIssues(output) };
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function normalizedProvider(): string {
  return process.env.AI_PROVIDER?.trim().toLowerCase() ?? "";
}

function geminiKeys(): string[] {
  const preferred = normalizedProvider();
  const genericKey = process.env.AI_API_KEY?.trim();
  const genericLooksGoogle = Boolean(genericKey && /^AIza/i.test(genericKey));

  return uniqueValues([
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    genericKey &&
    (preferred === "gemini" || preferred === "google" || (!preferred && genericLooksGoogle))
      ? genericKey
      : undefined,
  ]);
}

function geminiModels(): string[] {
  return uniqueValues([
    process.env.GEMINI_MODEL,
    process.env.GOOGLE_MODEL,
    normalizedProvider() === "gemini" || normalizedProvider() === "google"
      ? process.env.AI_MODEL
      : undefined,
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ]);
}

function hasNonGeminiProvider(): boolean {
  const preferred = normalizedProvider();
  const genericKey = process.env.AI_API_KEY?.trim();
  const genericIsNonGemini = Boolean(
    genericKey &&
      preferred &&
      preferred !== "gemini" &&
      preferred !== "google",
  );

  return Boolean(
    process.env.OPENAI_API_KEY?.trim() ||
      process.env.ANTHROPIC_API_KEY?.trim() ||
      process.env.CLAUDE_API_KEY?.trim() ||
      genericIsNonGemini,
  );
}

function explainGeminiFailure(error: unknown): string {
  if (!(error instanceof GeminiRequestError)) {
    return "Gemini returned an invalid or incomplete structured response.";
  }

  if (error.status === 400) {
    return `Gemini rejected the request for model ${error.model}. The request format or configured model may be unsupported.`;
  }
  if (error.status === 401) {
    return "Google rejected the Gemini API key. Verify that GOOGLE_API_KEY or GEMINI_API_KEY contains an active key.";
  }
  if (error.status === 403) {
    return "Google denied Gemini API access. Check the Google AI project, API restrictions, and permissions for the key.";
  }
  if (error.status === 404) {
    return `Gemini model ${error.model} is not available for this API key.`;
  }
  if (error.status === 429) {
    return "Gemini quota or rate limit was exceeded. Check Google AI Studio quota and billing limits.";
  }
  if (error.status >= 500) {
    return "Gemini is temporarily unavailable. Please try again shortly.";
  }

  return `Gemini request failed with status ${error.status}.`;
}

async function runGemini(transcript: string): Promise<NextResponse> {
  const failures: string[] = [];

  for (const apiKey of geminiKeys()) {
    for (const model of geminiModels()) {
      try {
        const firstAttempt = await generateWithGemini({ apiKey, model, transcript });

        if (firstAttempt.validation.length === 0) {
          return NextResponse.json({
            output: firstAttempt.output,
            mode: "gemini",
            model,
          });
        }

        const repairedAttempt = await generateWithGemini({
          apiKey,
          model,
          transcript,
          repairIssues: firstAttempt.validation,
        });

        if (repairedAttempt.validation.length > 0) {
          throw new Error(
            `Gemini response failed validation: ${repairedAttempt.validation.join("; ")}`,
          );
        }

        return NextResponse.json({
          output: repairedAttempt.output,
          mode: "gemini",
          model,
        });
      } catch (error) {
        console.error(`Gemini/${model} analysis failed.`, error);
        failures.push(explainGeminiFailure(error));
      }
    }
  }

  return NextResponse.json(
    {
      error:
        Array.from(new Set(failures)).join(" ") ||
        "Gemini could not generate reliable work notes from this interaction.",
    },
    { status: 502 },
  );
}

function clonedRequest(original: Request, bodyText: string): Request {
  return new Request(original.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyText,
  });
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  let transcript = "";

  try {
    const body = JSON.parse(bodyText) as { transcript?: unknown };
    transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "Paste the complete support interaction before analyzing." },
      { status: 400 },
    );
  }

  if (transcript.length > 60_000) {
    return NextResponse.json(
      { error: "The interaction is too long. Please keep it under 60,000 characters." },
      { status: 413 },
    );
  }

  const hasGemini = geminiKeys().length > 0;
  const preferred = normalizedProvider();
  const preferGemini = preferred === "gemini" || preferred === "google";

  if (hasGemini && (preferGemini || !hasNonGeminiProvider())) {
    const geminiResponse = await runGemini(transcript);
    if (geminiResponse.ok || !hasNonGeminiProvider()) return geminiResponse;

    const fallbackResponse = await originalAnalyzePost(clonedRequest(request, bodyText));
    return fallbackResponse.ok ? fallbackResponse : geminiResponse;
  }

  const originalResponse = await originalAnalyzePost(clonedRequest(request, bodyText));
  if (originalResponse.ok || !hasGemini) return originalResponse;

  const geminiResponse = await runGemini(transcript);
  return geminiResponse.ok ? geminiResponse : originalResponse;
}
