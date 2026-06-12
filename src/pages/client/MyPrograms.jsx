import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function MyPrograms() {
  const { profile } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('client_programs')
      .select('*, program:programs(*)')
      .eq('client_id', profile.id)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .then(({ data }) => { setPrograms(data ?? []); setLoading(false) })
  }, [profile])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes séances</h1>
      {loading ? <p className="text-gray-400">Chargement...</p>
        : programs.length === 0
          ? <p className="text-gray-400">Aucune séance assignée pour l'instant.</p>
          : (
            <div className="space-y-3">
              {programs.map(cp => (
                <Link key={cp.id} to={`/client/programs/${cp.program_id}`}
                  className="block bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{cp.program?.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cp.program?.description}</p>
                  {cp.start_date && (
                    <p className="text-xs text-blue-600 mt-2">
                      Démarré le {new Date(cp.start_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
    </div>
  )
}
