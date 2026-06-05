import { Link } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'

export default function ProgramList() {
  const { programs, loading, deleteProgram } = usePrograms()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Programmes</h1>
        <Link to="/coach/programs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Nouveau programme
        </Link>
      </div>

      {loading ? <p className="text-gray-400">Chargement...</p>
        : programs.length === 0 ? <p className="text-gray-400">Aucun programme. Créez-en un !</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p => (
              <div key={p.id} className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex gap-2 mt-5">
                  <Link to={`/coach/programs/${p.id}`}
                    className="flex-1 text-center text-sm border rounded-lg py-1.5 hover:bg-gray-50">
                    Éditer
                  </Link>
                  <button
                    onClick={() => { if (confirm(`Supprimer "${p.name}" ?`)) deleteProgram(p.id) }}
                    className="text-sm text-red-500 hover:text-red-700 px-2">
                    Suppr.
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
