import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'
import { useAuth } from '../../contexts/AuthContext'
import { SESSION_TYPES } from '../../lib/sessionTypes'

const FILTER_TYPES = Object.entries(SESSION_TYPES).filter(([k]) => !['day_off', 'moovlab'].includes(k))

export default function ProgramList() {
  const { programs, loading, deleteProgram, duplicateProgram } = usePrograms()
  const { profile } = useAuth()
  const [duplicating, setDuplicating] = useState(null)
  const [sportFilter, setSportFilter] = useState('')

  async function handleDuplicate(id) {
    setDuplicating(id)
    await duplicateProgram(id)
    setDuplicating(null)
  }

  const filterPrograms = list => sportFilter
    ? list.filter(p => (p.sport_type ?? 'other') === sportFilter)
    : list

  const mine = filterPrograms(programs.filter(p => p.coach_id === profile?.id))
  const shared = filterPrograms(programs.filter(p => p.coach_id !== profile?.id))

  if (loading) return <div className="p-6 text-gray-400">Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Séances</h1>
        <Link to="/coach/programs/new"
          className="text-sm font-bold px-4 py-2 rounded-xl"
          style={{ backgroundColor: '#39E229', color: '#000' }}>
          + Nouvelle séance
        </Link>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setSportFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
            !sportFilter ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
          }`}>
          Toutes
        </button>
        {FILTER_TYPES.map(([key, { label, color, emoji }]) => (
          <button key={key} onClick={() => setSportFilter(sportFilter === key ? '' : key)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
            style={sportFilter === key
              ? { backgroundColor: color, borderColor: color, color: '#fff' }
              : { borderColor: '#e5e7eb', color: '#6b7280' }}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {mine.length === 0 && shared.length === 0 && (
        <p className="text-gray-400">Aucune séance. Créez-en une !</p>
      )}

      {mine.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mes séances</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mine.map(p => {
              const st = SESSION_TYPES[p.sport_type] ?? SESSION_TYPES.other
              return (
                <div key={p.id} className="bg-white rounded-xl border shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{st.emoji}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
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
              )
            })}
          </div>
        </section>
      )}

      {shared.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bibliothèque partagée</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shared.map(p => {
              const st = SESSION_TYPES[p.sport_type] ?? SESSION_TYPES.other
              return (
                <div key={p.id} className="bg-white rounded-xl border border-dashed shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{st.emoji}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  <button onClick={() => handleDuplicate(p.id)} disabled={duplicating === p.id}
                    className="w-full mt-5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-100 disabled:opacity-40">
                    {duplicating === p.id ? 'Copie en cours...' : '+ Copier dans ma bibliothèque'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
