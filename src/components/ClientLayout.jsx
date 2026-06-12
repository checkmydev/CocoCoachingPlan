import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useStats } from '../contexts/StatsContext'
import { getLevel, getLevelProgress } from '../lib/gamification'
import Logo from './Logo'

const MOOV_GREEN = '#39E229'

export default function ClientLayout({ children }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { stats } = useStats()

  const level = stats ? getLevel(stats.total_xp) : null
  const progress = stats ? getLevelProgress(stats.total_xp) : 0

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <Logo size="sm" />

          <nav className="flex gap-1 flex-1 justify-center">
            {[
              { to: '/client/programs', label: 'Programmes' },
              { to: '/client/checkin',  label: 'Check-in' },
              { to: '/client/progression', label: '⚡ Progression' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'text-black' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
                style={({ isActive }) => isActive ? { backgroundColor: MOOV_GREEN, color: '#000' } : {}}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {stats && (
              <>
                <span className="text-sm font-semibold" style={{ color: '#f97316' }}>
                  🔥 {stats.streak_days}
                </span>
                {level && (
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full text-xs font-bold text-black"
                    style={{ backgroundColor: MOOV_GREEN }}>
                    Niv.{level.level}
                  </span>
                )}
              </>
            )}
            <button
              onClick={handleLogout}
              title={`Déconnecter ${profile?.email ?? ''}`}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2 py-1 transition-colors ml-1">
              <span className="hidden sm:inline max-w-[100px] truncate">{profile?.email}</span>
              <span>↩</span>
            </button>
          </div>
        </div>

        {/* XP progress bar — MoovLab green */}
        <div className="h-1 bg-gray-100">
          {stats && (
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: MOOV_GREEN }}
            />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">{children}</main>
    </div>
  )
}
