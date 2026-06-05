import { Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useClients } from '../../hooks/useClients'

export default function ClientList() {
  const { clients, loading } = useClients()
  const { profile } = useAuth()
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    setStatus(null)
    const { error } = await supabase.functions.invoke('send-client-invitation', {
      body: { email, coachName: profile.name }
    })
    setStatus(error ? `Erreur: ${error.message}` : `Invitation envoyée à ${email} ✓`)
    setEmail('')
    setInviting(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>

      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 max-w-md">
        <h2 className="font-semibold mb-3">Inviter un nouveau client</h2>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input type="email" placeholder="Email du client" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={inviting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {inviting ? '...' : 'Inviter'}
          </button>
        </form>
        {status && (
          <p className={`text-sm mt-2 ${status.startsWith('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
            {status}
          </p>
        )}
      </div>

      {loading ? <p className="text-gray-400">Chargement...</p>
        : clients.length === 0 ? <p className="text-gray-400">Aucun client pour l'instant. Invitez quelqu'un !</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map(client => (
              <Link key={client.id} to={`/coach/clients/${client.id}`}
                className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mb-2">
                  {(client.name ?? client.email).charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
