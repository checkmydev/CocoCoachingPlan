import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { SESSION_TYPES } from '../../lib/sessionTypes'

const MOOV_GREEN = '#39E229'

// ─── Zones d'intensité ────────────────────────────────────────────────────────
const ZONES = [
  { key: 'Z1', label: 'Z1 — Fondamental', shortLabel: 'Z1', color: '#60A5FA', pct: '<65% VMA', desc: 'Récupération active, footing très facile' },
  { key: 'Z2', label: 'Z2 — Endurance',   shortLabel: 'Z2', color: '#34D399', pct: '65–75%',   desc: 'Endurance de base, conversation possible' },
  { key: 'Z3', label: 'Z3 — Tempo',       shortLabel: 'Z3', color: '#FBBF24', pct: '75–85%',   desc: 'Seuil, essoufflement modéré' },
  { key: 'Z4', label: 'Z4 — VMA',         shortLabel: 'Z4', color: '#F87171', pct: '90–100%',  desc: 'Intensité élevée, fractionné classique' },
  { key: 'Z5', label: 'Z5 — Survitesse',  shortLabel: 'Z5', color: '#A78BFA', pct: '>100%',    desc: 'Sprint, effort maximal court' },
]

const TERRAIN = [
  { key: 'flat',   label: 'Plat',     emoji: '🛣️' },
  { key: 'hilly',  label: 'Vallonné', emoji: '⛰️' },
  { key: 'trail',  label: 'Trail',    emoji: '🌲' },
  { key: 'stairs', label: 'Escaliers',emoji: '🪜' },
  { key: 'track',  label: 'Piste',    emoji: '🏟️' },
]

const SWIM_EQUIPMENT = [
  { key: 'pull_buoy', label: 'Pull-buoy',  emoji: '🟠' },
  { key: 'fins',      label: 'Palmes',     emoji: '🦈' },
  { key: 'snorkel',   label: 'Tuba',       emoji: '🤿' },
  { key: 'kickboard', label: 'Planche',    emoji: '🏄' },
]

function vmaPace(vmaKmh, pct) {
  if (!vmaKmh || !pct) return null
  const speedKmh = vmaKmh * (pct / 100)
  const secPerKm = 3600 / speedKmh
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}'${String(sec).padStart(2, '0')}"/km`
}

// ─── Zone selector ────────────────────────────────────────────────────────────
function ZoneSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {ZONES.map(z => (
        <button key={z.key} type="button" onClick={() => onChange(z.key)}
          className="px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all"
          style={value === z.key
            ? { backgroundColor: z.color, borderColor: z.color, color: '#fff' }
            : { borderColor: '#e5e7eb', color: '#6b7280' }}>
          {z.shortLabel}
        </button>
      ))}
    </div>
  )
}

// ─── Running / Trail / Cycling builder ────────────────────────────────────────
function CardioBuilder({ type, vma, ftp, value, onChange }) {
  const isPower = type === 'cycling'
  const metric = isPower ? 'FTP' : 'VMA'
  const baseValue = isPower ? ftp : vma
  const unit = isPower ? 'W' : 'km/h'

  function newInterval() {
    return { id: Date.now(), reps: 1, distance_m: 400, duration_min: '', zone: 'Z4', vma_pct: 100, recovery_type: 'jog', recovery_min: 1.5, recovery_dist_m: '' }
  }

  function updatePart(part, key, val) {
    onChange({ ...value, [part]: { ...value[part], [key]: val } })
  }

  function addInterval() {
    const intervals = [...(value.main?.intervals ?? []), newInterval()]
    onChange({ ...value, main: { ...value.main, intervals } })
  }

  function updateInterval(id, key, val) {
    const intervals = (value.main?.intervals ?? []).map(i => i.id === id ? { ...i, [key]: val } : i)
    onChange({ ...value, main: { ...value.main, intervals } })
  }

  function removeInterval(id) {
    const intervals = (value.main?.intervals ?? []).filter(i => i.id !== id)
    onChange({ ...value, main: { ...value.main, intervals } })
  }

  const warmup = value.warmup ?? {}
  const main = value.main ?? { mode: 'intervals', intervals: [newInterval()] }
  const cooldown = value.cooldown ?? {}

  return (
    <div className="space-y-4">
      {/* Terrain (not for cycling) */}
      {type !== 'cycling' && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Terrain</label>
          <div className="flex gap-2 flex-wrap">
            {TERRAIN.map(t => (
              <button key={t.key} type="button"
                onClick={() => onChange({ ...value, terrain: t.key })}
                className="px-3 py-1.5 rounded-lg text-sm border-2 transition-all"
                style={value.terrain === t.key
                  ? { backgroundColor: MOOV_GREEN, borderColor: MOOV_GREEN, color: '#000', fontWeight: 700 }
                  : { borderColor: '#e5e7eb', color: '#374151' }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Échauffement */}
      <details open className="rounded-xl border overflow-hidden">
        <summary className="bg-blue-50 px-4 py-2.5 font-semibold text-sm cursor-pointer text-blue-800 list-none flex items-center justify-between">
          🔥 Échauffement
          <span className="text-xs text-blue-500">cliquer pour déplier</span>
        </summary>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Durée (min)</label>
            <input type="number" min={0} max={60} value={warmup.duration_min ?? ''} placeholder="10"
              onChange={e => updatePart('warmup', 'duration_min', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
            <ZoneSelector value={warmup.zone ?? 'Z1'} onChange={v => updatePart('warmup', 'zone', v)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input type="text" value={warmup.notes ?? ''} placeholder="Ex: Éducatifs, montées de genoux..."
              onChange={e => updatePart('warmup', 'notes', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
          </div>
        </div>
      </details>

      {/* Corps de séance */}
      <details open className="rounded-xl border overflow-hidden">
        <summary className="bg-red-50 px-4 py-2.5 font-semibold text-sm cursor-pointer text-red-800 list-none flex items-center justify-between">
          💪 Corps de séance
          <div className="flex gap-2" onClick={e => e.preventDefault()}>
            <button type="button"
              onClick={() => onChange({ ...value, main: { ...main, mode: 'continuous' } })}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={main.mode === 'continuous' ? { backgroundColor: '#ef4444', color: '#fff' } : { backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              Continu
            </button>
            <button type="button"
              onClick={() => onChange({ ...value, main: { ...main, mode: 'intervals', intervals: main.intervals?.length ? main.intervals : [newInterval()] } })}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={main.mode !== 'continuous' ? { backgroundColor: '#ef4444', color: '#fff' } : { backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              Intervalles
            </button>
          </div>
        </summary>

        <div className="p-4">
          {main.mode === 'continuous' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durée (min)</label>
                <input type="number" min={0} value={main.duration_min ?? ''} placeholder="30"
                  onChange={e => onChange({ ...value, main: { ...main, duration_min: e.target.value } })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Distance (km)</label>
                <input type="number" min={0} step={0.1} value={main.distance_km ?? ''} placeholder="8"
                  onChange={e => onChange({ ...value, main: { ...main, distance_km: e.target.value } })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-2">Zone d'intensité</label>
                <ZoneSelector value={main.zone ?? 'Z2'} onChange={v => onChange({ ...value, main: { ...main, zone: v } })} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(main.intervals ?? []).map((interval, idx) => (
                <div key={interval.id} className="rounded-xl border border-red-100 bg-red-50/30 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-700">Bloc {idx + 1}</span>
                    <button type="button" onClick={() => removeInterval(interval.id)}
                      className="text-xs text-gray-400 hover:text-red-500 px-1">✕</button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Répétitions</label>
                      <input type="number" min={1} max={50} value={interval.reps}
                        onChange={e => updateInterval(interval.id, 'reps', parseInt(e.target.value))}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Distance (m)</label>
                      <input type="number" min={0} step={50} value={interval.distance_m ?? ''}
                        placeholder="400"
                        onChange={e => updateInterval(interval.id, 'distance_m', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">OU Durée (sec)</label>
                      <input type="number" min={0} step={10} value={interval.duration_sec ?? ''}
                        placeholder="90"
                        onChange={e => updateInterval(interval.id, 'duration_sec', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-500">Zone / Intensité</label>
                      {!isPower && baseValue && interval.vma_pct && (
                        <span className="text-xs text-blue-600 font-medium">
                          ≈ {vmaPace(baseValue, interval.vma_pct)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <ZoneSelector value={interval.zone} onChange={v => updateInterval(interval.id, 'zone', v)} />
                      <div className="flex items-center gap-1 shrink-0">
                        <input type="number" min={50} max={130} value={interval.vma_pct ?? 100}
                          onChange={e => updateInterval(interval.id, 'vma_pct', parseInt(e.target.value))}
                          className="w-14 border rounded-lg px-2 py-1 text-xs text-center focus:outline-none" />
                        <span className="text-xs text-gray-400">% {metric}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Récupération</label>
                      <select value={interval.recovery_type}
                        onChange={e => updateInterval(interval.id, 'recovery_type', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                        <option value="rest">Repos</option>
                        <option value="jog">Trot</option>
                        <option value="walk">Marche</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Durée récup (min)</label>
                      <input type="number" min={0} step={0.5} value={interval.recovery_min ?? ''}
                        placeholder="1.5"
                        onChange={e => updateInterval(interval.id, 'recovery_min', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">OU Dist. récup (m)</label>
                      <input type="number" min={0} step={50} value={interval.recovery_dist_m ?? ''}
                        placeholder="200"
                        onChange={e => updateInterval(interval.id, 'recovery_dist_m', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addInterval}
                className="w-full py-2 rounded-xl border-2 border-dashed border-red-200 text-sm text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors">
                + Ajouter un bloc d'intervalles
              </button>
            </div>
          )}
        </div>
      </details>

      {/* Retour au calme */}
      <details open className="rounded-xl border overflow-hidden">
        <summary className="bg-green-50 px-4 py-2.5 font-semibold text-sm cursor-pointer text-green-800 list-none">
          🌿 Retour au calme
        </summary>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Durée (min)</label>
            <input type="number" min={0} max={60} value={cooldown.duration_min ?? ''} placeholder="10"
              onChange={e => updatePart('cooldown', 'duration_min', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
            <ZoneSelector value={cooldown.zone ?? 'Z1'} onChange={v => updatePart('cooldown', 'zone', v)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input type="text" value={cooldown.notes ?? ''} placeholder="Ex: Étirements, marche..."
              onChange={e => updatePart('cooldown', 'notes', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
          </div>
        </div>
      </details>
    </div>
  )
}

// ─── Swimming builder ─────────────────────────────────────────────────────────
function SwimBuilder({ value, onChange }) {
  const equipment = value.equipment ?? []

  function toggleEquip(key) {
    const updated = equipment.includes(key) ? equipment.filter(e => e !== key) : [...equipment, key]
    onChange({ ...value, equipment: updated })
  }

  return (
    <div className="space-y-4">
      {/* Equipment */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Matériel</label>
        <div className="flex gap-2 flex-wrap">
          {SWIM_EQUIPMENT.map(e => (
            <button key={e.key} type="button" onClick={() => toggleEquip(e.key)}
              className="px-3 py-2 rounded-xl border-2 text-sm transition-all"
              style={equipment.includes(e.key)
                ? { backgroundColor: '#3B82F6', borderColor: '#3B82F6', color: '#fff', fontWeight: 700 }
                : { borderColor: '#e5e7eb', color: '#374151' }}>
              {e.emoji} {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Same 3-part structure */}
      <CardioBuilder type="swimming" vma={null} ftp={null} value={value} onChange={onChange} />
    </div>
  )
}

// ─── Gym / Strength / Mobility builder ────────────────────────────────────────
function GymBuilder({ value, onChange, sportType }) {
  const [search, setSearch] = useState('')
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(false)
  const exercises = value.exercises ?? []

  useEffect(() => {
    const q = search.trim()
    if (q.length < 1) { setLibrary([]); return }
    setLoading(true)
    let query = supabase.from('exercises').select('id, name, muscle_groups, sport_type').ilike('name', `%${q}%`)
    if (sportType && sportType !== 'other') query = query.eq('sport_type', sportType)
    query.limit(8).then(({ data }) => { setLibrary(data ?? []); setLoading(false) })
  }, [search, sportType])

  function addExercise(ex) {
    if (exercises.find(e => e.exercise_id === ex.id)) return
    onChange({
      ...value,
      exercises: [...exercises, { exercise_id: ex.id, exercise_name: ex.name, sets: 3, reps: 10, weight_kg: '', rest_sec: 90, notes: '' }]
    })
    setSearch('')
    setLibrary([])
  }

  function updateExercise(id, key, val) {
    onChange({ ...value, exercises: exercises.map(e => e.exercise_id === id ? { ...e, [key]: val } : e) })
  }

  function removeExercise(id) {
    onChange({ ...value, exercises: exercises.filter(e => e.exercise_id !== id) })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chercher un exercice</label>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Squat, gainage, fentes..."
          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
        {library.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-10 overflow-hidden">
            {library.map(ex => (
              <button key={ex.id} type="button" onClick={() => addExercise(ex)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b last:border-b-0">
                <span className="font-medium">{ex.name}</span>
                {ex.muscle_groups?.length > 0 && <span className="text-xs text-gray-400 ml-2">{ex.muscle_groups.join(', ')}</span>}
              </button>
            ))}
          </div>
        )}
        {loading && <p className="text-xs text-gray-400 mt-1">Recherche...</p>}
      </div>

      {/* Exercise list */}
      {exercises.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          Cherchez et ajoutez des exercices depuis la bibliothèque
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((ex, idx) => (
            <div key={ex.exercise_id} className="rounded-xl border p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{idx + 1}. {ex.exercise_name}</span>
                <button type="button" onClick={() => removeExercise(ex.exercise_id)}
                  className="text-xs text-gray-400 hover:text-red-500">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Séries</label>
                  <input type="number" min={1} max={20} value={ex.sets}
                    onChange={e => updateExercise(ex.exercise_id, 'sets', parseInt(e.target.value))}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rép.</label>
                  <input type="number" min={1} max={100} value={ex.reps}
                    onChange={e => updateExercise(ex.exercise_id, 'reps', parseInt(e.target.value))}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Charge (kg)</label>
                  <input type="number" min={0} step={2.5} value={ex.weight_kg ?? ''}
                    placeholder="—"
                    onChange={e => updateExercise(ex.exercise_id, 'weight_kg', e.target.value)}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Repos (sec)</label>
                  <input type="number" min={0} step={30} value={ex.rest_sec}
                    onChange={e => updateExercise(ex.exercise_id, 'rest_sec', parseInt(e.target.value))}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
                </div>
              </div>
              <div className="mt-2">
                <input type="text" value={ex.notes ?? ''} placeholder="Notes (ex: tempo 3-1-1, focus genoux...)"
                  onChange={e => updateExercise(ex.exercise_id, 'notes', e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Session summary generator ────────────────────────────────────────────────
function buildDescription(type, data) {
  if (!data) return ''
  if (['running', 'trail', 'cycling'].includes(type)) {
    const parts = []
    if (data.warmup?.duration_min) parts.push(`Éch. ${data.warmup.duration_min}min (${data.warmup.zone ?? 'Z1'})`)
    if (data.main?.mode === 'continuous') {
      parts.push(`${data.main.duration_min ?? '?'}min en ${data.main.zone ?? 'Z2'}`)
    } else if (data.main?.intervals?.length) {
      const b = data.main.intervals[0]
      parts.push(`${b.reps ?? 1} × ${b.distance_m ? b.distance_m + 'm' : b.duration_sec + 's'} @ ${b.vma_pct ?? 100}% VMA`)
      if (data.main.intervals.length > 1) parts.push(`+${data.main.intervals.length - 1} bloc(s)`)
    }
    if (data.cooldown?.duration_min) parts.push(`RAC ${data.cooldown.duration_min}min`)
    if (data.terrain) parts.push(TERRAIN.find(t => t.key === data.terrain)?.label ?? '')
    return parts.filter(Boolean).join(' | ')
  }
  if (type === 'swimming') {
    const equip = (data.equipment ?? []).map(k => SWIM_EQUIPMENT.find(e => e.key === k)?.label).filter(Boolean)
    const base = buildDescription('running', data)
    return [base, equip.length ? `Matériel: ${equip.join(', ')}` : ''].filter(Boolean).join('\n')
  }
  if (['strength', 'mobility', 'other', 'home_trainer'].includes(type)) {
    const exs = data.exercises ?? []
    return exs.map(e => `${e.exercise_name}: ${e.sets}×${e.reps}${e.weight_kg ? ' @' + e.weight_kg + 'kg' : ''}`).join(', ')
  }
  return ''
}

function calcDuration(type, data) {
  if (!data) return 60
  let total = 0
  const w = parseInt(data.warmup?.duration_min ?? 0)
  const c = parseInt(data.cooldown?.duration_min ?? 0)
  total += w + c
  if (data.main?.mode === 'continuous') {
    total += parseInt(data.main.duration_min ?? 0)
  } else if (data.main?.intervals?.length) {
    data.main.intervals.forEach(i => {
      const work = i.duration_sec ? (parseInt(i.duration_sec) / 60) : (i.distance_m ? i.distance_m / (3.5 * 1000 / 60) : 5)
      const rec = parseFloat(i.recovery_min ?? 1.5)
      total += (parseInt(i.reps ?? 1)) * (work + rec)
    })
  }
  if (type === 'strength') {
    const exs = data.exercises ?? []
    exs.forEach(e => {
      const setTime = (parseInt(e.reps ?? 10) * 3) / 60
      const restTime = (parseInt(e.rest_sec ?? 90)) / 60
      total += (parseInt(e.sets ?? 3)) * (setTime + restTime)
    })
  }
  return Math.max(15, Math.round(total)) || 60
}

// ─── Predefined session picker ────────────────────────────────────────────────
const SPORT_TYPE_MAP = {
  running: 'running', trail: 'running',
  cycling: 'cycling', home_trainer: 'cycling',
  strength: 'strength', mobility: 'strength',
  swimming: 'swimming',
}

function PredefinedPicker({ sessionType, onSelect }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const sportType = SPORT_TYPE_MAP[sessionType] ?? null

  useEffect(() => {
    if (!sportType) { setLoading(false); return }
    supabase.from('exercises')
      .select('id, name, sport_type, session_params, description')
      .eq('sport_type', sportType)
      .order('name')
      .then(({ data }) => { setExercises(data ?? []); setLoading(false) })
  }, [sportType])

  function buildData(ex) {
    const p = ex.session_params
    if (sportType === 'running') {
      if (!p) return {}
      return {
        main: {
          mode: 'intervals',
          intervals: [{
            id: Date.now(),
            reps: p.reps ?? 1,
            distance_m: p.mode === 'dist' ? p.work : '',
            duration_sec: p.mode === 'time' ? p.work : '',
            zone: (p.zone ?? 'Z4').startsWith('Z') ? (p.zone ?? 'Z4').slice(0, 2) : 'Z4',
            vma_pct: p.pct ?? 100,
            recovery_type: 'jog',
            recovery_min: p.rest_mode === 'time' ? +(p.rest / 60).toFixed(1) : '',
            recovery_dist_m: p.rest_mode === 'dist' ? p.rest : '',
          }],
        },
        warmup: { duration_min: 10, zone: 'Z1', notes: 'Footing progressif' },
        cooldown: { duration_min: 10, zone: 'Z1', notes: 'Footing lent + étirements' },
      }
    }
    if (sportType === 'cycling') {
      if (!p) return {}
      const zMap = { 1: 'Z1', 2: 'Z1', 3: 'Z2', 4: 'Z3', 5: 'Z4', 6: 'Z5', 7: 'Z5' }
      return {
        main: {
          mode: 'intervals',
          intervals: [{
            id: Date.now(),
            reps: p.reps ?? 1,
            duration_sec: (p.duration_min ?? 15) * 60,
            distance_m: '',
            zone: zMap[p.zone ?? 4] ?? 'Z3',
            vma_pct: 100,
            recovery_type: 'rest',
            recovery_min: p.rest_min ?? 5,
            recovery_dist_m: '',
          }],
        },
        warmup: { duration_min: 10, zone: 'Z1', notes: 'Mise en route progressive' },
        cooldown: { duration_min: 10, zone: 'Z1', notes: 'Récupération active' },
      }
    }
    // strength / swimming / other
    const sets = p?.default_sets ?? []
    return {
      exercises: [{
        exercise_id: ex.id,
        exercise_name: ex.name,
        sets: sets.length || 3,
        reps: sets[0]?.reps ?? 10,
        weight_kg: sets[0]?.weight_kg ?? '',
        rest_sec: sets[0]?.rest_sec ?? 60,
        notes: ex.description ?? '',
      }],
    }
  }

  function descLine(ex) {
    const p = ex.session_params
    if (!p) return null
    if (sportType === 'running' && p.pct)
      return `${p.pct}% VMA · ${p.reps ?? 1}×${p.work}${p.mode === 'dist' ? 'm' : '"'}`
    if (sportType === 'cycling' && p.zone)
      return `Zone ${p.zone} · ${p.reps ?? 1}×${p.duration_min}min`
    if (p.default_sets?.length)
      return `${p.default_sets.length} série${p.default_sets.length > 1 ? 's' : ''} par défaut`
    return null
  }

  if (loading) return <p className="text-sm text-gray-400 py-3 text-center">Chargement...</p>

  if (!sportType || exercises.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 border border-dashed p-5 text-center text-sm text-gray-400">
        Aucune séance prédéfinie pour ce type.<br />
        <span className="text-xs">Créez-en depuis <strong>Exercices → Nouvel exercice</strong>.</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Bibliothèque — {exercises.length} séance{exercises.length > 1 ? 's' : ''}
      </div>
      <div className="divide-y max-h-56 overflow-y-auto">
        {exercises.map(ex => (
          <button key={ex.id} type="button"
            onClick={() => onSelect(buildData(ex), ex.name)}
            className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{ex.name}</p>
              {descLine(ex) && <p className="text-xs text-blue-600 mt-0.5">{descLine(ex)}</p>}
              {ex.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{ex.description}</p>}
            </div>
            <span className="text-green-500 text-xl shrink-0">+</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main SessionBuilder modal ────────────────────────────────────────────────
export default function SessionBuilder({ day, session, clientId, coachId, clientVma, clientFtp, onSave, onClose }) {
  const isEdit = Boolean(session)
  const [step, setStep] = useState(isEdit ? 3 : 1) // 1=type picker, 2=mode, 3=form
  const [predefinedOpen, setPredefinedOpen] = useState(false)
  const [sessionType, setSessionType] = useState(session?.session_type ?? null)
  const [title, setTitle] = useState(session?.title ?? '')
  const [sessionDate, setSessionDate] = useState(
    session?.session_date ?? format(day ?? new Date(), 'yyyy-MM-dd')
  )
  const [sessionData, setSessionData] = useState(() => {
    if (session?.session_data) return session.session_data
    if (session?.description) {
      try { return JSON.parse(session.description) } catch { return {} }
    }
    return {}
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [savedToLib, setSavedToLib] = useState(false)

  function selectType(key) {
    setSessionType(key)
    setStep(2) // → mode picker (new vs predefined)
    setPredefinedOpen(false)
    if (!title) setTitle(SESSION_TYPES[key]?.label ?? '')
  }

  async function handleSave() {
    if (!sessionType) return
    setSaving(true)
    const description = buildDescription(sessionType, sessionData)
    const duration_minutes = calcDuration(sessionType, sessionData)
    const sessionTitle = title || SESSION_TYPES[sessionType]?.label
    const payload = {
      session_date: sessionDate,
      session_type: sessionType,
      title: sessionTitle,
      description,
      duration_minutes,
      session_data: sessionData,
      client_id: clientId,
      coach_id: coachId,
      completed: false,
    }
    if (isEdit) {
      await supabase.from('planned_sessions').update(payload).eq('id', session.id)
    } else {
      await supabase.from('planned_sessions').insert(payload)
    }

    // Also save to programs library
    if (saveAsTemplate && !isEdit) {
      const { data: prog } = await supabase.from('programs')
        .insert({ name: sessionTitle, description, coach_id: coachId, sport_type: sessionType })
        .select().single()
      if (prog) {
        const { data: sess } = await supabase.from('program_sessions')
          .insert({ program_id: prog.id, week: 1, day: 1, name: sessionTitle })
          .select().single()
        // Save gym exercises if present
        const gymExercises = sessionData?.exercises ?? []
        if (sess && gymExercises.length > 0) {
          await supabase.from('session_exercises').insert(
            gymExercises.map((e, i) => ({
              session_id: sess.id,
              exercise_id: e.exercise_id,
              sets: e.sets ?? 3,
              reps: String(e.reps ?? 10),
              rest_seconds: e.rest_sec ?? 60,
              notes: e.notes ?? '',
              order: i,
            }))
          )
        }
        setSavedToLib(true)
      }
    }

    setSaving(false)
    onSave()
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('planned_sessions').delete().eq('id', session.id)
    setDeleting(false)
    onSave()
  }

  const type = sessionType ? SESSION_TYPES[sessionType] : null
  const isCardio = ['running', 'trail', 'cycling'].includes(sessionType)
  const isGym = ['strength', 'mobility', 'home_trainer', 'other'].includes(sessionType)
  const isSwim = sessionType === 'swimming'

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 bg-black/60 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          {step > 1 && !isEdit && (
            <button type="button" onClick={() => { setStep(s => s - 1); setPredefinedOpen(false) }}
              className="text-gray-400 hover:text-gray-700 text-lg">←</button>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {step === 1 ? 'Type de séance'
                : step === 2 ? `${type?.emoji} ${type?.label} — Choisir`
                : isEdit ? 'Modifier la séance'
                : `${type?.emoji} ${type?.label}`}
            </h3>
            <p className="text-xs text-gray-400">{format(new Date(sessionDate + 'T12:00:00'), 'EEEE d MMMM yyyy', { locale: undefined })}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Type picker */}
          {step === 1 && (
            <div>
              <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-300" />
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(SESSION_TYPES).map(([key, { label, color, bg, emoji }]) => (
                  <button key={key} type="button" onClick={() => selectType(key)}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all hover:scale-105 hover:shadow-md"
                    style={{ borderColor: color, backgroundColor: bg }}>
                    <span className="text-3xl">{emoji}</span>
                    <span className="text-xs font-semibold text-center leading-tight" style={{ color }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Mode picker — new vs predefined */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setStep(3)}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all">
                  <span className="text-3xl">✏️</span>
                  <span className="font-semibold text-sm">Nouvelle séance</span>
                  <span className="text-xs text-gray-500 text-center leading-snug">Créer depuis zéro avec les outils</span>
                </button>
                <button type="button" onClick={() => setPredefinedOpen(o => !o)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                    predefinedOpen ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                  <span className="text-3xl">📚</span>
                  <span className="font-semibold text-sm">Séance prédéfinie</span>
                  <span className="text-xs text-gray-500 text-center leading-snug">Depuis la bibliothèque d'exercices</span>
                </button>
              </div>

              {predefinedOpen && (
                <PredefinedPicker
                  sessionType={sessionType}
                  onSelect={(data, name) => {
                    setSessionData(data)
                    if (name) setTitle(name)
                    setPredefinedOpen(false)
                    setStep(3)
                  }}
                />
              )}
            </div>
          )}

          {/* Step 3: Builder */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Titre</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={type?.label}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
              </div>

              {/* VMA display if available */}
              {(isCardio || isSwim) && clientVma && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 text-sm flex items-center gap-2">
                  <span className="text-blue-500 font-bold">⚡ VMA client :</span>
                  <span className="font-bold text-blue-700">{clientVma} km/h</span>
                  <span className="text-blue-400 text-xs ml-auto">
                    Z2: {vmaPace(clientVma, 70)} · Z4: {vmaPace(clientVma, 95)}
                  </span>
                </div>
              )}
              {isCardio && clientFtp && (
                <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-2.5 text-sm">
                  <span className="font-bold text-purple-700">⚡ FTP : {clientFtp}W</span>
                </div>
              )}

              {/* Type-specific builder */}
              {isCardio && (
                <CardioBuilder type={sessionType} vma={clientVma} ftp={clientFtp}
                  value={sessionData} onChange={setSessionData} />
              )}
              {isSwim && (
                <SwimBuilder value={sessionData} onChange={setSessionData} />
              )}
              {isGym && (
                <GymBuilder value={sessionData} onChange={setSessionData} sportType={sessionType} />
              )}
              {sessionType === 'day_off' && (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 text-center">
                  😴 Journée de repos — aucune séance planifiée
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 3 && (
          <div className="border-t">
            {!isEdit && (
              <label className="flex items-center gap-2 px-5 py-2.5 border-b bg-gray-50 cursor-pointer hover:bg-green-50 transition-colors">
                <input type="checkbox" checked={saveAsTemplate} onChange={e => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 accent-green-500 rounded" />
                <span className="text-xs font-medium text-gray-600">
                  💾 Aussi sauvegarder comme modèle dans ma bibliothèque de séances
                </span>
              </label>
            )}
            <div className="flex gap-2 px-5 py-4">
              {isEdit && (
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50">
                  {deleting ? '...' : '🗑 Supprimer'}
                </button>
              )}
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50">
                Annuler
              </button>
              <button type="button" onClick={handleSave} disabled={saving || !sessionType}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-colors"
                style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
                {saving ? '...' : isEdit ? 'Enregistrer' : saveAsTemplate ? '+ Planifier & Sauvegarder' : '+ Planifier'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
