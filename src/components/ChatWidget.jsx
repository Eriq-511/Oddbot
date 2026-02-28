/**
 * ChatWidget — Main OddBot widget component
 * 
 * Embeddable, standalone-capable chat widget for Odd Shoes.
 * Features: conversation engine, brief builder card, email capture,
 * smooth animations, full brand voice.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ExternalLink, RotateCcw } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import QuickReplies from './QuickReplies'
import EmailCapture from './EmailCapture'
import BriefCard from './BriefCard'

// Widget launcher button
function LaunchButton({ onClick, hasUnread }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 16, stiffness: 260 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="launch-pulse relative w-14 h-14 rounded-2xl shadow-widget flex items-center justify-center cursor-pointer focus:outline-none"
      style={{
        background: 'linear-gradient(135deg, #C8FF57 0%, #9ED43A 100%)',
      }}
      aria-label="Open OddBot"
    >
      {/* Odd Shoes wordmark "O" */}
      <span className="text-os-black font-black text-xl tracking-tighter select-none">O</span>
      {/* Unread dot */}
      {hasUnread && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-os-pink border-2 border-os-black"
        />
      )}
    </motion.button>
  )
}

// CTA bar that appears when action === 'show_cta'
function CTABar({ onVisitWork }) {
  return (
    <motion.a
      href="https://oddshoes.dev"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-2.5 mx-4 mb-3 rounded-xl cursor-pointer group"
      style={{
        background: 'linear-gradient(135deg, rgba(200,255,87,0.12) 0%, rgba(200,255,87,0.05) 100%)',
        border: '1px solid rgba(200, 255, 87, 0.25)',
      }}
    >
      <span className="text-os-lime text-xs font-semibold">View our work → oddshoes.dev</span>
      <ExternalLink size={12} className="text-os-lime opacity-60 group-hover:opacity-100 transition-opacity" />
    </motion.a>
  )
}

export default function ChatWidget({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(embedded)
  const [hasOpened, setHasOpened] = useState(embedded)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [inputValue, setInputValue] = useState('')

  const {
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
  } = useChat()


  // Init chat on first open
  useEffect(() => {
    if (embedded) {
      initChat()
      return
    }
    if (isOpen && !hasOpened) {
      setHasOpened(true)
      initChat()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isTyping, currentAction])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    if (!hasOpened) {
      setHasOpened(true)
      initChat()
    }
  }

  const handleClose = () => setIsOpen(false)

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text || isTyping) return
    setInputValue('')
    sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickReply = (reply) => {
    if (isTyping) return
    sendMessage(reply)
  }

  const handleReset = () => {
    reset()
    setTimeout(() => initChat(), 100)
  }

  const showBriefCard = Object.values(briefState).some(v => v)
  const showEmailCapture = currentAction === 'request_email' && !emailSubmitted
  const showCTABar = currentAction === 'show_cta' || currentAction === 'brief_complete'
  const isComplete = stage === STAGES.COMPLETE || emailSubmitted

  const widgetContent = (
    <div
      className="flex flex-col bg-os-dark border border-os-border rounded-2xl overflow-hidden chat-widget"
      style={{
        width: embedded ? '100%' : 380,
        height: embedded ? '100%' : 600,
        maxHeight: embedded ? '100%' : '85vh',
        boxShadow: embedded ? 'none' : '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b border-os-border flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(200,255,87,0.06) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C8FF57 0%, #9ED43A 100%)' }}
          >
            <span className="text-os-black font-black text-sm">O</span>
          </div>
          <div>
            <p className="text-os-white font-bold text-sm tracking-tight">OddBot</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-os-lime animate-pulse-slow" />
              <span className="text-os-gray text-[10px] font-medium">Odd Shoes Rep</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-os-gray hover:text-os-white transition-colors"
            title="Start over"
          >
            <RotateCcw size={13} />
          </motion.button>
          {!embedded && (
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-os-gray hover:text-os-white transition-colors"
            >
              <ChevronDown size={15} />
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Body: Messages + Brief Card ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Messages pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-0 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && <TypingIndicator key="typing" />}
            </AnimatePresence>

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Quick replies */}
          <AnimatePresence>
            {quickReplies.length > 0 && !isTyping && !showEmailCapture && (
              <div className="px-4">
                <QuickReplies
                  replies={quickReplies}
                  onSelect={handleQuickReply}
                  disabled={isTyping}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Email capture */}
          <AnimatePresence>
            {showEmailCapture && (
              <div className="px-4">
                <EmailCapture onSubmit={submitEmail} isLoading={isTyping} />
              </div>
            )}
          </AnimatePresence>

          {/* CTA bar */}
          <AnimatePresence>
            {showCTABar && <CTABar />}
          </AnimatePresence>

          {/* ── Input ── */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-os-border">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping || stage === STAGES.COMPLETE}
                placeholder={
                  stage === STAGES.COMPLETE
                    ? 'Brief submitted ✓'
                    : 'Say something...'
                }
                className="
                  flex-1 bg-transparent text-os-white placeholder-os-gray
                  text-sm border-none outline-none font-normal
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              <motion.button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping || stage === STAGES.COMPLETE}
                whileHover={inputValue.trim() ? { scale: 1.08 } : {}}
                whileTap={inputValue.trim() ? { scale: 0.92 } : {}}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: inputValue.trim()
                    ? 'linear-gradient(135deg, #C8FF57 0%, #A8E040 100%)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 6h10M6 1l5 5-5 5"
                    stroke={inputValue.trim() ? '#0A0A0A' : '#888'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Brand footer */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-os-gray/50 font-medium tracking-wide">
                oddshoes.dev
              </span>
              <span className="text-[10px] text-os-gray/30">
                Press ↵ to send
              </span>
            </div>
          </div>
        </div>

        {/* Brief Card sidebar — appears when brief data exists */}
        <AnimatePresence>
          {showBriefCard && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 160, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
              className="border-l border-os-border overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              <div className="p-3 h-full overflow-y-auto">
                <BriefCard
                  briefState={briefState}
                  isComplete={isComplete}
                  isVisible={showBriefCard}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  if (embedded) {
    return widgetContent
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            {widgetContent}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isOpen && (
          <LaunchButton
            key="launch"
            onClick={handleOpen}
            hasUnread={!hasOpened}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
