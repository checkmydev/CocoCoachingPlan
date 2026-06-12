import { useEffect, useState } from 'react'
import Confetti from './Confetti'
import { getLevel, getNextLevel, getLevelProgress } from '../lib/gamification'

export default function Celebration({ xpGained, newStreak, totalXp, newAchievements, onClose }) {
  const [visible, setVisible] = useState(false)
  const [xpDisplay, setXpDisplay] = useState(0)

  const prevTotalXp = totalXp - xpGained
  const prevLevel = getLevel(prevTotalXp)
  const newLevel = getLevel(totalXp)
  const leveledUp = newLevel.level > prevLevel.level
  const nextLevel = getNextLevel(totalXp)
  const progress = getLevelProgress(totalXp)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let count = 0
    const step = Math.ceil(xpGained / 25)
    const interval = setInterval(() => {
      count = Math.min(count + step, xpGained)
      setXpDisplay(count)
      if (count >= xpGained) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [xpGained])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <Confetti active />
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl p-7 w-full max-w-sm shadow-2xl mx-0 sm:mx-4"
        style={{
          animation: visible ? 'slideUp 0.4s ease-out forwards' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-6xl mb-2" style={{ animation: 'popIn 0.5s 0.3s ease-out both' }}>
            {leveledUp ? '🎊' : '🎉'}
          </div>
          {leveledUp ? (
            <>
              <h2 className="text-2xl font-black text-purple-600">Niveau {newLevel.level} !</h2>
              <p className="text-gray-500 text-sm mt-0.5">Tu es maintenant {newLevel.title} 🔥</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Séance terminée !</h2>
              <p className="text-gray-400 text-sm mt-0.5">Continue comme ça, tu es en feu !</p>
            </>
          )}
        </div>

        {/* XP gained */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-3 text-center">
          <p className="text-yellow-500 text-xs font-semibold uppercase tracking-wide mb-0.5">XP gagnés</p>
          <p className="text-4xl font-black text-yellow-500">+{xpDisplay}</p>
        </div>

        {/* Streak */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 mb-3 flex items-center justify-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-xl font-bold text-orange-500">
              {newStreak} jour{newStreak > 1 ? 's' : ''}
            </p>
            <p className="text-orange-400 text-xs">de streak actif</p>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Niv.{newLevel.level} — {newLevel.title}</span>
            {nextLevel
              ? <span>{nextLevel.minXp - totalXp} XP → Niv.{nextLevel.level}</span>
              : <span>Niveau max !</span>
            }
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: newLevel.color }}
            />
          </div>
        </div>

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <div className="mb-4 space-y-2">
            {newAchievements.map(a => (
              <div key={a.id} className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{a.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Succès débloqué !</p>
                  <p className="font-bold text-purple-700 text-sm">{a.name}</p>
                  <p className="text-xs text-purple-400">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: newLevel.color }}
        >
          Continuer →
        </button>
      </div>
    </div>
  )
}
