/**
 * QuickReplies — animated chip buttons for suggested responses
 * Stagger in sequentially after bot message lands
 */
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
}

const chipVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 18, stiffness: 280 },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.94,
    transition: { duration: 0.15 },
  },
}

export default function QuickReplies({ replies, onSelect, disabled }) {
  if (!replies?.length) return null

  return (
    <AnimatePresence>
      <motion.div
        key="quick-replies"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-wrap gap-2 mb-4 pl-9"
      >
        {replies.map((reply, i) => (
          <motion.button
            key={`${reply}-${i}`}
            variants={chipVariants}
            onClick={() => !disabled && onSelect(reply)}
            disabled={disabled}
            className="
              text-xs font-medium px-3 py-1.5 rounded-full
              border border-os-border bg-os-surface
              text-os-gray-light
              transition-all duration-200
              hover:border-os-lime hover:text-os-lime hover:bg-os-surface
              active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none focus:ring-1 focus:ring-os-lime/40
            "
            whileHover={!disabled ? { scale: 1.03 } : {}}
            whileTap={!disabled ? { scale: 0.96 } : {}}
          >
            {reply}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
