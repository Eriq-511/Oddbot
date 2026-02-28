/**
 * TypingIndicator — animated three-dot indicator with brand styling
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4 animate-fade-in">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-os-lime flex items-center justify-center flex-shrink-0 mb-1">
        <span className="text-os-black font-bold text-xs">O</span>
      </div>

      {/* Dots */}
      <div className="bg-os-surface border border-os-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-os-gray"
            style={{
              animation: `bounceDot 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
