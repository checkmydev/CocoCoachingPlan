import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useExercises } from '../../hooks/useExercises'
import SortableExercise from '../../components/SortableExercise'
import { SESSION_TYPES } from '../../lib/sessionTypes'

const TYPE_OPTIONS = Object.entries(SESSION_TYPES).filter(([k]) => !['day_off', 'moovlab'].includes(k))

export default function ProgramBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { exercises: library } = useExercises()
  const isEdit = Boolean(id)

  const [step, setStep] = useState(isEdit ? 2 : 1)
  const [sportType, setSportType] = useState('other')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sessions, setSessions] = useState([])
  const [saving, setSaving] = useState(false)
  const [openPickerFor, setOpenPickerFor] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isEdit) loadProgram()
  }, [id])

  async function loadProgram() {
    const { data: prog } = await supabase.from('programs').select('*').eq('id', id).single()
    if (!prog) return
    setName(prog.name)
    setDescription(prog.description ?? '')
    setSportType(prog.sport_type ?? 'other')
    const { data: sess } = await supabase
      .from('program_sessions')
      .select('*, session_exercises(*, exercise:exercises(*))')
      .eq('program_id', id)
      .order('week').order('day')
    setSessions((sess ?? []).map(s => ({
      ...s,
      exercises: (s.session_exercises ?? []).sort((a, b) => a.order - b.order)
    })))
  }

  const sessionKey = s => s.id ?? s._tempId

  function addSession() {
    const maxWeek = sessions.reduce((m, s) => Math.max(m, s.week), 0)
    setSessions(prev => [...prev, {
      _tempId: Date.now(),
      week: maxWeek + 1, day: 1,
      name: `Séance ${prev.length + 1}`,
      exercises: []
    }])
  }

  function updateSession(key, field, value) {
    setSessions(prev => prev.map(s => sessionKey(s) === key ? { ...s, [field]: value } : s))
  }

  function removeSession(key) {
    setSessions(prev => prev.filter(s => sessionKey(s) !== key))
  }

  function addExToSession(key, ex) {
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== key) return s
      return {
        ...s, exercises: [...s.exercises, {
          _tempId: Date.now() + Math.random(),
          exercise_id: ex.id, exercise: ex,
          sets: 3, reps: '10', rest_seconds: 60, notes: '', order: s.exercises.length
        }]
      }
    }))
    setOpenPickerFor(null)
    setSearch('')
  }

  function updateEx(sKey, exKey, field, value) {
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== sKey) return s
      return { ...s, exercises: s.exercises.map(e => (e.id ?? e._tempId) === exKey ? { ...e, [field]: value } : e) }
    }))
  }

  function removeEx(sKey, exKey) {
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== sKey) return s
      return { ...s, exercises: s.exercises.filter(e => (e.id ?? e._tempId) !== exKey) }
    }))
  }

  function handleDragEnd(event, sKey) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== sKey) return s
      const ids = s.exercises.map(e => e.id ?? e._tempId)
      const reordered = arrayMove(s.exercises, ids.indexOf(active.id), ids.indexOf(over.id))
        .map((e, i) => ({ ...e, order: i }))
      return { ...s, exercises: reordered }
    }))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    let programId = id

    if (!isEdit) {
      const { data } = await supabase.from('programs')
        .insert({ name, description, coach_id: profile.id, sport_type: sportType }).select().single()
      programId = data.id
    } else {
      await supabase.from('programs').update({ name, description, sport_type: sportType }).eq('id', id)
      await supabase.from('program_sessions').delete().eq('program_id', programId)
    }

    for (const session of sessions) {
      const { data: newSess } = await supabase.from('program_sessions')
        .insert({ program_id: programId, week: session.week, day: session.day, name: session.name })
        .select().single()

      if (session.exercises.length > 0) {
        await supabase.from('session_exercises').insert(
          session.exercises.map((e, i) => ({
            session_id: newSess.id,
            exercise_id: e.exercise_id,
            sets: e.sets, reps: e.reps,
            rest_seconds: e.rest_seconds, notes: e.notes, order: i
          }))
        )
      }
    }

    navigate('/coach/programs')
    setSaving(false)
  }

  const filteredLib = library.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
  const selectedType = SESSION_TYPES[sportType]

  // Step 1: category picker
  if (step === 1) {
    return (
      <div className="p-6 max-w-2xl">
        <button onClick={() => navigate('/coach/programs')}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-6 text-sm">
          ← Retour
        </button>
        <h1 className="text-2xl font-bold mb-2">Nouvelle séance</h1>
        <p className="text-gray-500 mb-6">Choisissez une catégorie</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TYPE_OPTIONS.map(([key, { label, color, bg, emoji }]) => (
            <button key={key}
              onClick={() => { setSportType(key); setStep(2) }}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: color, backgroundColor: bg }}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-sm font-semibold text-center leading-tight" style={{ color }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 2: form
  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        {!isEdit && (
          <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</button>
        )}
        <h1 className="text-2xl font-bold">{isEdit ? 'Éditer' : 'Nouvelle'} séance</h1>
        {selectedType && (
          <span className="ml-2 text-sm font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: selectedType.bg, color: selectedType.color }}>
            {selectedType.emoji} {selectedType.label}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-8">
        <input placeholder="Nom de la séance *" value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea placeholder="Description (optionnel)" rows={2} value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="space-y-5">
        {sessions.map(session => {
          const sKey = sessionKey(session)
          return (
            <div key={sKey} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <input value={session.name} onChange={e => updateSession(sKey, 'name', e.target.value)}
                  className="flex-1 font-semibold text-base border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none" />
                <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
                  <span>Sem.</span>
                  <input type="number" min={1} value={session.week}
                    onChange={e => updateSession(sKey, 'week', +e.target.value)}
                    className="w-12 border rounded px-1 py-0.5 text-center focus:outline-none" />
                  <span>Jour</span>
                  <input type="number" min={1} max={7} value={session.day}
                    onChange={e => updateSession(sKey, 'day', +e.target.value)}
                    className="w-12 border rounded px-1 py-0.5 text-center focus:outline-none" />
                </div>
                <button onClick={() => removeSession(sKey)}
                  className="text-red-400 hover:text-red-600 text-sm ml-1">✕</button>
              </div>

              <DndContext collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(e, sKey)}>
                <SortableContext
                  items={session.exercises.map(e => e.id ?? e._tempId)}
                  strategy={verticalListSortingStrategy}>
                  {session.exercises.map(ex => (
                    <SortableExercise
                      key={ex.id ?? ex._tempId}
                      id={ex.id ?? ex._tempId}
                      exercise={ex}
                      onUpdate={(f, v) => updateEx(sKey, ex.id ?? ex._tempId, f, v)}
                      onRemove={() => removeEx(sKey, ex.id ?? ex._tempId)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <div className="mt-3">
                {openPickerFor === sKey ? (
                  <div className="border rounded-lg p-3 bg-gray-50 mt-2">
                    <input placeholder="Rechercher un exercice..." value={search}
                      onChange={e => setSearch(e.target.value)} autoFocus
                      className="w-full border rounded px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    <div className="max-h-44 overflow-y-auto space-y-0.5">
                      {filteredLib.map(ex => (
                        <button key={ex.id} onClick={() => addExToSession(sKey, ex)}
                          className="w-full text-left text-sm px-3 py-2 rounded hover:bg-white hover:shadow-sm">
                          <span className="font-medium">{ex.name}</span>
                          {(ex.muscle_groups ?? []).length > 0 && (
                            <span className="text-gray-400 ml-2 text-xs">{ex.muscle_groups.join(', ')}</span>
                          )}
                        </button>
                      ))}
                      {filteredLib.length === 0 && <p className="text-gray-400 text-sm px-3 py-2">Aucun résultat.</p>}
                    </div>
                    <button onClick={() => setOpenPickerFor(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-2">Fermer</button>
                  </div>
                ) : (
                  <button onClick={() => { setOpenPickerFor(sKey); setSearch('') }}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                    + Ajouter un exercice
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={addSession}
        className="mt-4 w-full border border-dashed rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Ajouter une séance
      </button>

      <div className="flex gap-3 mt-8">
        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: '#39E229', color: '#000' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
        </button>
        <button onClick={() => navigate('/coach/programs')}
          className="border px-6 py-2.5 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  )
}
