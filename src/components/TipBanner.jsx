import { useState, useRef } from 'react'

const MOOV_GREEN = '#39E229'
const SWIPE_THRESHOLD = 80

const CATEGORY_ICONS = {
  Natation: '🏊', Cyclisme: '🚴', Course: '🏃', Transitions: '⚡',
  Nutrition: '🥗', Récupération: '😴', Mental: '🧠', Logistique: '📋',
  Entraînement: '💪', Équipement: '🎽',
}

export default function TipBanner({ tip, onDismiss }) {
  const [offsetX, setOffsetX] = useState(0)
  const [exiting, setExiting] = useState(false)
  const startX = useRef(null)

  function dismiss() {
    setExiting(true)
    setTimeout(onDismiss, 320)
  }

  // Touch handlers
  function onTouchStart(e) { startX.current = e.touches[0].clientX }
  function onTouchMove(e) {
    const dx = e.touches[0].clientX - startX.current
    if (dx > 0) setOffsetX(dx)
  }
  function onTouchEnd() {
    if (offsetX >= SWIPE_THRESHOLD) dismiss()
    else setOffsetX(0)
  }

  // Mouse drag (desktop)
  const dragging = useRef(false)
  function onMouseDown(e) { dragging.current = true; startX.current = e.clientX }
  function onMouseMove(e) {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    if (dx > 0) setOffsetX(dx)
  }
  function onMouseUp() {
    dragging.current = false
    if (offsetX >= SWIPE_THRESHOLD) dismiss()
    else setOffsetX(0)
  }

  const icon = CATEGORY_ICONS[tip.category] ?? '💡'
  const opacity = Math.max(0, 1 - offsetX / 250)

  return (
    <div
      className="mx-3 mt-3 select-none cursor-grab active:cursor-grabbing"
      style={{
        transform: exiting ? 'translateX(110%)' : `translateX(${offsetX}px)`,
        opacity: exiting ? 0 : opacity,
        transition: exiting || offsetX === 0 ? 'transform 0.32s ease, opacity 0.32s ease' : 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }}>
        {/* Barre colorée en haut */}
        <div className="h-1" style={{ backgroundColor: MOOV_GREEN }} />

        <div className="px-4 py-3 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: MOOV_GREEN }}>
                Conseil du jour
              </span>
              <span className="text-xs text-gray-400">· {tip.category}</span>
            </div>
            <p className="font-semibold text-sm text-gray-900 leading-snug">{tip.title}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tip.body}</p>
          </div>

          <button
            onClick={dismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none mt-0.5 px-1"
            onMouseDown={e => e.stopPropagation()}
          >
            ×
          </button>
        </div>

        <div className="px-4 pb-2 text-right">
          <span className="text-xs text-gray-300">← glisser pour fermer</span>
        </div>
      </div>
    </div>
  )
}
