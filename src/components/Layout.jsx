import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

const NAV = [
  { to: '/coach/dashboard',      label: 'Tableau de bord', short: 'Accueil',    icon: '📊' },
  { to: '/coach/exercises',      label: 'Exercices',       short: 'Exercices',  icon: '🏋️' },
  { to: '/coach/programs',       label: 'Séances',         short: 'Séances',    icon: '📋' },
  { to: '/coach/clients',        label: 'Clients',         short: 'Clients',    icon: '👥' },
  { to: '/coach/watch-emulator', label: 'Watch Emulator',  short: 'Montre',     icon: '⌚' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { profile } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar — desktop only ── */}
      <aside className="hidden md:flex w-56 flex-col shrink-0" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(57,226,41,0.15)' }}>
          <div className="bg-white rounded-2xl p-2.5 inline-flex mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {profile?.name ?? profile?.email}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#39E229', color: '#000' } : {}}
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(57,226,41,0.1)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,50,50,0.15)'; e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            <span>↩</span>
            <span className="truncate">{profile?.email}</span>
          </button>
        </div>
      </aside>

      {/* ── Content column (mobile header + main) ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top header */}
        <header
          className="flex md:hidden items-center justify-between px-4 py-2.5 sticky top-0 z-40 shrink-0"
          style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid rgba(57,226,41,0.15)' }}
        >
          <div className="bg-white rounded-xl p-1.5 inline-flex">
            <Logo size="sm" />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <span className="max-w-[150px] truncate">{profile?.email}</span>
            <span>↩</span>
          </button>
        </header>

        <main
          className="flex-1 bg-gray-50 overflow-y-auto pb-16 md:pb-0"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {children}
        </main>
      </div>

      {/* ── Bottom tab bar — mobile only ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{ backgroundColor: '#0f0f0f', borderTop: '1px solid rgba(57,226,41,0.15)' }}
      >
        {NAV.map(({ to, short, icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={({ isActive }) => ({ color: isActive ? '#39E229' : 'rgba(255,255,255,0.38)' })}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: '.58rem', fontWeight: 600, letterSpacing: '.01em' }}>{short}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
