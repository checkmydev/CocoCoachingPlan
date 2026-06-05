import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import VideoPlayer from '../../components/VideoPlayer'

export default function ActiveSession() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [logs, setLogs] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSession()
  }, [id])

  async function loadSession() {
    const { data } = await supabase
      .from('program_sessions')
      .select('*, session_exercises(*, exercise:exercises(*))')
      .eq('id', id)
      .single()
    if (!data) return
    setSession(data)
    const sorted = (data.session_exercises ?? []).sort((a, b) => a.order - b.order)
    setExercises(sorted)
    const init = {}
    sorted.forEach(ex => {
      init[ex.id] = { sets_done: ex.sets, reps_done: ex.reps, weight: '', effort: 5, notes: '' }
    })
    setLogs(init)
  }

  function updateLog(exId, field, value) {
    setLogs(prev => ({ ...prev, [exId]: { ...prev[exId], [field]: value } }))
  }

  async function handleFinish() {
    setSaving(true)
    const exercisesData = exercises.map(ex => ({
      exercise_id: ex.exercise_id,
      exercise_name: ex.exercise?.name,
      sets_done: logs[ex.id]?.sets_done,
      reps_done: logs[ex.id]?.reps_done,
      weight: logs[ex.id]?.weight,
      effort: logs[ex.id]?.effort,
      notes: logs[ex.id]?.notes,
    }))
    await supabase.from('session_logs').insert({
      client_id: profile.id,
      program_session_id: id,
      exercises_data: exercisesData,
      completed: true,
    })
    navigate(-1)
  }

  if (!session) return <div className="p-4 text-gray-400">Chargement...</div>

  const current = exercises[currentIdx]
  const progress = ((currentIdx + 1) / exercises.length) * 100

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">{session.name}</h1>
        <span className="text-sm text-gray-400">{currentIdx + 1} / {exercises.length}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
        <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {current && (
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-4">
          <h2 className="text-xl font-semibold">{current.exercise?.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {current.sets} séries × {current.reps} reps
            {current.rest_seconds ? ` · Repos ${current.rest_seconds}s` : ''}
          </p>
          {current.notes && <p className="text-sm text-blue-600 mt-1">💡 {current.notes}</p>}

          {current.exercise?.video_url && (
            <div className="mt-4">
              <VideoPlayer url={current.exercise.video_url} />
            </div>
          )}

          {current.exercise?.instructions && (
            <p className="text-sm text-gray-600 mt-4 whitespace-pre-wrap leading-relaxed">
              {current.exercise.instructions}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { label: 'Séries réalisées', field: 'sets_done', type: 'number', min: 0, defaultVal: current.sets },
              { label: 'Reps / Distance', field: 'reps_done', type: 'text', defaultVal: current.reps },
              { label: 'Poids (kg)', field: 'weight', type: 'number', min: 0, step: 0.5, placeholder: '—' },
              { label: 'Effort (1–10)', field: 'effort', type: 'number', min: 1, max: 10, defaultVal: 5 },
            ].map(({ label, field, type, min, max, step, placeholder, defaultVal }) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type={type} min={min} max={max} step={step}
                  value={logs[current.id]?.[field] ?? defaultVal ?? ''}
                  placeholder={placeholder}
                  onChange={e => updateLog(current.id, field, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea rows={2}
              value={logs[current.id]?.notes ?? ''}
              onChange={e => updateLog(current.id, 'notes', e.target.value)}
              placeholder="Comment s'est passé cet exercice ?"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {currentIdx > 0 && (
          <button onClick={() => setCurrentIdx(i => i - 1)}
            className="flex-1 border rounded-xl py-3 hover:bg-gray-50 font-medium">
            ← Précédent
          </button>
        )}
        {currentIdx < exercises.length - 1 ? (
          <button onClick={() => setCurrentIdx(i => i + 1)}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 font-medium">
            Suivant →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving}
            className="flex-1 bg-green-600 text-white rounded-xl py-3 hover:bg-green-700 disabled:opacity-50 font-semibold">
            {saving ? 'Sauvegarde...' : '✓ Terminer la séance'}
          </button>
        )}
      </div>
    </div>
  )
}
