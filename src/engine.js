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

const isPrice = (t) => kw(t, 'price', 'cost', 'budget', 'pricing', 'how much', 'rate', 'fee', 'charge', 'afford', 'expensive')
const isProcess = (t) => kw(t, 'process', 'how do you', 'workflow', 'timeline', 'how long', 'steps', 'phases', 'approach')
const isService = (t) => kw(t, 'build', 'make', 'create', 'develop', 'need', 'want', 'looking for', 'app', 'website', 'saas', 'platform', 'tool', 'system', 'software', 'product')
const isWork = (t) => kw(t, 'work', 'portfolio', 'example', 'past', 'clients', 'case study', 'seen', 'built', 'showcase', 'project')
const isAbout = (t) => kw(t, 'who are you', 'what do you do', 'about odd', 'what is odd', 'tell me about', 'what you do')
const isAI = (t) => kw(t, 'ai', 'machine learning', 'llm', 'gpt', 'openai', 'ml ', 'artificial intelligence', 'chatbot', 'automation')
const isContact = (t) => kw(t, 'contact', 'email', 'reach', 'talk to', 'speak to', 'hello@', 'book', 'call', 'meet', 'schedule')
const isHello = (t) => kw(t, 'hello', 'hi ', 'hey', 'sup', 'yo ', 'what\'s up', 'hiya', 'greetings')
const isThankYou = (t) => kw(t, 'thank', 'thanks', 'appreciate', 'great', 'awesome', 'perfect', 'love it', 'cool')

// ─── Response bank ───────────────────────────────────────────────────────────

const RESPONSES = {
  greeting: {
    message: `Custom software. Built weird — in the best way.\n\nI'm OddBot, your direct line to the Odd Shoes team. We build bespoke digital products for clients — web apps, SaaS platforms, AI-powered tools, internal dashboards, e-commerce systems. Whatever the problem is, we build the exact right solution for it.\n\nWhat are you trying to build?`,
    quick_replies: ['I have a project idea', 'What do you build?', 'Show me your work', 'How does pricing work?'],
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
}

// ─── Main response engine ────────────────────────────────────────────────────

export function getBotResponse(userText, currentStage, currentBrief, messageCount) {
  const t = userText.toLowerCase().trim()

  // Extract brief updates from the user's message
  const briefUpdate = extractBriefUpdates(userText)

  let response

  // Off-topic hard redirect
  if (isOffTopic(t)) {
    response = RESPONSES.offTopic
  }

  // Greetings early in conversation
  else if (isHello(t) && messageCount < 4) {
    response = RESPONSES.greeting
  }

  // Thanks / positive affirmation
  else if (isThankYou(t) && !isService(t)) {
    response = RESPONSES.thanks
  }

  // About Odd Shoes
  else if (isAbout(t)) {
    response = RESPONSES.about
  }

  // Pricing
  else if (isPrice(t)) {
    response = RESPONSES.price
  }

  // Process / workflow
  else if (isProcess(t)) {
    response = RESPONSES.process
  }

  // Work / portfolio
  else if (isWork(t)) {
    response = RESPONSES.work
  }

  // AI specifically
  else if (isAI(t) && isService(t)) {
    response = RESPONSES.service_ai
  }

  // SaaS
  else if (kw(t, 'saas', 'software as a service', 'subscription', 'platform')) {
    response = RESPONSES.service_saas
  }

  // E-commerce
  else if (kw(t, 'ecomm', 'e-comm', 'store', 'shopify', 'shop', 'checkout', 'cart', 'product listing')) {
    response = RESPONSES.service_ecomm
  }

  // Web app / website
  else if (kw(t, 'web app', 'webapp', 'website', 'web application')) {
    response = RESPONSES.service_web
  }

  // Contact
  else if (isContact(t)) {
    response = RESPONSES.contact
  }

  // Discovery call info
  else if (kw(t, 'discovery call', 'what happens', 'what\'s in the call', 'what is a discovery')) {
    response = RESPONSES.discovery_call_info
  }

  // Stage-based progression
  else if (currentStage === 'scoping') {
    // If we have project type but not timeline, ask about timeline
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

  // Generic fallback by stage
  else {
    const stageDefaults = {
      greeting: RESPONSES.greeting,
      discovery: RESPONSES.generic_discovery,
      scoping: RESPONSES.scoping_followup,
      email_capture: RESPONSES.push_to_email,
      cta: RESPONSES.cta_end,
      complete: RESPONSES.cta_end,
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
