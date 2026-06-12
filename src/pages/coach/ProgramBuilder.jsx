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
  const [exercises, setExercises] = useState([])
  const [saving, setSaving] = useState(false)
  const [openPicker, setOpenPicker] = useState(false)
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
    const allExercises = (sess ?? []).flatMap(s =>
      (s.session_exercises ?? []).sort((a, b) => a.order - b.order)
    )
    setExercises(allExercises)
  }

  const exKey = e => e.id ?? e._tempId

  function addExercise(ex) {
    if (exercises.find(e => e.exercise_id === ex.id)) return
    setExercises(prev => [...prev, {
      _tempId: Date.now() + Math.random(),
      exercise_id: ex.id, exercise: ex,
      sets: 3, reps: '10', rest_seconds: 60, notes: '', order: prev.length
    }])
    setOpenPicker(false)
    setSearch('')
  }

  function updateEx(key, field, value) {
    setExercises(prev => prev.map(e => exKey(e) === key ? { ...e, [field]: value } : e))
  }

  function removeEx(key) {
    setExercises(prev => prev.filter(e => exKey(e) !== key))
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = exercises.map(exKey)
    const reordered = arrayMove(exercises, ids.indexOf(active.id), ids.indexOf(over.id))
      .map((e, i) => ({ ...e, order: i }))
    setExercises(reordered)
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

    const { data: sess } = await supabase.from('program_sessions')
      .insert({ program_id: programId, week: 1, day: 1, name })
      .select().single()

    if (exercises.length > 0 && sess) {
      await supabase.from('session_exercises').insert(
        exercises.map((e, i) => ({
          session_id: sess.id,
          exercise_id: e.exercise_id,
          sets: e.sets, reps: e.reps,
          rest_seconds: e.rest_seconds, notes: e.notes, order: i
        }))
      )
    }

    navigate('/coach/programs')
    setSaving(false)
  }

  const filteredLib = library.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase())
    const matchSport = !sportType || sportType === 'other' || (e.sport_type ?? 'strength') === sportType
    return matchName && matchSport
  })

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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        {!isEdit && (
          <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</button>
        )}
        <h1 className="text-2xl font-bold">{isEdit ? 'Éditer' : 'Nouvelle'} séance</h1>
        {selectedType && (
          <span className="text-sm font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: selectedType.bg, color: selectedType.color }}>
            {selectedType.emoji} {selectedType.label}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <input placeholder="Nom de la séance *" value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-400" />
        <textarea placeholder="Description (optionnel)" rows={2} value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      {/* Exercise list */}
      <div className="space-y-3 mb-4">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={exercises.map(exKey)} strategy={verticalListSortingStrategy}>
            {exercises.map(ex => (
              <SortableExercise
                key={exKey(ex)}
                id={exKey(ex)}
                exercise={ex}
                onUpdate={(f, v) => updateEx(exKey(ex), f, v)}
                onRemove={() => removeEx(exKey(ex))}
              />
            ))}
          </SortableContext>
        </DndContext>

        {exercises.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Aucun exercice — cliquez sur "+ Ajouter un exercice" ci-dessous
          </div>
        )}
      </div>

      {/* Exercise picker */}
      {openPicker ? (
        <div className="border rounded-xl p-3 bg-gray-50 mb-4">
          <input placeholder="Rechercher un exercice..." value={search}
            onChange={e => setSearch(e.target.value)} autoFocus
            className="w-full border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-green-400" />
          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {filteredLib.map(ex => (
              <button key={ex.id} onClick={() => addExercise(ex)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="font-medium">{ex.name}</span>
                {(ex.muscle_groups ?? []).length > 0 && (
                  <span className="text-gray-400 ml-2 text-xs">{ex.muscle_groups.join(', ')}</span>
                )}
              </button>
            ))}
            {filteredLib.length === 0 && (
              <p className="text-gray-400 text-sm px-3 py-2">Aucun exercice trouvé pour cette catégorie.</p>
            )}
          </div>
          <button onClick={() => setOpenPicker(false)}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2">Fermer</button>
        </div>
      ) : (
        <button onClick={() => { setOpenPicker(true); setSearch('') }}
          className="w-full border border-dashed rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors mb-6">
          + Ajouter un exercice
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="font-bold px-6 py-2.5 rounded-lg disabled:opacity-50"
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
