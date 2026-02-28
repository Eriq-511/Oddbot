/**
 * api/submit-lead.js — Vercel serverless function
 * Saves an OddBot lead (email + brief) to Supabase.
 * Uses the service role key server-side — never exposed to the browser.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase env vars missing')
    return res.status(503).json({ error: 'Database not configured' })
  }

  const { email, brief = {} } = req.body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const row = {
    email: email.toLowerCase().trim(),
    name: brief.name || null,
    project_type: brief.project_type || null,
    description: brief.description || null,
    timeline: brief.timeline || null,
    budget_range: brief.budget_range || null,
    raw_brief: brief,
    source: 'oddbot',
  }

  try {
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    })

    if (!sbRes.ok) {
      const errText = await sbRes.text()
      console.error('Supabase insert error:', sbRes.status, errText)
      return res.status(502).json({ error: 'Failed to save lead', detail: sbRes.status })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('submit-lead error:', err)
    return res.status(500).json({ error: 'Internal error', message: err.message })
  }
}
