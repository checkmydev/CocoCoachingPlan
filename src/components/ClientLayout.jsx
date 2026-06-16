import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useStats } from '../contexts/StatsContext'
import { getLevel, getLevelProgress } from '../lib/gamification'
import Logo from './Logo'
import { useClientProfile } from '../hooks/useClientProfile'
import Onboarding from '../pages/client/Onboarding'

const MOOV_GREEN = '#39E229'

const NAV_LINKS = [
  { to: '/client/calendar',    label: 'Calendrier',      short: 'Agenda',  icon: '📅' },
  { to: '/client/programs',    label: 'Séances',         short: 'Séances', icon: '📋' },
  { to: '/client/nutrition',   label: 'Nutrition',       short: 'Nutri.',  icon: '🥗' },
  { to: '/client/lifestyle',   label: 'Lifestyle',       short: 'Style',   icon: '🌿' },
  { to: '/client/progression', label: '⚡ Progression',  short: 'Prog.',   icon: '⚡' },
  { to: '/client/checkin',     label: 'Check-in',        short: 'Check',   icon: '✅' },
]

export default function ClientLayout({ children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile } = useAuth()
  const { stats } = useStats()
  const { clientProfile, loading: profileLoading, saveClientProfile, refetch } = useClientProfile()

  const level = stats ? getLevel(stats.total_xp) : null
  const progress = stats ? getLevelProgress(stats.total_xp) : 0

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

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

  if (profile?.role === 'client' && !clientProfile?.completed_at) {
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

      {/* ── Header ── */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-3">

          <div className="bg-white rounded-xl p-1.5 shrink-0 inline-flex">
            <Logo size="sm" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 flex-1 justify-center overflow-x-auto scrollbar-hide">
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

          {/* Mobile: streak visible in header */}
          <div className="flex md:hidden flex-1 justify-center">
            {stats && (
              <span className="text-sm font-bold" style={{ color: '#f97316' }}>
                🔥 {stats.streak_days} jour{stats.streak_days !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Stats (desktop) + logout */}
          <div className="flex items-center gap-2 shrink-0">
            {stats && (
              <>
                <span className="hidden md:inline text-sm font-semibold" style={{ color: '#f97316' }}>
                  🔥 {stats.streak_days}
                </span>
                {level && (
                  <span className="hidden md:inline px-2 py-0.5 rounded-full text-xs font-bold text-black"
                    style={{ backgroundColor: MOOV_GREEN }}>
                    Niv.{level.level}
                  </span>
                )}
              </>
            )}
            <button
              onClick={handleLogout}
              title={`Déconnecter ${profile?.email ?? ''}`}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2 py-1 transition-colors">
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

      {/* Content */}
      <main className={`mx-auto p-4 pb-24 md:pb-6 ${pathname.includes('/calendar') ? 'w-full max-w-6xl' : 'max-w-2xl'}`}>{children}</main>

      {/* ── Bottom tab bar — mobile only ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white"
        style={{ borderTop: '1px solid #e5e7eb', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}
      >
        {NAV_LINKS.map(({ to, short, icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={({ isActive }) => ({ color: isActive ? MOOV_GREEN : '#9ca3af' })}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: '.58rem', fontWeight: 600, letterSpacing: '.01em' }}>{short}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
