import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Outlet, useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/budget': 'Contrôle budgétaire',
  '/subsidies': 'Gestion des subsides',
  '/validations': 'Workflow de validation',
}

export function Layout() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'CRB Finance Hub'
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
