/**
 * BriefCard — The Brief Builder innovation feature
 * 
 * A live card that populates as OddBot extracts project details.
 * Animates in when first detail is captured. Reveals more as the
 * conversation deepens. Locked in when email is submitted.
 * 
 * This is the signature mechanic that makes the chatbot feel like
 * a creative tool, not just a Q&A widget.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Lock, CheckCircle, Loader } from 'lucide-react'

const BRIEF_LABELS = {
  project_type: 'Project Type',
  description: 'What You\'re Building',
  timeline: 'Timeline',
  budget_range: 'Budget Range',
  name: 'Your Name',
}

const FIELD_ORDER = ['project_type', 'name', 'description', 'timeline', 'budget_range']

function BriefRow({ label, value, index }) {
  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      transition={{
        type: 'spring',
        damping: 22,
        stiffness: 250,
        delay: index * 0.04,
      }}
      className="overflow-hidden"
    >
      <div className="py-2 border-b border-os-border/50 last:border-0">
        <span className="text-[10px] font-semibold text-os-gray uppercase tracking-widest block mb-0.5">
          {label}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs text-os-white font-medium leading-snug"
        >
          {value}
        </motion.span>
      </div>
    </motion.div>
  )
}

export default function BriefCard({ briefState, isComplete, isVisible }) {
  const filledFields = FIELD_ORDER
    .map(key => ({ key, label: BRIEF_LABELS[key], value: briefState[key] }))
    .filter(f => f.value)

  const totalKnownFields = FIELD_ORDER.length
  const filledCount = filledFields.length
  const completionPct = Math.round((filledCount / totalKnownFields) * 100)

  if (!isVisible || filledCount === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        key="brief-card"
        initial={{ opacity: 0, x: 10, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.96 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="w-full"
      >
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(200,255,87,0.05) 0%, rgba(10,10,10,0.9) 100%)',
            borderColor: isComplete
              ? 'rgba(200, 255, 87, 0.4)'
              : 'rgba(200, 255, 87, 0.15)',
            boxShadow: isComplete
              ? '0 0 20px rgba(200, 255, 87, 0.1)'
              : 'none',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-os-border/50">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle size={13} className="text-os-lime" />
              ) : (
                <FileText size={13} className="text-os-lime" />
              )}
              <span className="text-os-lime text-[11px] font-bold tracking-wider uppercase">
                {isComplete ? 'Brief Locked In' : 'Live Brief'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!isComplete && (
                <Loader size={9} className="text-os-gray animate-spin" />
              )}
              <span className="text-os-gray text-[10px] font-mono">
                {filledCount}/{totalKnownFields}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="w-full h-0.5 bg-os-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #C8FF57, #A8E040)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="px-4 pb-3 space-y-0">
            {filledFields.map((field, index) => (
              <BriefRow
                key={field.key}
                label={field.label}
                value={field.value}
                index={index}
              />
            ))}
          </div>

          {/* Footer state */}
          {isComplete ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 pb-3 pt-1 flex items-center gap-1.5"
            >
              <Lock size={10} className="text-os-lime" />
              <span className="text-os-lime text-[10px] font-medium">
                Brief submitted — team notified
              </span>
            </motion.div>
          ) : (
            <div className="px-4 pb-3 pt-1">
              <span className="text-os-gray text-[10px]">
                Building as we talk ↑
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
