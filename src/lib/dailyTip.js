import { useState, useEffect } from 'react'
import { TIPS, getNextTip } from './tips'

// Affiche un conseil toutes les 3,5 jours (~2x par semaine).
const INTERVAL_MS = 3.5 * 24 * 60 * 60 * 1000

function storageKey(userId) { return `moovlab_tips_${userId}` }

function loadStore(userId) {
  try { return JSON.parse(localStorage.getItem(storageKey(userId))) || {} } catch { return {} }
}

function saveStore(userId, data) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data))
}

export function useDailyTip(userId, selectedObjectiveIds) {
  const [tip, setTip] = useState(null)

  useEffect(() => {
    if (!userId || !selectedObjectiveIds?.length) return

    const stored = loadStore(userId)
    const { lastShownAt = 0, shownIds = [], pendingId = null } = stored

    // Reprendre un conseil en attente (pas encore dismissé)
    if (pendingId) {
      const pending = TIPS.find(t => t.id === pendingId)
      if (pending) { setTip(pending); return }
    }

    if (Date.now() - lastShownAt < INTERVAL_MS) return

    const next = getNextTip(selectedObjectiveIds, shownIds)
    if (!next) return

    saveStore(userId, { ...stored, pendingId: next.id })
    setTip(next)
  }, [userId, JSON.stringify(selectedObjectiveIds)]) // eslint-disable-line

  function dismiss() {
    if (!tip || !userId) return
    const stored = loadStore(userId)
    saveStore(userId, {
      lastShownAt: Date.now(),
      shownIds: [...(stored.shownIds || []), tip.id],
      pendingId: null,
    })
    setTip(null)
  }

  return { tip, dismiss }
}
