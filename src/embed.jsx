/**
 * embed.jsx — Standalone widget entry for oddshoes.dev
 *
 * Drop this script tag on any page to mount OddBot:
 *   <script src="https://your-vercel-url.vercel.app/embed.js" defer></script>
 *   <div id="oddbot-root"></div>
 *
 * Or with auto-mount (no div needed):
 *   <script src="https://your-vercel-url.vercel.app/embed.js" data-auto-mount defer></script>
 */
import { createRoot } from 'react-dom/client'
import ChatWidget from './components/ChatWidget'
import './index.css'

function mountOddBot(container) {
  const root = createRoot(container)
  root.render(<ChatWidget embedded={false} />)
}

// Auto mount: if script tag has data-auto-mount OR there's a #oddbot-root div
function init() {
  const scripts = document.querySelectorAll('script[src*="embed"]')
  const autoMount = Array.from(scripts).some(s => s.dataset.autoMount !== undefined)

  const target = document.getElementById('oddbot-root')

  if (target) {
    mountOddBot(target)
    return
  }

  if (autoMount) {
    const div = document.createElement('div')
    div.id = 'oddbot-root'
    document.body.appendChild(div)
    mountOddBot(div)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Expose manual mount for programmatic use
window.OddBot = { mount: mountOddBot }
