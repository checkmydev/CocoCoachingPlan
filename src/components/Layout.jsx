import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

const NAV = [
  { to: '/coach/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/coach/exercises', label: 'Exercices', icon: '🏋️' },
  { to: '/coach/programs', label: 'Programmes', icon: '📋' },
  { to: '/coach/clients', label: 'Clients', icon: '👥' },
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
      <aside className="w-56 flex flex-col shrink-0" style={{ backgroundColor: '#0f0f0f' }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(57,226,41,0.15)' }}>
          <Logo dark size="sm" />
          <p className="text-xs mt-2 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {profile?.name ?? profile?.email}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#39E229', color: '#000' } : {}}
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
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

      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  )
}
