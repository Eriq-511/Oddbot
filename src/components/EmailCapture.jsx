/**
 * EmailCapture — inline email form that slides into the chat
 * Feels like part of the conversation, not a popup
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailCapture({ onSubmit, isLoading }) {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  const isValid = EMAIL_REGEX.test(email)
  const showError = touched && email.length > 0 && !isValid

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid || isLoading) return
    onSubmit(email.trim().toLowerCase())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      className="mb-4 pl-9"
    >
      <form onSubmit={handleSubmit} className="group">
        <div
          className="rounded-2xl border overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(200, 255, 87, 0.04)',
            borderColor: showError
              ? 'rgba(255, 45, 120, 0.5)'
              : 'rgba(200, 255, 87, 0.2)',
            boxShadow: '0 0 20px rgba(200, 255, 87, 0.05)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <Mail size={13} className="text-os-lime flex-shrink-0" />
            <span className="text-os-gray text-xs font-medium tracking-wide uppercase">
              Lock in the brief
            </span>
          </div>

          {/* Input + Submit */}
          <div className="flex items-center px-4 pb-3 gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setTouched(false)
              }}
              onBlur={() => setTouched(true)}
              placeholder="you@company.com"
              disabled={isLoading}
              autoFocus
              className="
                flex-1 bg-transparent text-os-white placeholder-os-gray
                border-none outline-none text-sm font-normal
                disabled:opacity-50
              "
            />
            <motion.button
              type="submit"
              disabled={!isValid || isLoading}
              whileHover={isValid && !isLoading ? { scale: 1.05 } : {}}
              whileTap={isValid && !isLoading ? { scale: 0.95 } : {}}
              className="
                flex items-center justify-center
                w-8 h-8 rounded-xl flex-shrink-0
                transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                focus:outline-none
              "
              style={{
                background: isValid && !isLoading
                  ? 'linear-gradient(135deg, #C8FF57 0%, #A8E040 100%)'
                  : 'rgba(200, 255, 87, 0.1)',
              }}
            >
              {isLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-os-black/30 border-t-os-black rounded-full animate-spin" />
              ) : (
                <ArrowRight size={14} className={isValid ? 'text-os-black' : 'text-os-gray'} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Error state */}
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-os-pink text-[11px] mt-1.5 ml-1"
          >
            That doesn't look like a valid email.
          </motion.p>
        )}

        <p className="text-os-gray text-[10px] mt-1.5 ml-1">
          No newsletters. No spam. Just a response from the team.
        </p>
      </form>
    </motion.div>
  )
}
