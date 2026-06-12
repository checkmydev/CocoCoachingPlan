import { useStats } from '../../contexts/StatsContext'
import { ACHIEVEMENTS, getLevel, getNextLevel, getLevelProgress } from '../../lib/gamification'

export default function Progression() {
  const { stats, achievements } = useStats()

  if (!stats) return (
    <div className="animate-pulse space-y-4">
      <div className="h-44 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  )

  const earnedIds = new Set(achievements.map(a => a.achievement_id))
  const level = getLevel(stats.total_xp)
  const nextLevel = getNextLevel(stats.total_xp)
  const progress = getLevelProgress(stats.total_xp)
  const earnedCount = earnedIds.size

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Ma progression</h1>

      {/* Level card */}
      <div
        className="rounded-3xl p-6 mb-5 text-center text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
      >
        <div className="text-7xl font-black mb-1 drop-shadow">{level.level}</div>
        <div className="text-2xl font-bold mb-1">{level.title}</div>
        <div className="text-white/70 text-sm mb-4">{stats.total_xp} XP total</div>
        <div className="bg-white/30 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/80 text-sm">
          {nextLevel
            ? `encore ${nextLevel.minXp - stats.total_xp} XP pour le niveau ${nextLevel.level} — ${nextLevel.title}`
            : '🏆 Niveau maximum atteint !'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border shadow-sm p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-orange-500">{stats.streak_days}</div>
          <div className="text-xs text-gray-400">Streak</div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-4 text-center">
          <div className="text-3xl mb-1">💪</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total_sessions}</div>
          <div className="text-xs text-gray-400">Séances</div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-4 text-center">
          <div className="text-3xl mb-1">⚡</div>
          <div className="text-2xl font-bold text-yellow-500">{stats.total_xp}</div>
          <div className="text-xs text-gray-400">XP total</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">Succès</h2>
        <span className="text-sm text-gray-400">{earnedCount} / {ACHIEVEMENTS.length} débloqués</span>
      </div>

      {earnedCount > 0 && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
          <p className="text-yellow-600 font-semibold text-sm">
            {'⭐'.repeat(Math.min(earnedCount, 7))} {earnedCount} succès débloqué{earnedCount > 1 ? 's' : ''} !
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pb-8">
        {ACHIEVEMENTS.map(a => {
          const earned = earnedIds.has(a.id)
          return (
            <div
              key={a.id}
              className={`rounded-2xl p-4 border transition-all ${
                earned
                  ? 'bg-white border-yellow-300 shadow-sm'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className={`text-3xl mb-2 ${earned ? '' : 'grayscale'}`}>{a.emoji}</div>
              <p className={`font-semibold text-sm ${earned ? 'text-gray-800' : 'text-gray-400'}`}>
                {a.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{a.description}</p>
              {earned
                ? <p className="text-xs text-green-500 mt-1.5 font-medium">✓ Débloqué</p>
                : <p className="text-xs text-gray-300 mt-1.5">🔒 Verrouillé</p>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}
