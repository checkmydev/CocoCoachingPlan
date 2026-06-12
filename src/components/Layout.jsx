import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/coach/dashboard', label: 'Tableau de bord' },
  { to: '/coach/exercises', label: 'Exercices' },
  { to: '/coach/programs', label: 'Programmes' },
  { to: '/coach/clients', label: 'Clients' },
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
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <p className="text-lg font-bold">CoachApp</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{profile?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-700 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-lg transition-colors text-left">
            ↩ Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  )
}
