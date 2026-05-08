import { NavLink } from 'react-router-dom'
import {
  Squares2X2Icon,
  ChartBarIcon,
  BanknotesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', Icon: Squares2X2Icon },
  { path: '/budget', label: 'Contrôle budgétaire', Icon: ChartBarIcon },
  { path: '/subsidies', label: 'Subsides', Icon: BanknotesIcon },
  { path: '/validations', label: 'Validations', Icon: CheckCircleIcon },
]

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-crb-navy flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div className="w-7 h-7 bg-crb-red rounded-sm flex-shrink-0" />
        <span className="text-white font-semibold text-sm leading-tight">CRB Finance Hub</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs">Contrôleur Financier</p>
        <p className="text-white/70 text-sm font-medium">Marie Dupont</p>
      </div>
    </aside>
  )
}
