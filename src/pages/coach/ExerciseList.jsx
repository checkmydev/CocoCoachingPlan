import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExercises } from '../../hooks/useExercises'
import { SESSION_TYPES } from '../../lib/sessionTypes'

const EXERCISE_SPORT_TYPES = Object.entries(SESSION_TYPES)
  .filter(([k]) => !['day_off', 'moovlab'].includes(k))

export default function ExerciseList() {
  const { exercises, loading, deleteExercise } = useExercises()
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('')

  const filtered = exercises.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase())
    const matchSport = !sportFilter || (e.sport_type ?? 'strength') === sportFilter
    return matchName && matchSport
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Bibliothèque d'exercices</h1>
        <Link to="/coach/exercises/new"
          className="text-sm font-bold px-4 py-2 rounded-xl"
          style={{ backgroundColor: '#39E229', color: '#000' }}>
          + Ajouter
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setSportFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
            !sportFilter ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
          }`}>
          Tous
        </button>
        {EXERCISE_SPORT_TYPES.map(([key, { label, color, emoji }]) => (
          <button key={key} onClick={() => setSportFilter(sportFilter === key ? '' : key)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
            style={sportFilter === key
              ? { backgroundColor: color, borderColor: color, color: '#fff' }
              : { borderColor: '#e5e7eb', color: '#6b7280' }}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input placeholder="Rechercher un exercice..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-green-400" />

      {loading ? <p className="text-gray-400">Chargement...</p>
        : filtered.length === 0 ? <p className="text-gray-400">Aucun exercice trouvé.</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ex => {
              const st = SESSION_TYPES[ex.sport_type] ?? SESSION_TYPES.other
              return (
                <div key={ex.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  {ex.thumbnail_url && (
                    <img src={ex.thumbnail_url} alt="" className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{st.emoji}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <h3 className="font-semibold">{ex.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ex.description}</p>
                    {(ex.muscle_groups ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ex.muscle_groups.map(m => (
                          <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Link to={`/coach/exercises/${ex.id}`}
                        className="flex-1 text-center text-sm border rounded-lg py-1.5 hover:bg-gray-50">
                        Modifier
                      </Link>
                      <button onClick={() => {
                        if (confirm(`Supprimer "${ex.name}" ?`)) deleteExercise(ex.id)
                      }} className="text-sm text-red-500 hover:text-red-700 px-2">
                        Suppr.
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
