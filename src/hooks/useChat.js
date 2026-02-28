/**
 * useChat — fully client-side state management hook for OddBot
 * No backend required. All conversation logic runs in the browser.
 */
import { useState, useCallback, useRef } from 'react'
import { getBotResponse, getGreeting, extractBriefUpdates } from '../engine'

const STAGES = {
  IDLE: 'idle',
  GREETING: 'greeting',
  DISCOVERY: 'discovery',
  SCOPING: 'scoping',
  EMAIL_CAPTURE: 'email_capture',
  CTA: 'cta',
  COMPLETE: 'complete',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Realistic typing delay based on message length
function typingDelay(text) {
  const base = 600
  const perChar = 18
  const jitter = Math.random() * 300
  return Math.min(base + text.length * perChar + jitter, 2800)
}

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [quickReplies, setQuickReplies] = useState([])
  const [stage, setStage] = useState(STAGES.IDLE)
  const [briefState, setBriefState] = useState({})
  const [currentAction, setCurrentAction] = useState(null)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const messageCountRef = useRef(0)
  const initCalledRef = useRef(false)
  const stageRef = useRef(STAGES.IDLE)
  const briefRef = useRef({})
  const messagesRef = useRef([])  // kept in sync for API calls

  // Keep refs in sync so callbacks always see latest values
  const updateStage = (s) => { stageRef.current = s; setStage(s) }
  const updateBrief = (updates) => {
    briefRef.current = { ...briefRef.current, ...updates }
    setBriefState({ ...briefRef.current })
  }

  const appendMessage = useCallback((role, content) => {
    messageCountRef.current += 1
    const msg = { id: makeId(), role, content, timestamp: Date.now() }
    messagesRef.current = [...messagesRef.current, msg]
    setMessages(prev => [...prev, msg])
  }, [])

  const applyResponse = useCallback((resp) => {
    // Update brief
    if (resp.brief_update && Object.keys(resp.brief_update).length > 0) {
      const filtered = Object.fromEntries(
        Object.entries(resp.brief_update).filter(([, v]) => v != null)
      )
      if (Object.keys(filtered).length > 0) updateBrief(filtered)
    }

    // Update stage
    if (resp.stage) updateStage(resp.stage)

    // Set action
    setCurrentAction(resp.action || null)

    // Append bot message
    appendMessage('assistant', resp.message)

    // Stagger quick replies after message lands
    setQuickReplies([])
    if (resp.quick_replies?.length) {
      setTimeout(() => setQuickReplies(resp.quick_replies), 120)
    }
  }, [appendMessage])

  const initChat = useCallback(async () => {
    if (initCalledRef.current) return
    initCalledRef.current = true

    updateStage(STAGES.GREETING)
    setIsTyping(true)

    const greeting = getGreeting()
    await new Promise(r => setTimeout(r, typingDelay(greeting.message)))

    applyResponse(greeting)
    setIsTyping(false)
  }, [applyResponse])

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isTyping) return

    setCurrentAction(null)
    setQuickReplies([])
    appendMessage('user', text.trim())
    setIsTyping(true)

    let resp
    try {
      const apiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesRef.current.map(m => ({ role: m.role, content: m.content })),
          brief: briefRef.current,
          stage: stageRef.current,
        }),
      })

      if (!apiRes.ok) throw new Error(`API ${apiRes.status}`)
      resp = await apiRes.json()

      // Merge any local regex-extracted brief fields (belt-and-suspenders)
      const localUpdates = extractBriefUpdates(text.trim())
      resp.brief_update = { ...localUpdates, ...(resp.brief_update || {}) }
    } catch (err) {
      console.warn('OddBot AI unavailable, using local engine:', err.message)
      resp = getBotResponse(
        text.trim(),
        stageRef.current,
        briefRef.current,
        messageCountRef.current,
      )
    }

    // Ensure a minimum "thinking" delay so the typing indicator feels natural
    await new Promise(r => setTimeout(r, resp._skipDelay ? 0 : Math.max(600, Math.min(resp.message.length * 12, 2400))))

    applyResponse(resp)
    setIsTyping(false)
  }, [isTyping, appendMessage, applyResponse])

  const submitEmail = useCallback(async (email) => {
    if (!EMAIL_REGEX.test(email) || isTyping) return

    setCurrentAction(null)
    setQuickReplies([])
    appendMessage('user', email)
    setIsTyping(true)

    // Save lead to Supabase via serverless function (primary)
    try {
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          brief: { ...briefRef.current },
        }),
      })
    } catch (_) {
      // API unavailable — fall through to localStorage backup
    }

    // localStorage backup — always runs so leads are never lost
    try {
      const existing = JSON.parse(localStorage.getItem('oddbot_leads') || '[]')
      const entry = {
        email: email.toLowerCase(),
        brief: { ...briefRef.current },
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem('oddbot_leads', JSON.stringify([...existing, entry]))
    } catch (_) {
      // localStorage unavailable — continue silently
    }

    updateBrief({ email: email.toLowerCase() })
    setEmailSubmitted(true)

    await new Promise(r => setTimeout(r, 900))

    appendMessage(
      'assistant',
      `You're in. Someone from the Odd Shoes team will reach out within 24 hours.\n\nIn the meantime — explore the portfolio at oddshoes.dev/work or book a call directly at calendly.com/builtbyoddshoes. Built with prayer from Kampala. 👏`
    )

    updateStage(STAGES.COMPLETE)
    setCurrentAction('brief_complete')
    setTimeout(() => setQuickReplies(['Visit oddshoes.dev', 'What happens in the discovery call?']), 120)
    setIsTyping(false)
  }, [isTyping, appendMessage])

  const reset = useCallback(() => {
    initCalledRef.current = false
    messageCountRef.current = 0
    stageRef.current = STAGES.IDLE
    briefRef.current = {}
    messagesRef.current = []
    setMessages([])
    setIsTyping(false)
    setQuickReplies([])
    setStage(STAGES.IDLE)
    setBriefState({})
    setCurrentAction(null)
    setEmailSubmitted(false)
  }, [])

  return {
    messages,
    isTyping,
    quickReplies,
    stage,
    briefState,
    currentAction,
    emailSubmitted,
    initChat,
    sendMessage,
    submitEmail,
    reset,
    STAGES,
  }
}
