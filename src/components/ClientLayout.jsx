import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStats } from '../contexts/StatsContext'
import { getLevel, getLevelProgress } from '../lib/gamification'

export default function ClientLayout({ children }) {
  const navigate = useNavigate()
  const { stats } = useStats()

  const level = stats ? getLevel(stats.total_xp) : null
  const progress = stats ? getLevelProgress(stats.total_xp) : 0

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="font-bold text-lg shrink-0">CoachApp</span>

          <nav className="flex gap-4 flex-1 justify-center">
            <NavLink to="/client/programs"
              className={({ isActive }) => isActive ? 'text-blue-600 font-medium text-sm' : 'text-gray-500 hover:text-gray-900 text-sm'}>
              Programmes
            </NavLink>
            <NavLink to="/client/checkin"
              className={({ isActive }) => isActive ? 'text-blue-600 font-medium text-sm' : 'text-gray-500 hover:text-gray-900 text-sm'}>
              Check-in
            </NavLink>
            <NavLink to="/client/progression"
              className={({ isActive }) => isActive ? 'text-blue-600 font-medium text-sm' : 'text-gray-500 hover:text-gray-900 text-sm'}>
              ⚡ Progression
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {stats && (
              <>
                <span className="text-orange-500 font-semibold text-sm">🔥 {stats.streak_days}</span>
                {level && (
                  <span
                    className="hidden sm:inline px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: level.color }}
                  >
                    Niv.{level.level}
                  </span>
                )}
              </>
            )}
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-900 ml-1">
              ↩
            </button>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="h-1 bg-gray-100">
          {stats && (
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: level?.color ?? '#3B82F6' }}
            />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">{children}</main>
    </div>
  )
}
