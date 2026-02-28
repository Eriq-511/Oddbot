/**
 * ChatMessage — renders individual chat messages with brand-appropriate styling
 * Bot messages: dark surface, left-aligned with avatar
 * User messages: lime-tinted, right-aligned
 */
import { motion } from 'framer-motion'

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
}

function OddBotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-os-lime flex items-center justify-center flex-shrink-0 mb-1 shadow-os-glow">
      <span className="text-os-black font-black text-xs tracking-tight">O</span>
    </div>
  )
}

export default function ChatMessage({ message }) {
  const isBot = message.role === 'assistant'

  if (isBot) {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className="flex items-end gap-2 mb-4"
      >
        <OddBotAvatar />
        <div className="max-w-[82%]">
          <div className="bg-os-surface border border-os-border rounded-2xl rounded-bl-sm px-4 py-3">
            <p className="message-text text-os-white text-sm leading-relaxed font-normal">
              {message.content}
            </p>
          </div>
          <span className="text-os-gray text-[10px] mt-1 ml-1 block">
            OddBot
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex justify-end mb-4"
    >
      <div className="max-w-[78%]">
        <div
          className="rounded-2xl rounded-br-sm px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, rgba(200,255,87,0.15) 0%, rgba(200,255,87,0.08) 100%)',
            border: '1px solid rgba(200, 255, 87, 0.2)',
          }}
        >
          <p className="message-text text-os-white text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
