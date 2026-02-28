/**
 * engine.js — Client-side conversation engine for OddBot
 * All logic runs in the browser. No backend required.
 */

const BRIEF_EXTRACTORS = {
  project_type: [
    { pattern: /\b(saas|software as a service)\b/i, value: 'SaaS Platform' },
    { pattern: /\b(web app|webapp|web application)\b/i, value: 'Web Application' },
    { pattern: /\b(mobile app|ios|android)\b/i, value: 'Mobile App' },
    { pattern: /\b(e-?comm(erce)?|online store|shopify|shop)\b/i, value: 'E-Commerce' },
    { pattern: /\b(dashboard|admin panel|internal tool)\b/i, value: 'Internal Tool / Dashboard' },
    { pattern: /\b(ai|machine learning|ml|llm|chatbot|gpt)\b/i, value: 'AI / ML Integration' },
    { pattern: /\b(api|backend|microservice)\b/i, value: 'API / Backend' },
    { pattern: /\b(website|landing page|portfolio)\b/i, value: 'Website' },
    { pattern: /\b(marketplace|platform)\b/i, value: 'Marketplace / Platform' },
  ],
  timeline: [
    { pattern: /\b(asap|immediately|urgent|right away|as soon as possible)\b/i, value: 'ASAP' },
    { pattern: /\b1[\s-]?month|4[\s-]?weeks?\b/i, value: '~1 month' },
    { pattern: /\b(2|two)[\s-]?months?\b/i, value: '~2 months' },
    { pattern: /\b(3|three)[\s-]?months?\b/i, value: '~3 months' },
    { pattern: /\b(6|six)[\s-]?months?\b/i, value: '~6 months' },
    { pattern: /\b(q1|q2|q3|q4)\b/i, value: (m) => m[0].toUpperCase() + ' deadline' },
    { pattern: /\bno (hard )?deadline\b/i, value: 'Flexible' },
    { pattern: /\b(flexible|whenever|no rush)\b/i, value: 'Flexible' },
    { pattern: /\bend of (the )?(year|month|quarter)\b/i, value: 'End of period' },
  ],
  budget_range: [
    { pattern: /\bunder\s*\$?5k\b|\b\$?[1-4],?\d{3}\b/i, value: 'Under $5k' },
    { pattern: /\b\$?5[,.]?000|\bfive\s*k\b/i, value: '$5k' },
    { pattern: /\b\$?10[,.]?000|\bten\s*k\b/i, value: '$10k' },
    { pattern: /\b\$?15[,.]?000|\bfifteen\s*k\b/i, value: '$15k' },
    { pattern: /\b\$?20[,.]?000|\btwenty\s*k\b/i, value: '$20k' },
    { pattern: /\b\$?25[,.]?000\b/i, value: '$25k' },
    { pattern: /\b\$?50[,.]?000|\bfifty\s*k\b/i, value: '$50k' },
    { pattern: /\$?(\d+)k/i, value: (m) => `$${m[1]}k` },
    { pattern: /\bnot sure|unsure|don't know|no idea|tbd\b/i, value: 'TBD' },
  ],
  name: [
    { pattern: /(?:i'?m|my name is|call me|i'?m called)\s+([A-Z][a-z]+)/i, value: (m) => m[1] },
  ],
}

export function extractBriefUpdates(text) {
  const updates = {}
  for (const [field, rules] of Object.entries(BRIEF_EXTRACTORS)) {
    for (const rule of rules) {
      const match = text.match(rule.pattern)
      if (match) {
        updates[field] = typeof rule.value === 'function' ? rule.value(match) : rule.value
        break
      }
    }
  }
  return updates
}

// ─── Keyword detection helpers ──────────────────────────────────────────────

const kw = (text, ...words) => words.some(w => text.includes(w))

const isOffTopic = (t) => kw(t,
  'weather', 'recipe', 'sport', 'game', 'movie', 'music', 'actor',
  'politics', 'news', 'crypto', 'bitcoin', 'stock', 'celebrity',
  'competitor', 'vs ', 'better than', 'compare', 'alternat',
  'joke', 'tell me a', 'write me a poem', 'sing', 'rap',
)

const isPrice        = (t) => kw(t, 'price', 'cost', 'budget', 'pricing', 'how much', 'rate', 'fee', 'charge', 'afford', 'expensive', 'invoice', 'pay', 'payment')
const isProcess      = (t) => kw(t, 'process', 'how do you', 'workflow', 'how long', 'steps', 'phases', 'approach', 'methodology', 'agile', 'sprint')
const isTimeline     = (t) => kw(t, 'timeline', 'how long', 'time to build', 'how quickly', 'turnaround', 'when can you', 'how fast', 'delivery', 'deadline', 'eta')
const isService      = (t) => kw(t, 'build', 'make', 'create', 'develop', 'need', 'want', 'looking for', 'app', 'website', 'saas', 'platform', 'tool', 'system', 'software', 'product')
const isWork         = (t) => kw(t, 'portfolio', 'example', 'past', 'clients', 'case study', 'seen', 'showcase', 'show me', 'what have you built', 'previous work')
const isAbout        = (t) => kw(t, 'who are you', 'what do you do', 'about odd', 'what is odd', 'tell me about', 'what you do', 'what kind of company', 'who is odd shoes')
const isAI           = (t) => kw(t, 'ai', 'machine learning', 'llm', 'gpt', 'openai', 'ml ', 'artificial intelligence', 'automation', 'rag', 'langchain', 'vector', 'embedding', 'fine-tun', 'copilot', 'gen ai', 'generative')
const isContact      = (t) => kw(t, 'contact', 'reach', 'talk to a human', 'speak to', 'hello@', 'book', 'meet', 'schedule', 'get in touch', 'email you', 'call you')
const isHello        = (t) => kw(t, 'hello', 'hi ', 'hey', 'sup', 'yo ', "what's up", 'hiya', 'greetings', 'good morning', 'good afternoon')
const isThankYou     = (t) => kw(t, 'thank', 'thanks', 'appreciate', 'perfect', 'love it', 'sounds good', 'that helps', 'got it')
const isStack        = (t) => kw(t, 'stack', 'technology', 'technologies', 'tech stack', 'language', 'framework', 'react', 'vue', 'angular', 'next.js', 'nextjs', 'node', 'python', 'django', 'fastapi', 'postgres', 'mysql', 'mongodb', 'what do you use', 'what do you code in', 'what do you program in')
const isDesign       = (t) => kw(t, 'design', 'ui', 'ux', 'figma', 'wireframe', 'mockup', 'prototype', 'branding', 'visual', 'look and feel', 'style', 'ui/ux')
const isMobile       = (t) => kw(t, 'mobile', 'ios', 'android', 'react native', 'flutter', 'app store', 'google play', 'native app', 'phone app')
const isSupport      = (t) => kw(t, 'support', 'after launch', 'maintenance', 'post launch', 'bug fix', 'ongoing', 'retainer', 'keep running', 'update after', 'changes after', 'what happens after')
const isRevisions    = (t) => kw(t, 'revision', 'change', 'feedback', 'iteration', 'amend', 'update', 'modify', 'edit', 'tweak', 'how many changes', 'how many revisions')
const isNDA          = (t) => kw(t, 'nda', 'confidential', 'non-disclosure', 'secret', 'private', 'sign an', 'intellectual property', 'ip ', 'ownership', 'who owns')
const isTeam         = (t) => kw(t, 'team', 'who works', 'how many people', 'developers', 'staff', 'employees', 'team size', 'who will work', 'who builds', 'dedicated', 'offshore', 'outsource')
const isRemote       = (t) => kw(t, 'remote', 'location', 'where are you', 'based', 'country', 'timezone', 'in person', 'office', 'local', 'onsite', 'on-site')
const isHosting      = (t) => kw(t, 'hosting', 'deploy', 'deployment', 'server', 'cloud', 'aws', 'gcp', 'azure', 'vercel', 'railway', 'digital ocean', 'infrastructure', 'devops', 'ci/cd', 'pipeline', 'where does it run')
const isSecurity     = (t) => kw(t, 'security', 'secure', 'gdpr', 'compliance', 'data protection', 'encryption', 'vulnerability', 'penetration', 'pentest', 'auth', 'authentication', 'authorization', 'sso', 'oauth', 'safe')
const isIntegration  = (t) => kw(t, 'integrat', 'stripe', 'paypal', 'payment gateway', 'api integrat', 'third party', 'third-party', 'connect to', 'zapier', 'webhook', 'crm', 'salesforce', 'hubspot', 'slack', 'twilio', 'sendgrid', 'firebase', 'auth0')
const isExistingCode = (t) => kw(t, 'existing code', 'existing project', 'take over', 'inherit', 'legacy', 'already built', 'half built', 'partially built', 'codebase', 'someone else built', 'another developer', 'previous developer', 'continue work', 'pick up')
const isStartup      = (t) => kw(t, 'startup', 'mvp', 'minimum viable', 'idea stage', 'early stage', 'just an idea', 'validate', 'proof of concept', 'poc')
const isDatabase     = (t) => kw(t, 'database', 'data', 'postgres', 'mysql', 'mongodb', 'redis', 'storage', 'migration', 'schema', 'sql', 'nosql')
const isTesting      = (t) => kw(t, 'test', 'testing', 'qa', 'quality assurance', 'bug', 'unit test', 'e2e', 'end to end', 'automated test', 'coverage')
const isSmallProject = (t) => kw(t, 'small', 'simple', 'quick', 'just a', 'only need', 'landing page', 'basic', 'just need', 'something small', 'minor', 'small project', 'little project')
const isGetStarted   = (t) => kw(t, 'get started', 'start a project', 'kick off', 'begin', 'next steps', 'how do i start', 'what do i do next', 'where do i begin', 'sign up', 'onboard')
const isGenesis      = (t) => kw(t, 'genesis', '5 day', '5-day', 'five day', 'fast mvp', 'quick mvp', 'single feature', 'pre-revenue', 'pre revenue', 'launch friday')
const isKingdom      = (t) => kw(t, 'kingdom builder', 'kingdom build', '14 day', '14-day', 'fourteen day', 'fractional cto', 'complete product', 'full product', 'scale', 'scaling')
const isGiveHim50    = (t) => kw(t, 'give him 50', 'give him fifty', 'kingdom work', '50%', 'mission', 'charity', 'donate', 'profits', 'church', 'missionary', 'faith', 'christian', 'god', 'jesus', 'kingdom', 'calling', 'ministry', 'pray', 'worship')
const isBillyPods    = (t) => kw(t, 'billy pod', 'billy pods', 'intern', 'pod', 'team extension', 'coordinator')
const isPlanner      = (t) => kw(t, 'planner', 'project planner', 'proposal', 'get a quote', 'get started', 'start now', 'apply')

// ─── Response bank ───────────────────────────────────────────────────────────

const RESPONSES = {
  greeting: {
    message: `A higher calling. A better startup.\n\nI'm OddBot — built by the Odd Shoes team in Kampala, Uganda. We build production-grade apps for Christian founders who believe business can be a vehicle for Kingdom impact. 100+ MVPs shipped. 5–14 days to launch. 50% of our profits go to Kingdom work.\n\nWhat are you looking to build?`,
    quick_replies: ['Tell me about your services', 'I have a project idea', 'How does pricing work?', 'What is Give Him 50?'],
    stage: 'discovery',
    action: null,
  },

  offTopic: {
    message: `That's outside my lane — but I'm not going anywhere.\n\nIf you've got a startup idea, a product to build, or a problem to solve, the Odd Shoes team is ready. What are you working on?`,
    quick_replies: ['I have a project idea', 'Tell me about Odd Shoes', 'How does pricing work?'],
    stage: 'discovery',
    action: null,
  },

  about: {
    message: `Odd Shoes is a faith-driven startup studio based in Kampala, Uganda.\n\nWe were built for one kind of founder: Christian entrepreneurs with God-given ideas who can't find developers that understand their mission — or can't afford the big agencies.\n\nSmall, senior team. Worshippers and musicians who happen to be engineers. Every sprint starts with prayer. Every product is built to serve.\n\nThe Give Him 50 model: 50% of every project's profit goes to Kingdom work — missionaries, church plants, and ministry across East Africa. We don't do this because we have to. We do it because we get to.\n\nContact: buildit@oddshoes.dev or book a call at calendly.com/builtbyoddshoes\n\nWhat's the idea you're sitting on?`,
    quick_replies: ['See your services', 'View past work', 'What is Give Him 50?', 'I have a project'],
    stage: 'discovery',
    action: null,
  },

  price: {
    message: `Pricing is scoped per project and discussed in the Project Planner — never a surprise.\n\nThe two main packages:\n\n• **Genesis Build** — 5-day MVP. Single core feature, production-ready, launched Friday. Built for pre-revenue founders with a clear idea. Budget-accessible by design.\n• **Kingdom Builder** — 14-day complete product + 6 months fractional CTO support. Multi-feature app, full brand, AI automation included. Limited to 3 projects/month.\n\nAI & Automation is available as a standalone add-on at various levels.\n\nStart the Project Planner to share your vision and budget — the team will work with you from there.`,
    quick_replies: ['Launch Project Planner', 'Tell me about Genesis Build', 'Tell me about Kingdom Builder', 'Book a call'],
    stage: 'email_capture',
    action: 'request_email',
  },

  process: {
    message: `Two tracks depending on your stage:\n\n**Genesis Build (5 days):**\n1. Day 1 — Vision Lock: 2hr strategy call, scope locked, no feature creep\n2. Days 2–4 — Build: single feature + auth + database + React UI\n3. Day 5 — Launch: deployed to production, landing page, team walkthrough\n\n**Kingdom Builder (14 days + 6 months):**\n1. Days 1–3 — Brand & Strategy: full identity, user research, architecture\n2. Days 4–12 — Build: multi-feature app, Stripe/M-Pesa, AI automation, admin dashboard\n3. Days 13–14 — Polish & Deploy: QA, performance, production, training\n4. Months 1–6 — Fractional CTO: strategy calls, bug fixes, design hours, roadmap\n\nBoth include 30-day bug fixes post-launch.\n\nWhich stage are you at — pre-revenue with one idea, or ready to scale?`,
    quick_replies: ['Pre-revenue — one idea', 'Ready to scale', 'I need AI automation', 'Start the planner'],
    stage: 'scoping',
    action: null,
  },

  work: {
    message: `We've shipped 100+ MVPs and 15+ products live — including:\n\nNextGenHims, DaVinci Analytics, Lightbeam Media, DevFest QA, BlueOx Business, HeadshotCam, PicFlair, InstantUGC, Glo SACCO — and many more under NDA.\n\nOne client secured a $250K seed round in 2023. Multiple clients have since received VC funding.\n\nSee the full portfolio: oddshoes.dev/work\n\nWhat kind of product are you looking to build?`,
    quick_replies: ['I need something similar', 'I have a new idea', 'How long do projects take?'],
    stage: 'discovery',
    action: 'show_cta',
  },

  service_web: {
    message: `Web apps are our bread and butter. React frontends, Python or Node backends, Postgres databases — deployed and fast.\n\nTell me more — who's using this, and what does it need to do? The specific use case helps me figure out the right shape for your project.`,
    quick_replies: ['It\'s B2B', 'It\'s consumer-facing', 'It\'s internal', 'It handles transactions'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'Web Application' },
  },

  service_ai: {
    message: `AI integrations are one of our fastest-growing services. OpenAI, LangChain, custom RAG pipelines, fine-tuning, AI agents — we've shipped production-grade AI features across industries.\n\nWhat's the AI doing in your product? Automating something, generating content, analyzing data, talking to users?`,
    quick_replies: ['Automating a workflow', 'Generating content', 'Analyzing data', 'Customer-facing chatbot'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'AI / ML Integration' },
  },

  service_saas: {
    message: `SaaS from 0→1 is a full ride — auth, billing, multi-tenancy, dashboards, APIs, the lot. We've done it. We know the pitfalls.\n\nWhat does your SaaS do, and who's it for? B2B, B2C, enterprise? The clearer we get on the customer, the sharper the scope.`,
    quick_replies: ['B2B SaaS', 'B2C product', 'We have users already', 'Greenfield project'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'SaaS Platform' },
  },

  service_ecomm: {
    message: `Custom e-commerce means no Shopify limits, no plugin dependencies — you own the stack. We build storefronts, headless commerce, checkout flows, inventory systems, and integrations.\n\nWhat's wrong with your current setup, or is this a new store from scratch?`,
    quick_replies: ['New store from scratch', 'Replacing an existing platform', 'Custom checkout/cart', 'Headless / API-driven'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'E-Commerce' },
  },

  contact: {
    message: `You can reach the team directly at:\n\n• **Email:** buildit@oddshoes.dev\n• **WhatsApp:** +31 97 010 209 759 — wa.me/3197010209759\n• **Book a call:** calendly.com/builtbyoddshoes\n• **Project Planner:** oddshoes.dev/planner\n\nOr drop your email here and we'll come to you. Someone responds within 24 hours.`,
    quick_replies: ['Drop my email here', 'Launch the Project Planner', 'Book a call on Calendly'],
    stage: 'email_capture',
    action: 'request_email',
  },

  scoping_followup: {
    message: `Good — starting to take shape. Three quick things to complete the brief: what's your name, what's the rough timeline you're working toward, and is there a budget range in mind?`,
    quick_replies: ['Need it in 3 months', 'Flexible on timing', 'Under $20k', 'Not sure on budget yet'],
    stage: 'scoping',
    action: null,
  },

  nameAsk: {
    message: `Almost there — one thing missing from the brief: what's your name? Then I'll pull everything together and get it over to the team.`,
    quick_replies: [],
    stage: 'scoping',
    action: null,
  },

  timeline_got: {
    message: `Got it. And ballpark — is there a budget you're working within? Even a rough range helps us scope the right solution for what you actually need, not just what fits a template.`,
    quick_replies: ['Under $10k', '$10–25k', '$25–50k', 'Not sure yet'],
    stage: 'scoping',
    action: null,
  },

  budget_got: {
    message: `That's a solid picture. Let's make it real — drop your email and I'll put together what I've captured here as a proper brief. The team will follow up to scope it properly and get a call on the books.`,
    quick_replies: [],
    stage: 'email_capture',
    action: 'request_email',
  },

  thanks: {
    message: `Appreciate it. Let's actually build something — what's the project?`,
    quick_replies: ['I have a project idea', 'Tell me more about Odd Shoes'],
    stage: 'discovery',
    action: null,
  },

  generic_discovery: {
    message: `Interesting. Tell me more — what's the core problem this solves, and who's it for? The more specific, the sharper the brief I can put together.`,
    quick_replies: ['It solves...', 'The users are...', 'The main feature is...', 'It replaces...'],
    stage: 'scoping',
    action: null,
  },

  generic_scoping: {
    message: `Useful. What's driving the timeline — hard deadline, launch event, or more "as soon as it's right"?`,
    quick_replies: ['Hard deadline', 'Launch event', 'No strict timeline', 'Yesterday would have been ideal'],
    stage: 'scoping',
    action: null,
  },

  push_to_email: {
    message: `You've given me enough to work with. Drop your email — I'll compile the brief and get the team to reach out with initial thoughts and a proposed scope.`,
    quick_replies: [],
    stage: 'email_capture',
    action: 'request_email',
  },

  cta_end: {
    message: `You're in. Someone from the Odd Shoes team will be in touch within 24 hours.\n\nIn the meantime — explore the portfolio at oddshoes.dev/work, or book a call directly at calendly.com/builtbyoddshoes.\n\nBuilt with prayer from Kampala. 👏`,
    quick_replies: ['Visit oddshoes.dev', 'Book a call', 'What happens next?'],
    stage: 'complete',
    action: 'brief_complete',
  },

  discovery_call_info: {
    message: `Quick and focused — 20 to 30 minutes. We dig into the problem, who it's for, what you've tried, and what success looks like.\n\nFor most founders we'd recommend starting with the Project Planner first (oddshoes.dev/planner) — it helps us come to the call prepared so you get more out of it.\n\nOr book directly: calendly.com/builtbyoddshoes\n\nNo hard sell. No homework. Just a real conversation.`,
    quick_replies: ['Launch Project Planner', 'Book a call', 'Drop my email first'],
    stage: 'email_capture',
    action: 'request_email',
  },

  // ── FAQ: Tech Stack ─────────────────────────────────────────────────────
  stack: {
    message: `We pick the right tool for the job — not the trendiest one.\n\nTypical stack:\n• **Frontend:** React, Next.js, Vue, TypeScript\n• **Backend:** FastAPI (Python), Node.js, Express, Django\n• **Databases:** PostgreSQL, MongoDB, Redis, Supabase\n• **AI/ML:** OpenAI API, LangChain, Pinecone, Hugging Face\n• **Infra & Deploy:** Vercel, Railway, AWS, GCP, Docker, CI/CD\n• **Auth:** Auth0, Clerk, NextAuth, custom JWT\n• **Payments:** Stripe, Paddle\n• **Design:** Figma → coded component systems\n\nWe don't force a stack on you. If you have existing infrastructure, we work within it.`,
    quick_replies: ['Do you work with existing code?', 'What about mobile?', 'Can you handle AI features?'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Design ──────────────────────────────────────────────────────────
  design: {
    message: `Yes — design is built in, not bolted on.\n\nWe don't hand you wireframes and walk away. Our designers and developers work in tandem — Figma to code, component systems, responsive layouts, the whole thing.\n\nWe handle: UX research, information architecture, UI design, design systems, and front-end implementation. If you have an existing brand, we work within it. If you need one, we'll build it.\n\nWhat's the design situation on your project?`,
    quick_replies: ['I have an existing brand', 'I need design from scratch', 'Just need dev, have a designer'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Mobile ──────────────────────────────────────────────────────────
  mobile: {
    message: `Yes — we build mobile. React Native for cross-platform (iOS + Android from one codebase), or native if performance demands it.\n\nMost of our mobile projects are paired with a web app or backend system — so if you need the full product, not just the app, we've got it.\n\nWhat does the app do, and does it need a backend or web counterpart?`,
    quick_replies: ['Needs a backend too', 'Standalone app', 'iOS + Android both', 'Just iOS for now'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'Mobile App' },
  },

  // ── FAQ: Support & Maintenance ───────────────────────────────────────────
  support: {
    message: `We don't ship and disappear.\n\nAfter launch, we offer:\n• **Bug fixes** — covered for 30 days post-launch, no extra charge\n• **Retainer plans** — ongoing dev hours for features, updates, and fixes\n• **Ad-hoc support** — smaller requests handled on a project basis\n• **Monitoring** — uptime, error tracking, performance alerts set up on delivery\n\nWe also write solid documentation on handoff so your team isn't dependent on us forever — unless you want to be.\n\nDo you have ongoing support needs in mind?`,
    quick_replies: ['I\'d want a retainer', 'Just initial launch support', 'Tell me about retainer pricing'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Revisions ───────────────────────────────────────────────────────
  revisions: {
    message: `Revisions are built into how we work, not tacked on as extras.\n\nDuring the design phase — unlimited rounds until it's right, within scope. During build — we run regular check-ins so feedback is continuous, not saved for the end.\n\nScope changes (new features, major pivots) get scoped as change requests with honest pricing. We don't hide money surprises.\n\nWhat matters to you — design flexibility, or keeping the budget tight?`,
    quick_replies: ['Design flexibility is key', 'Budget certainty matters most', 'Both, ideally'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: NDA / Ownership ─────────────────────────────────────────────────
  nda: {
    message: `Standard practice — yes to both.\n\n**NDA:** We sign mutual NDAs before any sensitive conversations. Your ideas stay yours.\n\n**Ownership:** You own everything we build for you. All source code, assets, and IP transfer to you on final payment. We don't retain rights or licenses.\n\nWe also don't add your project to our portfolio without explicit permission — especially for anything under NDA.\n\nAny other legal or IP questions before we get into the project?`,
    quick_replies: ['Good to know', 'What about open source licenses?', 'I have a project to discuss'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Team ────────────────────────────────────────────────────────────
  team: {
    message: `Small and senior — based in Kampala, Uganda. Average age: 27.\n\n• **Obed Edom Mugisha** — Team Lead, Asst. Pastor, Lead Guitarist\n• **Edwin Nahabwe** — Full Stack Dev, Lead Guitarist, Youth Pastor\n• **Daniel Lunyelele** — Back-end & Systems Engineer, Artist\n• **Ian Abenaitwe** — AI & Agentic AI Engineer\n• **Opakrwoth Jonathan** — Motion Graphics, AI Content Creator\n\nWorshippers and musicians who happen to be engineers. Every sprint starts with prayer. No outsourcing — the people you talk to are the people who build it.`,
    quick_replies: ['What services do you offer?', 'See your work', 'Start a project'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Remote / Location ───────────────────────────────────────────────
  remote: {
    message: `We're based in Kampala, Uganda — and proudly so. Fiercely Pan-African, globally minded.\n\nWe work with clients worldwide. Async-first communication, with video check-ins at the right moments. Time zones haven't slowed us down yet.\n\nContact us on WhatsApp at +31 97 010 209 759 or book a call at calendly.com/builtbyoddshoes.`,
    quick_replies: ['Book a call', 'Start on the Project Planner', 'Tell me about your services'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Hosting & DevOps ────────────────────────────────────────────────
  hosting: {
    message: `We handle deployment as part of every project — it's not an afterthought.\n\nTypical setup:\n• **Frontend:** Vercel or Netlify (fast, global CDN)\n• **Backend:** Railway, Render, or AWS/GCP for heavier workloads\n• **Databases:** Supabase, PlanetScale, or managed Postgres on AWS RDS\n• **CI/CD:** GitHub Actions pipelines — automated tests, previews, and production deploys\n• **Monitoring:** Sentry for errors, Uptime Robot or Railway metrics\n\nWe can deploy to your existing cloud account or set up a new one — whatever gives you the most control.`,
    quick_replies: ['We have existing AWS infrastructure', 'Set it up fresh for us', 'What does DevOps cost?'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Security ────────────────────────────────────────────────────────
  security: {
    message: `We build security in from the start — not as a patch.\n\nStandard on every project:\n• Input validation and sanitisation\n• Parameterised queries (no SQL injection)\n• Secure auth (JWT, OAuth2, session management)\n• HTTPS everywhere, HSTS headers\n• Environment secrets managed properly (never in code)\n• GDPR-compatible data handling on request\n• Role-based access control where needed\n\nFor higher-risk applications (fintech, healthcare, etc.) we can scope additional security review, penetration testing, or compliance-specific architecture.\n\nWhat level of security does your project need?`,
    quick_replies: ['Standard is fine', 'We handle sensitive data', 'GDPR compliance needed', 'Finance / healthcare sector'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Integrations ────────────────────────────────────────────────────
  integrations: {
    message: `If it has an API, we can integrate it.\n\nThings we connect regularly:\n• **Payments:** Stripe, Paddle, PayPal\n• **Auth:** Auth0, Clerk, Google/GitHub OAuth\n• **Comms:** Sendgrid, Twilio, Mailchimp\n• **CRMs:** HubSpot, Salesforce, Airtable\n• **Productivity:** Slack, Notion, Google Workspace\n• **Data:** Zapier, Make (Integromat), custom webhooks\n• **Analytics:** Mixpanel, PostHog, Google Analytics\n• **AI APIs:** OpenAI, Anthropic, Replicate\n\nWhat do you need to connect?`,
    quick_replies: ['Stripe payments', 'CRM integration', 'AI API integration', 'Something custom'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Existing code ───────────────────────────────────────────────────
  existingCode: {
    message: `Taking over an existing codebase — yes, we do it. Carefully.\n\nWe start with a code audit: assess what's there, what's salvageable, what's a liability. We're honest about it — if something needs to be rewritten, we'll tell you and explain why.\n\nWe've inherited projects in all states — from well-structured React apps to spaghetti legacy systems. We know how to navigate both.\n\nWhat's the current state of the project, and what do you need done with it?`,
    quick_replies: ['Needs new features', 'Needs a full rewrite', 'Previous dev disappeared', 'Performance issues'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: MVP / Startup ───────────────────────────────────────────────────
  mvp: {
    message: `MVPs are our specialty — it's what Genesis Build was designed for.\n\n**5 days. One feature. Production-ready. Launched Friday.**\n\nThe key is ruthless scope discipline. Lock the scope on Day 1, ship by Friday. 100+ MVPs shipped. One client used their Genesis Build to secure a $250K seed round.\n\nAre you pre-revenue with one clear feature to test?`,
    quick_replies: ['Yes — tell me about Genesis Build', 'I have wireframes already', 'I need more than one feature'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'MVP / Startup' },
  },

  // ── FAQ: Database ────────────────────────────────────────────────────────
  database: {
    message: `Data architecture gets more attention than it usually does at most shops.\n\nWe design schemas properly from the start — normalised, indexed, scalable. We use PostgreSQL for most relational needs, MongoDB for document-heavy workloads, Redis for caching and queues.\n\nWe also handle migrations cleanly (Alembic, Prisma, or raw SQL depending on the stack) and optimise for performance before it becomes a problem.\n\nDo you have an existing database to work with, or are we greenfield?`,
    quick_replies: ['Greenfield — new database', 'Existing DB to migrate', 'Performance issues with current DB', 'Need data modelling help'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Testing ─────────────────────────────────────────────────────────
  testing: {
    message: `Testing isn't optional — it's part of the spec.\n\nWhat we ship with:\n• **Unit tests** for core business logic\n• **Integration tests** for APIs and data flows\n• **End-to-end tests** (Playwright or Cypress) for critical user journeys\n• **Manual QA** before every release\n• **Staging environment** that mirrors production\n\nWe also set up error monitoring (Sentry) so bugs that slip through get caught in production before your users report them.\n\nDo you have specific testing requirements or a QA process we'd need to work within?`,
    quick_replies: ['Standard testing is fine', 'We have strict QA requirements', 'What about test coverage?'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Small projects ──────────────────────────────────────────────────
  smallProject: {
    message: `Depends on what "small" means.\n\nWe take on focused, well-scoped projects — a polished landing page, a specific feature, a technical audit, a rapid prototype. We don't have a minimum budget, but we do have a minimum quality bar.\n\nIf a project is too small for us to do right, we'll tell you honestly instead of taking your money.\n\nWhat are you looking to get built?`,
    quick_replies: ['A landing page', 'A specific feature', 'A technical audit', 'Small MVP'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: How to get started ──────────────────────────────────────────────
  getStarted: {
    message: `Best first step: launch the Project Planner at oddshoes.dev/planner.\n\nIt takes 5–10 minutes to share your vision and budget. The team reviews it and comes back with a proposal — no obligation, no hard sell.\n\nAlternatively: book a call directly at calendly.com/builtbyoddshoes or email buildit@oddshoes.dev.\n\nReady?`,
    quick_replies: ['Launch Project Planner', 'Book a call', 'Drop my email here'],
    stage: 'email_capture',
    action: 'request_email',
  },

  // ── Genesis Build ──────────────────────────────────────────────
  genesisbuild: {
    message: `Genesis Build is the 5-day MVP for pre-revenue founders.\n\n**What you get:**\n• Single core feature, production-ready\n• User authentication + database\n• Clean React interface (mobile-responsive)\n• Deployed to production on Day 5\n• Simple landing page + team walkthrough\n• 30-day bug fixes included\n\n**Stack:** Django/Laravel/FastAPI + React + PostgreSQL/MySQL. Optional CMS (Directus or Strapi).\n\n**Day 1:** Vision Lock — 2hr strategy call, scope locked, no feature creep.\n**Days 2–4:** Build.\n**Day 5:** Launched.\n\n**For:** Pre-revenue Christian founders with one clear core feature, ready to start Monday and launch Friday.\n**Not for:** Multi-sided marketplaces, complex payment flows, or people still figuring out the idea.\n\nInterested? Start the Project Planner at oddshoes.dev/planner`,
    quick_replies: ['I\'m pre-revenue', 'Launch Project Planner', 'What about Kingdom Builder?', 'How much does it cost?'],
    stage: 'scoping',
    action: null,
    brief_update: { project_type: 'MVP / Startup' },
  },

  // ── Kingdom Builder ──────────────────────────────────────────
  kingdombuilder: {
    message: `Kingdom Builder is the complete dev team for founders ready to scale.\n\n**What you get:**\n• Complete product (3–5 features)\n• Full brand & identity system\n• 14-day intensive build sprint\n• Stripe/M-Pesa payment integration\n• OpenClaw AI deployment + 2–3 custom skills\n• Admin dashboard (Directus/Strapi)\n• 6 months fractional CTO support (2 calls/month, 48hr bug fixes, 10 design hours/month)\n\n**Stack:** Django/Laravel/FastAPI + React or React Native + PostgreSQL/MySQL.\n\n**Limited to 3 projects per month.**\n\n**For:** Post-revenue founders generating revenue or with committed customers, needing 3–5 features and ongoing support.\n**Not for:** Idea-stage founders (start with Genesis Build), teams with a full-time CTO.\n\nProject Planner: oddshoes.dev/planner`,
    quick_replies: ['I\'m post-revenue', 'Launch Project Planner', 'What about Genesis Build?', 'Tell me about AI automation'],
    stage: 'scoping',
    action: null,
  },

  // ── Give Him 50 / Faith ───────────────────────────────────────
  givehim50: {
    message: `Give Him 50 is our commitment to Kingdom generosity.\n\nWe give 50% of our profits to Kingdom work — missionaries, church plants, and ministry across East Africa. Not because we have to. Because we get to.\n\nIn 2024, Give Him 50 helped plant the first church through Odd Shoes profits. In 2025, it supported 5 missionaries and 3 church plants.\n\nWe build for Christian founders specifically because we believe business can be a vehicle for Kingdom impact — every product we ship carries that conviction.\n\nLearn more: oddshoes.dev/give-him-50`,
    quick_replies: ['Tell me about your services', 'I want to build with you', 'Who is the team?'],
    stage: 'discovery',
    action: null,
  },

  // ── Billy Pods ─────────────────────────────────────────────────
  billypods: {
    message: `Billy Pods are vetted intern teams you can deploy for your own projects.\n\nEach Pod is 1–3 vetted interns plus a coordinator — ready to help your team ship faster.\n\nRequest a Pod at: oddshoes.dev/services/billy-pods`,
    quick_replies: ['Request a Pod', 'Tell me about other services', 'I\'d rather you build it'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Timeline ────────────────────────────────────────────────────────
  timelineDetail: {
    message: `Honest answer: it depends on scope. But here are real benchmarks:\n\n• **Landing page / marketing site:** 1–3 weeks\n• **MVP / simple web app:** 6–10 weeks\n• **Full SaaS product:** 12–20 weeks\n• **AI integration into existing product:** 3–6 weeks\n• **E-commerce custom build:** 8–14 weeks\n• **Internal tool / dashboard:** 4–8 weeks\n\nThese assume clear scope going in. The discovery and scoping phase (1–2 weeks) happens before we start the clock on build.\n\nWhat's your project, and do you have a hard deadline?`,
    quick_replies: ['I have a hard deadline', 'Flexible timeline', 'I need it fast — what\'s possible?'],
    stage: 'scoping',
    action: null,
  },

  // ── FAQ: Payment structure ───────────────────────────────────────────────
  paymentStructure: {
    message: `We do fixed-price projects, not hourly retainers.\n\nTypical payment structure:\n• **40%** upon project kickoff\n• **40%** at mid-project milestone\n• **20%** on final delivery\n\nNo surprise invoices. No scope creep charges without a conversation first. If something changes mid-project, we scope and price the change before touching it.\n\nWe accept bank transfer and major cards. Payment terms in the contract.`,
    quick_replies: ['That works for us', 'Can we do milestone-based?', 'Tell me about pricing overall'],
    stage: 'discovery',
    action: null,
  },
}

// ─── Main response engine ────────────────────────────────────────────────────

export function getBotResponse(userText, currentStage, currentBrief, messageCount) {
  const t = userText.toLowerCase().trim()

  // Extract brief updates from the user's message
  const briefUpdate = extractBriefUpdates(userText)

  let response

  // ── Hard redirects ────────────────────────────────────────────────────────
  if (isOffTopic(t)) {
    response = RESPONSES.offTopic
  }

  // ── Greetings ─────────────────────────────────────────────────────────────
  else if (isHello(t) && messageCount < 4) {
    response = RESPONSES.greeting
  }

  // ── Thanks ────────────────────────────────────────────────────────────────
  else if (isThankYou(t) && !isService(t)) {
    response = RESPONSES.thanks
  }

  // ── About ─────────────────────────────────────────────────────────────────
  else if (isAbout(t)) {
    response = RESPONSES.about
  }

  // ── Give Him 50 / Faith ───────────────────────────────────────────────────
  else if (isGiveHim50(t)) {
    response = RESPONSES.givehim50
  }

  // ── Genesis Build ─────────────────────────────────────────────────────────
  else if (isGenesis(t)) {
    response = RESPONSES.genesisbuild
  }

  // ── Kingdom Builder ───────────────────────────────────────────────────────
  else if (isKingdom(t)) {
    response = RESPONSES.kingdombuilder
  }

  // ── Billy Pods ────────────────────────────────────────────────────────────
  else if (isBillyPods(t)) {
    response = RESPONSES.billypods
  }

  // ── Project Planner ───────────────────────────────────────────────────────
  else if (isPlanner(t)) {
    response = RESPONSES.getStarted
  }

  // ── How to get started ────────────────────────────────────────────────────
  else if (isGetStarted(t)) {
    response = RESPONSES.getStarted
  }

  // ── Pricing ───────────────────────────────────────────────────────────────
  else if (isPrice(t) && kw(t, 'payment', 'invoice', 'structure', 'instalm', 'deposit', 'upfront')) {
    response = RESPONSES.paymentStructure
  }
  else if (isPrice(t)) {
    response = RESPONSES.price
  }

  // ── Timeline (standalone) ─────────────────────────────────────────────────
  else if (isTimeline(t) && !isProcess(t)) {
    response = RESPONSES.timelineDetail
  }

  // ── Process / workflow ────────────────────────────────────────────────────
  else if (isProcess(t)) {
    response = RESPONSES.process
  }

  // ── Tech stack ────────────────────────────────────────────────────────────
  else if (isStack(t)) {
    response = RESPONSES.stack
  }

  // ── Design ────────────────────────────────────────────────────────────────
  else if (isDesign(t)) {
    response = RESPONSES.design
  }

  // ── Mobile ────────────────────────────────────────────────────────────────
  else if (isMobile(t)) {
    response = RESPONSES.mobile
  }

  // ── Security ─────────────────────────────────────────────────────────────
  else if (isSecurity(t)) {
    response = RESPONSES.security
  }

  // ── Integrations ─────────────────────────────────────────────────────────
  else if (isIntegration(t)) {
    response = RESPONSES.integrations
  }

  // ── Hosting / DevOps ──────────────────────────────────────────────────────
  else if (isHosting(t)) {
    response = RESPONSES.hosting
  }

  // ── Database ─────────────────────────────────────────────────────────────
  else if (isDatabase(t)) {
    response = RESPONSES.database
  }

  // ── Testing / QA ─────────────────────────────────────────────────────────
  else if (isTesting(t)) {
    response = RESPONSES.testing
  }

  // ── Support / Maintenance ─────────────────────────────────────────────────
  else if (isSupport(t)) {
    response = RESPONSES.support
  }

  // ── Revisions / Feedback ──────────────────────────────────────────────────
  else if (isRevisions(t)) {
    response = RESPONSES.revisions
  }

  // ── NDA / IP / Ownership ──────────────────────────────────────────────────
  else if (isNDA(t)) {
    response = RESPONSES.nda
  }

  // ── Team ─────────────────────────────────────────────────────────────────
  else if (isTeam(t)) {
    response = RESPONSES.team
  }

  // ── Remote / Location ────────────────────────────────────────────────────
  else if (isRemote(t)) {
    response = RESPONSES.remote
  }

  // ── Existing codebase ────────────────────────────────────────────────────
  else if (isExistingCode(t)) {
    response = RESPONSES.existingCode
  }

  // ── MVP / Startup ─────────────────────────────────────────────────────────
  else if (isStartup(t)) {
    response = RESPONSES.mvp
  }

  // ── Small projects ────────────────────────────────────────────────────────
  else if (isSmallProject(t)) {
    response = RESPONSES.smallProject
  }

  // ── Portfolio / work ─────────────────────────────────────────────────────
  else if (isWork(t)) {
    response = RESPONSES.work
  }

  // ── AI specifically ───────────────────────────────────────────────────────
  else if (isAI(t) && isService(t)) {
    response = RESPONSES.service_ai
  }
  else if (isAI(t)) {
    response = RESPONSES.service_ai
  }

  // ── SaaS ─────────────────────────────────────────────────────────────────
  else if (kw(t, 'saas', 'software as a service', 'subscription')) {
    response = RESPONSES.service_saas
  }

  // ── E-commerce ────────────────────────────────────────────────────────────
  else if (kw(t, 'ecomm', 'e-comm', 'store', 'shopify', 'shop', 'checkout', 'cart', 'product listing')) {
    response = RESPONSES.service_ecomm
  }

  // ── Web app / website ─────────────────────────────────────────────────────
  else if (kw(t, 'web app', 'webapp', 'website', 'web application')) {
    response = RESPONSES.service_web
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  else if (isContact(t)) {
    response = RESPONSES.contact
  }

  // ── Discovery call ────────────────────────────────────────────────────────
  else if (kw(t, 'discovery call', 'what happens', "what's in the call", 'what is a discovery')) {
    response = RESPONSES.discovery_call_info
  }

  // ── Stage-based progression ───────────────────────────────────────────────
  else if (currentStage === 'scoping') {
    if (currentBrief.project_type && !currentBrief.timeline && briefUpdate.timeline) {
      response = RESPONSES.timeline_got
    } else if (currentBrief.project_type && currentBrief.timeline && !currentBrief.budget_range) {
      if (briefUpdate.budget_range) {
        response = RESPONSES.budget_got
      } else {
        response = RESPONSES.timeline_got
      }
    } else if (currentBrief.project_type && currentBrief.timeline && currentBrief.budget_range) {
      // All core fields filled — ask for name if missing, then push to email
      const mergedBrief = { ...currentBrief, ...briefUpdate }
      if (!mergedBrief.name) {
        response = RESPONSES.nameAsk
      } else {
        response = RESPONSES.push_to_email
      }
    } else {
      response = RESPONSES.generic_scoping
    }
  }

  else if (currentStage === 'discovery' && isService(t)) {
    response = RESPONSES.generic_discovery
  }

  // ── Generic fallback by stage ─────────────────────────────────────────────
  else {
    const stageDefaults = {
      greeting:      RESPONSES.greeting,
      discovery:     RESPONSES.generic_discovery,
      scoping:       RESPONSES.scoping_followup,
      email_capture: RESPONSES.push_to_email,
      cta:           RESPONSES.cta_end,
      complete:      RESPONSES.cta_end,
    }
    response = stageDefaults[currentStage] || RESPONSES.generic_discovery
  }

  // ── Auto-capture description from substantial scoping messages ──────────
  if (
    (currentStage === 'scoping' || currentStage === 'discovery') &&
    userText.trim().length > 50 &&
    !currentBrief.description &&
    !briefUpdate.description
  ) {
    const raw = userText.trim()
    briefUpdate.description = raw.length > 90 ? raw.slice(0, 90) + '\u2026' : raw
  }

  return {
    ...response,
    brief_update: { ...briefUpdate, ...(response.brief_update || {}) },
  }
}

export function getGreeting() {
  return RESPONSES.greeting
}
