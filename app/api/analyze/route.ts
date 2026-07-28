import { NextResponse } from "next/server";
import type { AnalyzerOutput } from "@/lib/analyzeTranscript";

export const runtime = "nodejs";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    workNotes: {
      type: "object",
      additionalProperties: false,
      properties: {
        issue: {
          type: "string",
          description:
            "One Issue entry describing the User's technical impact, affected service or device, and clearly supported cause in 1 to 3 professional sentences.",
        },
        tsPerformed: {
          type: "array",
          description:
            "Chronological troubleshooting performed by the DXC Agent or explicitly instructed by the Agent, with one concise action per item.",
          items: { type: "string" },
        },
        output: {
          type: "string",
          description:
            "One Output entry stating only the final technical result or finding after troubleshooting in 1 to 3 professional sentences.",
        },
      },
      required: ["issue", "tsPerformed", "output"],
    },
    resolutionNotes: {
      type: "string",
      description:
        "Exactly two concise professional sentences: current Incident status, followed by the confirmed fix and validation or the outstanding dependency.",
    },
  },
  required: ["workNotes", "resolutionNotes"],
} as const;

const systemInstruction = [
  "You are a Senior DXC IT Service Desk Analyst creating ServiceNow Work Notes from complete support interactions.",
  "The input can be a long interactive conversation containing User messages, DXC Analyst messages, timestamps, names, automated system messages, greetings, clarifying questions, repeated explanations, hold messages, acknowledgements, and closing statements.",
  "Do not summarize or retell the conversation. Analyze the dialogue and extract only the technical documentation required by the JSON schema.",
  "Identify the supported person as the User and DXC support personnel as the Agent by using speaker labels, message order, questions, answers, and technical context.",
  "A User statement is evidence of the issue, symptoms, business impact, actions completed, and final confirmation. An Agent statement is evidence of investigation, checks, troubleshooting performed, instructions provided, escalation, and status handling.",
  "Do not confuse a User's description of the problem with an Agent troubleshooting action.",
  "Silently ignore greetings, introductions, pleasantries, apologies, empathy statements, acknowledgements, hold notifications, typing indicators, queue messages, bot prompts, surveys, repeated restatements, thank-you messages, goodbye statements, and standard closing scripts.",
  "Use only facts supported by the supplied interaction. Never fabricate troubleshooting, commands, checks, escalations, root causes, findings, approvals, timelines, resolutions, User actions, or final confirmation.",
  "When a cause is not confirmed, describe only the observed symptom or blocker. When a successful result is not confirmed, do not mark the Incident resolved.",
  "Write one Issue entry containing 1 to 3 professional sentences, beginning with the User's technical impact and identifying the affected application, service, device, or account.",
  "Document the troubleshooting provided by the DXC Agent in chronological order with one action per item.",
  "Include actions the Agent directly performed and troubleshooting the Agent instructed the User to perform. Phrase instructions accurately as Guided the User to..., Advised the User to..., Instructed the User to..., or Requested the User to....",
  "Do not claim the Agent performed an action completed by the User, and do not claim an instructed User action was completed unless the conversation confirms completion.",
  "Write one Output entry containing 1 to 3 concise professional sentences stating the actual technical result after troubleshooting.",
  "Write exactly two short Resolution Notes sentences. Sentence 1 states the current Incident status. Sentence 2 states the confirmed fix and User validation when resolved, or the precise outstanding dependency and ownership when unresolved.",
  "Use User, Agent, Incident, Ticket, or Case where applicable. Do not use Customer, Caller, Client, I, We, You, He, She, or They in the generated documentation.",
  "Return only workNotes.issue, workNotes.tsPerformed, workNotes.output, and resolutionNotes. Do not return headings, markdown, bullet characters, Summary, RCA, Next Action, recommendations, or any other section.",
  "Before returning, verify that the Issue belongs to the supported User, every TS item came from the Agent's actual action or instruction, Output reflects the real result, Resolution Notes contain exactly two sentences, conversational filler is absent, and nothing was invented.",
].join(" ");

const CONVERSATIONAL_FILLER =
  /\b(?:hello|good morning|good afternoon|good evening|how are you|thank you for contacting|is there anything else|have a good day|you'?re welcome)\b/i;

type ProviderName = "openai" | "gemini" | "anthropic";

type ProviderConfig = {
  provider: ProviderName;
  apiKey: string;
  models: string[];
};

type ProviderResult = {
  output: AnalyzerOutput;
  validation: string[];
};

class ProviderRequestError extends Error {
  constructor(
    readonly provider: ProviderName,
    readonly model: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

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

function validateProviderOutput(parsed: unknown, provider: ProviderName): ProviderResult {
  if (!isStructurallyValid(parsed)) {
    throw new Error(`${provider} returned an invalid structured documentation response.`);
  }

  const output = normalizeOutput(parsed);
  return { output, validation: validationIssues(output) };
}

function buildInteractionPrompt(transcript: string, repairIssues: string[]): string {
  const repairInstruction = repairIssues.length
    ? `The previous generation failed these checks: ${repairIssues.join(
        "; ",
      )}. Regenerate the documentation and correct every listed problem.`
    : "";

  return [
    "Analyze the complete raw DXC support interaction below.",
    "Determine the User and Agent roles from labels and context.",
    "Extract the User's technical issue, the DXC Agent's actual troubleshooting, actions, and instructions in chronological order, the real technical outcome, and exactly two concise Resolution Notes sentences.",
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

function extractOpenAIText(payload: unknown): string | null {
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

function extractAnthropicText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const content = (payload as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;

  const text = content
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const type = (block as { type?: unknown }).type;
      const value = (block as { text?: unknown }).text;
      return type === "text" && typeof value === "string" ? value : "";
    })
    .join("")
    .trim();

  return text || null;
}

async function generateWithOpenAI(
  config: ProviderConfig,
  model: string,
  transcript: string,
  repairIssues: string[] = [],
): Promise<ProviderResult> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(55_000),
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 2200,
      instructions: systemInstruction,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildInteractionPrompt(transcript, repairIssues),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "dxc_servicenow_work_notes",
          description:
            "DXC ServiceNow documentation containing the User's Issue, chronological Agent TS Performed, technical Output, and exactly two-sentence Resolution Notes.",
          strict: true,
          schema: responseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new ProviderRequestError(
      "openai",
      model,
      response.status,
      `OpenAI request failed: ${detail.slice(0, 600)}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const text = extractOpenAIText(payload);
  const parsed = text ? parseStructuredOutput(text) : null;
  return validateProviderOutput(parsed, "openai");
}

async function generateWithGemini(
  config: ProviderConfig,
  model: string,
  transcript: string,
  repairIssues: string[] = [],
): Promise<ProviderResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      signal: AbortSignal.timeout(55_000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildInteractionPrompt(transcript, repairIssues) }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2200,
          responseFormat: {
            text: {
              mimeType: "application/json",
              schema: responseSchema,
            },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new ProviderRequestError(
      "gemini",
      model,
      response.status,
      `Gemini request failed: ${detail.slice(0, 600)}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const text = extractGeminiText(payload);
  const parsed = text ? parseStructuredOutput(text) : null;
  return validateProviderOutput(parsed, "gemini");
}

async function generateWithAnthropic(
  config: ProviderConfig,
  model: string,
  transcript: string,
  repairIssues: string[] = [],
): Promise<ProviderResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    signal: AbortSignal.timeout(55_000),
    body: JSON.stringify({
      model,
      max_tokens: 2200,
      system: systemInstruction,
      messages: [
        {
          role: "user",
          content: buildInteractionPrompt(transcript, repairIssues),
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: responseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new ProviderRequestError(
      "anthropic",
      model,
      response.status,
      `Anthropic request failed: ${detail.slice(0, 600)}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const stopReason =
    payload && typeof payload === "object"
      ? (payload as { stop_reason?: unknown }).stop_reason
      : undefined;

  if (stopReason === "refusal" || stopReason === "max_tokens") {
    throw new Error(`Anthropic response stopped with reason: ${String(stopReason)}.`);
  }

  const text = extractAnthropicText(payload);
  const parsed = text ? parseStructuredOutput(text) : null;
  return validateProviderOutput(parsed, "anthropic");
}

async function generateWithProvider(
  config: ProviderConfig,
  model: string,
  transcript: string,
  repairIssues: string[] = [],
): Promise<ProviderResult> {
  if (config.provider === "openai") {
    return generateWithOpenAI(config, model, transcript, repairIssues);
  }
  if (config.provider === "gemini") {
    return generateWithGemini(config, model, transcript, repairIssues);
  }
  return generateWithAnthropic(config, model, transcript, repairIssues);
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function normalizeProviderName(value: string | undefined): ProviderName | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "openai" || normalized === "open-ai") return "openai";
  if (normalized === "gemini" || normalized === "google") return "gemini";
  if (normalized === "anthropic" || normalized === "claude") return "anthropic";
  return null;
}

function inferProviderFromKey(apiKey: string): ProviderName | null {
  if (/^sk-ant-/i.test(apiKey)) return "anthropic";
  if (/^AIza/i.test(apiKey)) return "gemini";
  if (/^sk-/i.test(apiKey)) return "openai";
  return null;
}

function providerModels(provider: ProviderName): string[] {
  const genericModel = process.env.AI_MODEL;

  if (provider === "openai") {
    return uniqueValues([
      process.env.OPENAI_MODEL,
      genericModel,
      "gpt-5-mini",
      "gpt-4.1-mini",
      "gpt-4o-mini",
    ]);
  }

  if (provider === "gemini") {
    return uniqueValues([
      process.env.GEMINI_MODEL,
      process.env.GOOGLE_MODEL,
      genericModel,
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
    ]);
  }

  return uniqueValues([
    process.env.ANTHROPIC_MODEL,
    process.env.CLAUDE_MODEL,
    genericModel,
    "claude-haiku-4-5",
    "claude-sonnet-5",
    "claude-sonnet-4-6",
  ]);
}

function configuredProviders(): ProviderConfig[] {
  const preferred = normalizeProviderName(process.env.AI_PROVIDER);
  const genericKey = process.env.AI_API_KEY?.trim();
  const inferredGenericProvider = genericKey ? inferProviderFromKey(genericKey) : null;

  const providerKeys: Record<ProviderName, string[]> = {
    openai: uniqueValues([
      process.env.OPENAI_API_KEY,
      genericKey && (preferred === "openai" || (!preferred && inferredGenericProvider === "openai"))
        ? genericKey
        : undefined,
    ]),
    gemini: uniqueValues([
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY,
      genericKey && (preferred === "gemini" || (!preferred && inferredGenericProvider === "gemini"))
        ? genericKey
        : undefined,
    ]),
    anthropic: uniqueValues([
      process.env.ANTHROPIC_API_KEY,
      process.env.CLAUDE_API_KEY,
      genericKey &&
      (preferred === "anthropic" || (!preferred && inferredGenericProvider === "anthropic"))
        ? genericKey
        : undefined,
    ]),
  };

  const order: ProviderName[] = ["openai", "gemini", "anthropic"];
  if (preferred) {
    order.splice(order.indexOf(preferred), 1);
    order.unshift(preferred);
  }

  const providers: ProviderConfig[] = [];
  for (const provider of order) {
    for (const apiKey of providerKeys[provider]) {
      providers.push({
        provider,
        apiKey,
        models: providerModels(provider),
      });
    }
  }

  if (providers.length === 0 && genericKey && preferred) {
    providers.push({
      provider: preferred,
      apiKey: genericKey,
      models: providerModels(preferred),
    });
  }

  return providers;
}

function providerLabel(provider: ProviderName): string {
  if (provider === "openai") return "OpenAI";
  if (provider === "gemini") return "Gemini/Google";
  return "Claude/Anthropic";
}

function explainProviderFailure(error: unknown, provider: ProviderName): string {
  const label = providerLabel(provider);

  if (!(error instanceof ProviderRequestError)) {
    return `${label} returned an invalid or incomplete structured response.`;
  }

  if (error.status === 400) {
    return `${label} rejected the request configuration for model ${error.model}.`;
  }
  if (error.status === 401) {
    return `${label} rejected the API key. Verify that the configured key is active and belongs to ${label}.`;
  }
  if (error.status === 402) {
    return `${label} requires available API credits or an active billing plan.`;
  }
  if (error.status === 403) {
    return `${label} denied API access. Check project permissions, API restrictions, and model access.`;
  }
  if (error.status === 404) {
    return `${label} model ${error.model} is not available for this API key.`;
  }
  if (error.status === 429) {
    return `${label} quota or rate limit was exceeded. Check API usage, billing, and rate limits.`;
  }
  if (error.status >= 500) {
    return `${label} is temporarily unavailable. Please try again shortly.`;
  }

  return `${label} request failed with status ${error.status}.`;
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

  const providers = configuredProviders();

  if (providers.length === 0) {
    return NextResponse.json(
      {
        error:
          "No supported AI provider is configured. Add OPENAI_API_KEY, GEMINI_API_KEY or GOOGLE_API_KEY, or ANTHROPIC_API_KEY or CLAUDE_API_KEY in Vercel. You may also use AI_API_KEY with AI_PROVIDER set to openai, gemini, google, anthropic, or claude.",
      },
      { status: 503 },
    );
  }

  const visibleFailures: string[] = [];
  const providersTried: ProviderName[] = [];

  for (const provider of providers) {
    if (!providersTried.includes(provider.provider)) {
      providersTried.push(provider.provider);
    }

    let moveToNextProvider = false;

    for (const model of provider.models) {
      try {
        const firstAttempt = await generateWithProvider(provider, model, transcript);

        if (firstAttempt.validation.length === 0) {
          return NextResponse.json({
            output: firstAttempt.output,
            mode: provider.provider,
            model,
          });
        }

        const repairedAttempt = await generateWithProvider(
          provider,
          model,
          transcript,
          firstAttempt.validation,
        );

        if (repairedAttempt.validation.length > 0) {
          throw new Error(
            `${providerLabel(provider.provider)} response failed validation: ${repairedAttempt.validation.join(
              "; ",
            )}`,
          );
        }

        return NextResponse.json({
          output: repairedAttempt.output,
          mode: provider.provider,
          model,
        });
      } catch (error) {
        console.error(`${provider.provider}/${model} interaction analysis failed.`, error);
        visibleFailures.push(explainProviderFailure(error, provider.provider));

        if (
          error instanceof ProviderRequestError &&
          [401, 402, 403, 429].includes(error.status)
        ) {
          moveToNextProvider = true;
          break;
        }
      }
    }

    if (moveToNextProvider) continue;
  }

  const uniqueFailures = Array.from(new Set(visibleFailures));

  return NextResponse.json(
    {
      error:
        uniqueFailures.length > 0
          ? uniqueFailures.join(" ")
          : "The configured AI providers could not generate reliable work notes from this interaction.",
      providersTried,
    },
    { status: 502 },
  );
}
