import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'
import { useAuth } from '../../contexts/AuthContext'

export default function ProgramList() {
  const { programs, loading, deleteProgram, duplicateProgram } = usePrograms()
  const { profile } = useAuth()
  const [duplicating, setDuplicating] = useState(null)

  async function handleDuplicate(id) {
    setDuplicating(id)
    await duplicateProgram(id)
    setDuplicating(null)
  }

  const mine = programs.filter(p => p.coach_id === profile?.id)
  const shared = programs.filter(p => p.coach_id !== profile?.id)

  if (loading) return <div className="p-6 text-gray-400">Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Séances</h1>
        <Link to="/coach/programs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Nouvelle séance
        </Link>
      </div>

      {mine.length === 0 && shared.length === 0 && (
        <p className="text-gray-400">Aucune séance. Créez-en une !</p>
      )}

      {mine.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mes séances</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mine.map(p => (
              <div key={p.id} className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex gap-2 mt-5">
                  <Link to={`/coach/programs/${p.id}`}
                    className="flex-1 text-center text-sm border rounded-lg py-1.5 hover:bg-gray-50">
                    Éditer
                  </Link>
                  <button onClick={() => handleDuplicate(p.id)} disabled={duplicating === p.id}
                    className="text-sm text-blue-600 hover:text-blue-800 px-2 disabled:opacity-40">
                    {duplicating === p.id ? '...' : 'Copier'}
                  </button>
                  <button onClick={() => { if (confirm(`Supprimer "${p.name}" ?`)) deleteProgram(p.id) }}
                    className="text-sm text-red-500 hover:text-red-700 px-2">
                    Suppr.
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {shared.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bibliothèque partagée</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shared.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-dashed shadow-sm p-5">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                <button onClick={() => handleDuplicate(p.id)} disabled={duplicating === p.id}
                  className="w-full mt-5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-100 disabled:opacity-40">
                  {duplicating === p.id ? 'Copie en cours...' : '+ Copier dans ma bibliothèque'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
