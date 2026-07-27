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
            "One Output entry stating only the final technical result or finding after troubleshooting in 1 to 3 concise sentences.",
        },
      },
      required: ["issue", "tsPerformed", "output"],
    },
    resolutionNotes: {
      type: "string",
      description:
        "Exactly two concise professional sentences: current Incident status, followed by the confirmed fix/validation or the outstanding dependency.",
    },
  },
  required: ["workNotes", "resolutionNotes"],
} as const;

const systemInstruction = [
  "You are a Senior DXC IT Service Desk Analyst creating ServiceNow Work Notes from complete support interactions.",
  "The input is usually a long interactive conversation containing User messages, DXC Analyst messages, timestamps, names, automated system messages, greetings, clarifying questions, repeated explanations, hold messages, acknowledgements, and closing statements.",
  "Do not summarize the conversation. Analyze the dialogue and extract only the technical documentation required by the JSON schema.",

  "SPEAKER AND ROLE ANALYSIS:",
  "Identify the supported person as the User. Labels may include User, Customer, Caller, Client, Employee, Requester, End User, a person's name, or may be inferred from context.",
  "Identify DXC support personnel as the Agent. Labels may include Agent, Analyst, DXC Analyst, Support, Service Desk, Technician, Engineer, or a person's name associated with support actions.",
  "Use speaker labels, timestamps, message order, questions, answers, and technical context to determine who reported the issue, who provided troubleshooting, and who confirmed the result.",
  "A User statement is evidence of the issue, symptoms, business impact, actions completed, and final confirmation. An Agent statement is evidence of investigation, checks, troubleshooting performed, instructions provided, escalation, and status handling.",
  "Do not confuse a User's description of the problem with an Agent troubleshooting action.",
  "Do not treat a User's casual reply, acknowledgement, or repeated symptom as troubleshooting.",

  "IGNORE CONVERSATIONAL NOISE:",
  "Silently ignore greetings, introductions, how-are-you exchanges, pleasantries, apologies, empathy statements, acknowledgements, hold notifications, typing indicators, queue messages, bot prompts, survey invitations, repeated restatements, thank-you messages, goodbye statements, and standard support closing scripts.",
  "Never include hello, thank you for contacting support, is there anything else, have a good day, or similar filler in any output field.",
  "Retain identity verification only when the Agent explicitly completed it and it is appropriate to document as an Agent action.",

  "FACTUAL GROUNDING:",
  "Use only facts supported by the supplied interaction. Never fabricate troubleshooting, commands, checks, escalations, root causes, technical findings, approvals, timelines, resolutions, User actions, or final confirmation.",
  "When a cause is not confirmed, describe only the observed symptom or blocker.",
  "When a successful result is not confirmed, do not mark the Incident resolved.",
  "Remove duplicate actions while preserving the original chronological sequence.",

  "ISSUE:",
  "Write one Issue entry containing 1 to 3 professional sentences.",
  "Start with the User's technical impact: what the User could not do, what failed, or what service/device/account was affected.",
  "Include the affected application, service, device, or account and the business impact when stated.",
  "Include a cause only when it was clearly established during the interaction.",
  "Do not describe that the User contacted support and do not recap the conversation.",
  "Do not add a bullet symbol because the interface adds the > prefix.",

  "TS PERFORMED:",
  "Document the troubleshooting provided by the DXC Agent in chronological order, with one action per array item.",
  "Include actions the Agent directly performed, such as reviewing the issue, checking account status, examining configuration, running commands, resetting components, changing settings, testing functionality, reviewing logs, creating or referencing a Ticket, escalating a Case, or arranging a callback.",
  "Include troubleshooting the Agent instructed the User to perform, phrased accurately as Guided the User to..., Advised the User to..., Instructed the User to..., or Requested the User to....",
  "When the User confirms completing an Agent instruction, document the Agent's guidance and include the confirmation only when it materially explains the result.",
  "Do not claim the Agent performed an action that the User performed. Do not claim the User performed an instructed step unless completion is confirmed in the conversation.",
  "Do not include generic best-practice steps, inferred steps, future possibilities, greetings, empathy, repetitive questions, or closing statements.",
  "Use concise professional past-tense wording. Do not add bullet symbols because the interface adds the > prefix.",

  "OUTPUT:",
  "Write one Output entry containing 1 to 3 concise professional sentences.",
  "State what happened after the troubleshooting: successful access, restored functionality, persistent error, identified blocker, failed test, required credentials, missing license, escalation requirement, or another supported technical conclusion.",
  "Output is the technical result, not the resolution status and not a list of future actions.",
  "Do not merely repeat the Issue or the troubleshooting steps.",
  "If the interaction ends without a confirmed technical result, state that no successful outcome was confirmed and identify the last supported finding.",
  "Do not add a bullet symbol because the interface adds the > prefix.",

  "RESOLUTION NOTES:",
  "Write exactly two short professional sentences in one string.",
  "Sentence 1 must state the current Incident status: Resolved, Pending User Action, Pending Manager Approval, Pending License Assignment, Pending Replacement, Pending Restart, Pending Validation, Pending Callback, Pending Synchronization, Escalated, Awaiting Specialist Team, Awaiting Hardware, Awaiting Remote Session, Awaiting Admin Credentials, On Hold, or Transferred.",
  "Sentence 2 must briefly state the confirmed fix and User validation when resolved, or the precise outstanding dependency/next ownership when unresolved.",
  "Keep both sentences specific to the interaction. Do not use vague wording such as documented troubleshooting actions were completed.",
  "Do not repeat the full Output and do not add a bullet symbol because the interface adds the > prefix.",

  "TERMINOLOGY AND OUTPUT CONTROL:",
  "Use User, Agent, Incident, Ticket, or Case where applicable. Do not use Customer, Caller, Client, I, We, You, He, She, or They in the generated documentation.",
  "Correct grammar and product names while preserving technical meaning.",
  "Return only workNotes.issue, workNotes.tsPerformed, workNotes.output, and resolutionNotes in the required JSON schema.",
  "Do not return Summary, RCA, Next Action, recommendations, headings, markdown, bullet characters, or any other section.",
  "Before returning, verify that the Issue belongs to the supported User, every TS item came from the Agent's actual action or instruction, Output reflects the real result, Resolution Notes contain exactly two sentences, and nothing was invented.",
].join(" ");

const CONVERSATIONAL_FILLER =
  /\b(?:hello|good morning|good afternoon|good evening|how are you|thank you for contacting|is there anything else|have a good day|you'?re welcome)\b/i;

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

  if (issueCount < 1 || issueCount > 3) {
    issues.push("Issue must contain 1 to 3 sentences");
  }
  if (output.workNotes.tsPerformed.length > 20) {
    issues.push("TS Performed must contain no more than 20 chronological actions");
  }
  if (outputCount < 1 || outputCount > 3) {
    issues.push("Output must contain 1 to 3 sentences");
  }
  if (resolutionCount !== 2) {
    issues.push("Resolution Notes must contain exactly two sentences");
  }

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

type OpenAIResult = {
  output: AnalyzerOutput;
  validation: string[];
};

async function generateWithOpenAI({
  apiKey,
  model,
  transcript,
  repairIssues = [],
}: {
  apiKey: string;
  model: string;
  transcript: string;
  repairIssues?: string[];
}): Promise<OpenAIResult> {
  const repairInstruction = repairIssues.length
    ? `\n\nThe previous generation failed these checks: ${repairIssues.join(
        "; ",
      )}. Regenerate the documentation and correct every listed problem.`
    : "";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(55_000),
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 2200,
      reasoning: { effort: "medium" },
      instructions: systemInstruction,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Analyze the complete raw DXC support interaction below.",
                "Determine the User and Agent roles from labels and context.",
                "Extract the User's technical issue, the DXC Agent's actual troubleshooting/actions/instructions in chronological order, the real technical outcome, and exactly two concise Resolution Notes sentences.",
                "Ignore all non-technical conversation.",
                repairInstruction,
                "",
                "<support_interaction>",
                transcript,
                "</support_interaction>",
              ].join("\n"),
            },
          ],
        },
      ],
      text: {
        verbosity: "low",
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
    throw new Error(`OpenAI request failed with status ${response.status}: ${detail.slice(0, 400)}`);
  }

  const payload = (await response.json()) as unknown;
  const outputText = extractOutputText(payload);
  const parsed = outputText ? parseStructuredOutput(outputText) : null;

  if (!isStructurallyValid(parsed)) {
    throw new Error("OpenAI returned an invalid structured documentation response.");
  }

  const output = normalizeOutput(parsed);
  return { output, validation: validationIssues(output) };
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenAI analysis is not configured. Add OPENAI_API_KEY in Vercel and redeploy the project.",
      },
      { status: 503 },
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.1";

  try {
    const firstAttempt = await generateWithOpenAI({ apiKey, model, transcript });

    if (firstAttempt.validation.length === 0) {
      return NextResponse.json({ output: firstAttempt.output, mode: "openai" });
    }

    const repairedAttempt = await generateWithOpenAI({
      apiKey,
      model,
      transcript,
      repairIssues: firstAttempt.validation,
    });

    if (repairedAttempt.validation.length > 0) {
      throw new Error(`OpenAI response failed validation: ${repairedAttempt.validation.join("; ")}`);
    }

    return NextResponse.json({ output: repairedAttempt.output, mode: "openai" });
  } catch (error) {
    console.error("OpenAI interaction analysis failed.", error);
    return NextResponse.json(
      {
        error:
          "The AI could not generate reliable work notes from this interaction. Verify the OpenAI key, model access, and API quota, then try again.",
      },
      { status: 502 },
    );
  }
}
