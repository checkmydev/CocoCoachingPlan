import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'
import ClientLayout from './ClientLayout'

export default function ProtectedRoute({ role }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  // Profile exists but no role — avoid redirect loop, send back to login
  if (profile && !profile.role) return <Navigate to="/login" replace />
  if (profile && profile.role !== role) {
    return <Navigate to={profile.role === 'coach' ? '/coach/dashboard' : '/client/programs'} replace />
  }

  return role === 'coach'
    ? <Layout><Outlet /></Layout>
    : <ClientLayout><Outlet /></ClientLayout>
}
