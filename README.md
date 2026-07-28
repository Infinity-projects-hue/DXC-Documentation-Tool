# DXC Documentation Tool

A Next.js support-documentation workspace that converts full support transcripts into structured ServiceNow Work Notes and two-sentence Resolution Notes.

## AI providers

The analyzer supports OpenAI, Google Gemini, and Anthropic Claude. Configure one or more server-side environment variables:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_google_ai_studio_key
```

Alternative provider keys:

```bash
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

`GOOGLE_API_KEY` and `CLAUDE_API_KEY` are supported aliases. Never expose provider keys through variables beginning with `NEXT_PUBLIC_`.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Production

Add the same environment variables in Vercel for Production, then create a new deployment. The browser sends transcripts only to the server-side `/api/analyze` route; provider credentials remain server-side.
