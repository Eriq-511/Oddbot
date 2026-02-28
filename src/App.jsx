/**
 * App.jsx — OddBot Demo Page
 * 
 * Serves as:
 * 1. Standalone hosted demo at your Vercel URL
 * 2. Embed example showing the widget floating in bottom-right
 * 
 * The full widget is self-contained in <ChatWidget />
 */
import ChatWidget from './components/ChatWidget'

export default function App() {
  return (
    <div className="demo-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto mb-12">
        {/* Logo mark */}
        <div className="inline-flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C8FF57 0%, #9ED43A 100%)' }}
          >
            <span className="text-os-black font-black text-lg tracking-tighter">O</span>
          </div>
          <span
            className="text-os-white font-black text-xl tracking-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Odd Shoes
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-os-white font-black leading-none mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em' }}
        >
          Meet{' '}
          <span
            className="lime-glow"
            style={{ color: '#C8FF57' }}
          >
            OddBot.
          </span>
        </h1>

        <p className="text-os-gray text-base leading-relaxed font-normal max-w-sm mx-auto">
          Our frontline digital rep. Tells you what we build, 
          figures out what you need, and puts together a live brief — 
          all in one conversation.
        </p>

        {/* Sub-badge */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="text-[11px] text-os-gray/60 font-mono uppercase tracking-widest">
            custom software
          </span>
          <span className="w-1 h-1 rounded-full bg-os-gray/30" />
          <span className="text-[11px] text-os-gray/60 font-mono uppercase tracking-widest">
            oddshoes.dev
          </span>
        </div>
      </div>

      {/* Arrow hint */}
      <div className="fixed bottom-24 right-8 z-40 flex flex-col items-center gap-1 pointer-events-none">
        <p
          className="text-[11px] font-medium tracking-wide"
          style={{ color: 'rgba(200,255,87,0.5)', writingMode: 'horizontal-tb' }}
        >
          Talk to us ↓
        </p>
      </div>

      {/* The actual chat widget — floats bottom-right as a widget */}
      <ChatWidget embedded={false} />
    </div>
  )
}
