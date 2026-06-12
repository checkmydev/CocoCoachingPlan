import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useStats } from '../contexts/StatsContext'
import { getLevel, getLevelProgress } from '../lib/gamification'
import Logo from './Logo'
import { useClientProfile } from '../hooks/useClientProfile'
import Onboarding from '../pages/client/Onboarding'

const MOOV_GREEN = '#39E229'

const NAV_LINKS = [
  { to: '/client/calendar',    label: 'Calendrier' },
  { to: '/client/programs',    label: 'Programmes' },
  { to: '/client/nutrition',   label: 'Nutrition' },
  { to: '/client/lifestyle',   label: 'Lifestyle' },
  { to: '/client/progression', label: '⚡ Progression' },
  { to: '/client/checkin',     label: 'Check-in' },
]

export default function ClientLayout({ children }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { stats } = useStats()
  const { clientProfile, loading: profileLoading, saveClientProfile, refetch } = useClientProfile()

  const level = stats ? getLevel(stats.total_xp) : null
  const progress = stats ? getLevelProgress(stats.total_xp) : 0

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Full-page spinner while loading client profile
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-transparent animate-spin"
            style={{ borderTopColor: MOOV_GREEN }} />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // Onboarding gate — show if no completed profile
  if (!clientProfile?.completed_at) {
    return (
      <Onboarding
        initialData={clientProfile ?? {}}
        save={saveClientProfile}
        onComplete={refetch}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <div className="rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#0f0f0f' }}>
            <Logo size="sm" />
          </div>

          <nav className="flex gap-1 flex-1 justify-center overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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

        {/* XP progress bar */}
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
