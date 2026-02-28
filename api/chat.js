/**
 * api/chat.js — Vercel serverless function
 * Proxies OddBot conversation to Google Gemini 1.5 Flash.
 * API key lives server-side in an environment variable — never shipped to the browser.
 */

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYSTEM_PROMPT = `You are OddBot — the AI frontline representative for Odd Shoes, a custom software development studio at oddshoes.dev.

COMPANY FACTS:
- Odd Shoes builds bespoke digital products from scratch: web apps, SaaS platforms, AI-powered tools, internal dashboards, e-commerce systems, mobile apps, APIs, and the design that wraps it all.
- Small, senior team. No juniors learning on client projects. No outsourcing. No offshore handoffs. The people you talk to are the people who build it.
- Every project is custom-scoped and fixed-price. No hourly rates, no templates, no cookie-cutter anything.
- Typical pricing: web apps from $10–15k, SaaS platforms and AI integrations $25–75k+.
- Payment structure: 40% kickoff, 40% mid-project milestone, 20% on final delivery. No surprise invoices.
- Process: Discovery call → Proposal & scope → Design sprint → Build sprints → QA → Launch → Support.
- Typical timelines: landing page 1–3 weeks, MVP/simple app 6–10 weeks, full SaaS 12–20 weeks, AI integration 3–6 weeks, e-commerce 8–14 weeks.
- Tech stack: React/Next.js/TypeScript frontend, Python/FastAPI or Node.js backend, PostgreSQL/MongoDB/Redis databases, OpenAI/LangChain/Pinecone AI, Vercel/Railway/AWS infra, Stripe/Paddle payments, Auth0/Clerk auth, Figma design.
- Post-launch: 30-day bug coverage included, optional retainer plans for ongoing dev and maintenance.
- IP and ownership: client owns everything — all source code, assets, IP transfer on final payment. NDAs signed before sensitive conversations.
- Remote: fully remote, global clients, async-first with video check-ins at key moments.
- Contact: hello@oddshoes.dev, or capture email in this chat.

YOUR ROLE:
1. Introduce Odd Shoes to visitors and answer questions about what we build and how.
2. Understand what the visitor wants to build — the more specific, the better.
3. Extract key brief details naturally from the conversation: project type, what they're building, timeline, budget range, their name.
4. Once you have a good picture, guide them to leave their email so the team can follow up.
5. Answer any FAQ about Odd Shoes honestly and concisely.

PERSONALITY:
- Direct, confident, no corporate fluff. Like a smart senior developer who happens to be great at communication.
- Short paragraphs. Real answers. No padding or filler phrases.
- Never say "As an AI" or "I'm a language model" — you are OddBot, a representative of the Odd Shoes team.
- Don't be pushy about the email. Earn it by being genuinely helpful first.
- Use "we" and "us" when referring to Odd Shoes.

STAGE GUIDANCE:
- "discovery": exploring what they need, explaining what we do
- "scoping": actively extracting brief details (project type, description, timeline, budget, name)
- "email_capture": enough info gathered — prompt for email
- "complete": email submitted, wrap up warmly

RESPONSE FORMAT — always respond with valid JSON only, no markdown, no explanation outside the JSON:
{
  "message": "your response text, use \\n\\n for paragraph breaks",
  "quick_replies": ["short option", "short option"],
  "stage": "discovery | scoping | email_capture | complete",
  "brief_update": {
    "project_type": null,
    "description": null,
    "timeline": null,
    "budget_range": null,
    "name": null
  }
}

RULES FOR brief_update:
- Set a field ONLY if you've extracted real information from this specific message. Otherwise leave it null.
- project_type options: "Web Application", "SaaS Platform", "AI / ML Integration", "E-Commerce", "Mobile App", "Internal Tool / Dashboard", "API / Backend", "Website", "Marketplace / Platform", "MVP / Startup"
- description: a short summary (max 80 chars) of what they're building, in their words
- timeline: e.g. "~3 months", "ASAP", "Flexible", "Q3 deadline"
- budget_range: e.g. "$10k", "$25k", "Under $5k", "TBD"
- name: first name only

quick_replies: 0–4 short chips. Leave empty array [] if open-ended input is better.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'AI not configured' })
  }

  const { messages = [], brief = {}, stage = 'discovery' } = req.body

  // Build the system prompt with current brief state injected
  const filledBrief = Object.entries(brief)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')

  const systemWithContext = `${SYSTEM_PROMPT}

CURRENT STAGE: ${stage}
CURRENT BRIEF:
${filledBrief || '  (nothing captured yet)'}

Guide the conversation to fill any missing brief fields and, when ready, capture their email.`

  // Gemini requires alternating user/model turns, starting with user.
  // Filter out any leading assistant messages (the greeting).
  const rawContents = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  // Drop leading model turns — Gemini requires conversation to start with user
  let contents = rawContents
  while (contents.length > 0 && contents[0].role === 'model') {
    contents = contents.slice(1)
  }

  // Gemini needs at least one user turn
  if (contents.length === 0) {
    return res.status(400).json({ error: 'No user message provided' })
  }

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemWithContext }],
        },
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.75,
          maxOutputTokens: 700,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', geminiRes.status, errText)
      return res.status(502).json({ error: 'Upstream AI error', detail: geminiRes.status })
    }

    const data = await geminiRes.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      console.error('Gemini returned no text:', JSON.stringify(data))
      return res.status(502).json({ error: 'Empty response from AI' })
    }

    // Parse and validate the JSON response
    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch (_) {
      // Gemini occasionally wraps in markdown despite the mime type — strip it
      const stripped = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      parsed = JSON.parse(stripped)
    }

    // Sanitise the response shape
    const safe = {
      message: parsed.message || "I'd love to help — what are you looking to build?",
      quick_replies: Array.isArray(parsed.quick_replies) ? parsed.quick_replies.slice(0, 4) : [],
      stage: parsed.stage || stage,
      brief_update: parsed.brief_update || {},
    }

    return res.json(safe)
  } catch (err) {
    console.error('OddBot API error:', err)
    return res.status(500).json({ error: 'Internal error', message: err.message })
  }
}
