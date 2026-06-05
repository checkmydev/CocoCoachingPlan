import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV = [
  { to: '/coach/dashboard', label: 'Tableau de bord' },
  { to: '/coach/exercises', label: 'Exercices' },
  { to: '/coach/programs', label: 'Programmes' },
  { to: '/coach/clients', label: 'Clients' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 text-lg font-bold border-b border-gray-700">CoachApp</div>
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
        <button onClick={handleLogout} className="m-4 text-sm text-gray-400 hover:text-white text-left">
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  )
}
