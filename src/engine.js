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

// ─── Response bank ───────────────────────────────────────────────────────────

const RESPONSES = {
  greeting: {
    message: `Custom software. Built weird — in the best way.\n\nI'm OddBot, your direct line to the Odd Shoes team. We build bespoke digital products for clients — web apps, SaaS platforms, AI-powered tools, internal dashboards, e-commerce systems. Whatever the problem is, we build the exact right solution for it.\n\nWhat are you trying to build?`,
    quick_replies: ['I have a project idea', 'What do you build?', 'How does pricing work?', 'What\'s your tech stack?'],
    stage: 'discovery',
    action: null,
  },

  offTopic: {
    message: `That's outside our lane — but I'm not going anywhere.\n\nIf there's something you want to build, something you're trying to solve, or a project that's been sitting in your head too long — I'm all ears.`,
    quick_replies: ['I have a project idea', 'What does Odd Shoes build?', 'How does pricing work?'],
    stage: 'discovery',
    action: null,
  },

  about: {
    message: `Odd Shoes is a custom software development studio. We build things from scratch — the right way, for the specific problem.\n\nSmall senior team. Direct communication. No templates, no cookie-cutter anything. Every project is designed and built start to finish for the client it's for.\n\nServices span the full stack: web apps, SaaS products, AI integrations, e-commerce, internal tools, APIs — and the design that wraps it all together.\n\nWhat's the problem you're trying to solve?`,
    quick_replies: ['I need a web app built', 'I want AI features added', 'What does a project cost?', 'How does the process work?'],
    stage: 'discovery',
    action: null,
  },

  price: {
    message: `We don't do hourly rates or pre-packaged tiers. Every project is scoped custom — because every problem is different.\n\nProjected ranges depend entirely on complexity and scope. Simple web apps start around $10–15k. SaaS platforms and AI integrations typically run $25–75k+. We'll give you an honest number after a 20-minute discovery call.\n\nWant to lock in a time?`,
    quick_replies: ['Yes, let\'s talk', 'Tell me more first', 'What\'s included?'],
    stage: 'email_capture',
    action: 'request_email',
  },

  process: {
    message: `Clean and direct:\n\n1. Discovery call — understand the problem deeply\n2. Proposal & scope — what we're building and how much\n3. Design sprint — wireframes, flows, visual direction\n4. Build sprints — iterative development with regular check-ins\n5. Testing & QA — we break it before you do\n6. Launch — with full handoff and documentation\n7. Support — we don't disappear after shipping\n\nTypical timeline: 4–16 weeks depending on scope. We move fast, but we don't rush quality.\n\nWhat are you looking to build?`,
    quick_replies: ['I need something built fast', 'What\'s the average timeline?', 'Can we start soon?'],
    stage: 'scoping',
    action: null,
  },

  work: {
    message: `Head to oddshoes.dev — the work speaks louder than I can.\n\nWe've shipped: SaaS platforms, AI-powered tools, custom e-commerce systems, internal dashboards, complex APIs, and a few things still under NDA.\n\nEach project gets built from scratch — no templates, no shortcuts. What's the project you have in mind?`,
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
    message: `Reach the team directly at hello@oddshoes.dev — or drop your email here and we'll come to you.\n\nEither way, someone responds within 24 hours. No bots on the other end.`,
    quick_replies: ['Drop my email here', 'I\'ll email directly'],
    stage: 'email_capture',
    action: 'request_email',
  },

  scoping_followup: {
    message: `Good — starting to take shape. A couple more things help me build a complete brief: what's the rough timeline you're working toward, and is there a budget range in mind?`,
    quick_replies: ['Need it in 3 months', 'Flexible on timing', 'Under $20k', 'Not sure on budget yet'],
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
    message: `You're in. Someone from Odd Shoes will be in touch within 24 hours to set up a discovery call.\n\nIn the meantime — see the kind of work we ship at oddshoes.dev.`,
    quick_replies: ['Visit oddshoes.dev', 'What happens in the discovery call?'],
    stage: 'complete',
    action: 'brief_complete',
  },

  discovery_call_info: {
    message: `Short and focused — 20 to 30 minutes. We'll dig into the problem, what you've tried or considered, who it's for, and what success looks like. By the end we'll have a clear picture to scope from.\n\nNo hard sell, no homework. Just a real conversation.\n\nWant to set one up?`,
    quick_replies: ['Yes, let\'s book it', 'Drop my email first'],
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
    message: `Small and senior — intentionally.\n\nYou get a tight team of experienced engineers and designers. No junior developers learning on your project. No bloated teams burning your budget on coordination.\n\nEvery project has a dedicated lead who's your main point of contact — someone who knows the codebase inside out from day one.\n\nNo offshore handoffs. No outsourcing. The people you talk to are the people who build it.`,
    quick_replies: ['How many people on a project?', 'Do you have dedicated project managers?', 'Start a project'],
    stage: 'discovery',
    action: null,
  },

  // ── FAQ: Remote / Location ───────────────────────────────────────────────
  remote: {
    message: `Fully remote — and it's never slowed us down.\n\nWe work with clients globally. Async-first communication, with video check-ins at the right moments. We're flexible on time zones.\n\nIf you're in a region that needs in-person work, let's talk about it — we'll figure out what makes sense.`,
    quick_replies: ['I\'m in the US', 'I\'m in Europe', 'I\'m elsewhere', 'Let\'s talk project details'],
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
    message: `MVPs are a specialty. We've helped a lot of founders go from idea to launched — fast.\n\nThe key is ruthless scope discipline. An MVP should answer one question: does this solve the problem for real users? We help you define that minimum, build it tight, and ship it before you've over-engineered something nobody's validated yet.\n\nTypical MVP timeline: 6–12 weeks. Typical budget: $15–40k depending on complexity.\n\nHow developed is the idea right now?`,
    quick_replies: ['Just an idea', 'I have wireframes/specs', 'I have a technical co-founder', 'I\'ve already built a bit'],
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
    message: `Simplest path: drop your email and we'll reach out to set up a discovery call.\n\nThat call is free, no commitment, and usually 20–30 minutes. We'll figure out together whether we're the right fit — and if we are, you'll get a full proposal and scope within a week.\n\nReady?`,
    quick_replies: ['Yes — take my email', 'Tell me more about the call first'],
    stage: 'email_capture',
    action: 'request_email',
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
      response = RESPONSES.push_to_email
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

  return {
    ...response,
    brief_update: { ...briefUpdate, ...(response.brief_update || {}) },
  }
}

export function getGreeting() {
  return RESPONSES.greeting
}
