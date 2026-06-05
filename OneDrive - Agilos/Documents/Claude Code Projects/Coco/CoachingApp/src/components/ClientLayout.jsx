import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientLayout({ children }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">CoachApp</span>
        <NavLink to="/client/programs"
          className={({ isActive }) => isActive ? 'text-blue-600 font-medium text-sm' : 'text-gray-600 hover:text-gray-900 text-sm'}>
          Mes programmes
        </NavLink>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
          Déconnexion
        </button>
      </header>
      <main className="max-w-2xl mx-auto p-4">{children}</main>
    </div>
  )
}
