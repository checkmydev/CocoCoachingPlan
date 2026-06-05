import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExercises } from '../../hooks/useExercises'

const MUSCLE_GROUPS = ['Dos', 'Pectoraux', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Abdominaux', 'Full body']

export default function ExerciseList() {
  const { exercises, loading, deleteExercise } = useExercises()
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')

  const filtered = exercises.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = !muscleFilter || (e.muscle_groups ?? []).includes(muscleFilter)
    return matchName && matchMuscle
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bibliothèque d'exercices</h1>
        <Link to="/coach/exercises/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Ajouter
        </Link>
      </div>

      <div className="flex gap-3 mb-5">
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={muscleFilter} onChange={e => setMuscleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tous les muscles</option>
          {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {loading ? <p className="text-gray-400">Chargement...</p>
        : filtered.length === 0 ? <p className="text-gray-400">Aucun exercice trouvé.</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ex => (
              <div key={ex.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {ex.thumbnail_url && (
                  <img src={ex.thumbnail_url} alt="" className="w-full h-36 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{ex.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ex.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(ex.muscle_groups ?? []).map(m => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
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
            ))}
          </div>
        )}
    </div>
  )
}
