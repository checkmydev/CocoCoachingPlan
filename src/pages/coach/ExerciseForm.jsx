import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useExercises } from '../../hooks/useExercises'
import VideoPlayer from '../../components/VideoPlayer'
import { detectVideoType } from '../../lib/videoUtils'
import {
  VMA_TEMPLATES, calcVmaTemplate, calcPMAZones,
  speedToPaceKm, speedToPace100m
} from '../../lib/trainingCalculator'

const MUSCLE_GROUPS = ['Dos', 'Pectoraux', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Abdominaux', 'Full body']
const EQUIPMENT = ['Haltères', 'Barre', 'Machine', 'Câble', 'Poids du corps', 'Bandes élastiques', 'Kettlebell']

const SPORT_TYPES = [
  { id: 'strength', label: 'Musculation',   icon: '🏋️' },
  { id: 'running',  label: 'Course à pied', icon: '🏃' },
  { id: 'cycling',  label: 'Cyclisme',      icon: '🚴' },
  { id: 'swimming', label: 'Natation',      icon: '🏊' },
  { id: 'other',    label: 'Autre',         icon: '💪' },
]

const ZONES = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']
const ZONE_COLORS = { Z1: '#60A5FA', Z2: '#34D399', Z3: '#FBBF24', Z4: '#F87171', Z5: '#A78BFA' }
const MOOV_GREEN = '#39E229'
const VMA_CATS = ['Fractionné court', 'Fractionné long', 'Séances au seuil']

const EMPTY = {
  sport_type: 'strength',
  name: '', description: '', instructions: '',
  muscle_groups: [], equipment: [],
  video_url: '', thumbnail_url: '',
  session_params: null,
}

// ─── Running form ─────────────────────────────────────────────────────────────
function RunningForm({ params, onChange, vmaRef }) {
  const [activeCat, setActiveCat] = useState('Fractionné court')

  const filtered = VMA_TEMPLATES.filter(t => t.cat === activeCat)
  const calculated = filtered.map(t => calcVmaTemplate(t, vmaRef))

  const p = params ?? { pct: 100, mode: 'dist', work: 400, rest_mode: 'time', rest: 90, reps: 10, zone: 'Z5', note: '' }

  function applyTemplate(tpl) {
    onChange({ pct: tpl.pct, mode: tpl.mode, work: tpl.work, rest_mode: tpl.rest_mode, rest: tpl.rest, reps: tpl.reps, zone: tpl.zone, note: tpl.note ?? '' })
  }

  function set(key, val) { onChange({ ...p, [key]: val }) }

  const vma = parseFloat(vmaRef) || 0
  const previewSpeed = vma > 0 ? vma * p.pct / 100 : null
  const previewPaceKm = previewSpeed ? speedToPaceKm(previewSpeed) : '—'
  const previewPace100m = previewSpeed ? speedToPace100m(previewSpeed) : '—'

  return (
    <div className="space-y-5">
      {/* Category tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {VMA_CATS.map(cat => (
          <button key={cat} type="button" onClick={() => setActiveCat(cat)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
              activeCat === cat ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Template table — inspired by the Excel fractionné spreadsheet */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-xs min-w-[500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Séance</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">% VMA</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Vitesse</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Allure /km</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Travail</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Qté</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Récup</th>
            </tr>
          </thead>
          <tbody>
            {calculated.map(tpl => {
              const isSelected = p.pct === tpl.pct && p.mode === tpl.mode && String(p.work) === String(tpl.work)
              return (
                <tr key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className={`border-t cursor-pointer transition-colors ${
                    isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}>
                  <td className="px-3 py-2.5 font-medium text-gray-800">
                    {isSelected && <span className="text-green-600 mr-1 font-bold">✓</span>}
                    {tpl.name}
                    {tpl.note && <span className="text-gray-400 ml-1">({tpl.note})</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-blue-700">{tpl.pct}%</td>
                  <td className="px-3 py-2.5 text-center font-mono text-gray-600">
                    {tpl.speed_kmh ? `${tpl.speed_kmh}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-orange-600">{tpl.pace_km}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-gray-700">{tpl.work_display}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{tpl.reps}×</td>
                  <td className="px-3 py-2.5 text-center font-mono text-gray-500">{tpl.rest_display}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!vmaRef && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          Entrez une VMA de référence pour visualiser les vitesses et allures calculées
        </p>
      )}

      {/* Custom parameters */}
      <div className="rounded-xl border bg-gray-50 p-4 space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paramètres de l'exercice</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">% VMA</label>
            <div className="relative">
              <input type="number" min={50} max={130} value={p.pct}
                onChange={e => set('pct', parseInt(e.target.value) || 100)}
                className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 pr-20" />
              {previewSpeed && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-mono pointer-events-none">
                  {previewSpeed.toFixed(1)} km/h
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Allure preview</label>
            <div className="border rounded-lg px-3 py-2 text-sm bg-white font-mono text-orange-600 h-[38px] flex items-center">
              {previewSpeed
                ? `${previewPaceKm}/km · ${previewPace100m}/100m`
                : <span className="text-gray-300">Entrez VMA ci-dessus</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type travail</label>
            <select value={p.mode} onChange={e => set('mode', e.target.value)}
              className="w-full border bg-white rounded-lg px-2 py-2 text-sm focus:outline-none">
              <option value="dist">Distance (m)</option>
              <option value="time">Durée (sec)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {p.mode === 'dist' ? 'Distance (m)' : 'Durée (sec)'}
            </label>
            <input type="number" min={10} step={p.mode === 'dist' ? 50 : 10} value={p.work}
              onChange={e => set('work', parseInt(e.target.value) || 0)}
              className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Répétitions</label>
            <input type="number" min={1} max={50} value={p.reps}
              onChange={e => set('reps', parseInt(e.target.value) || 1)}
              className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type récup</label>
            <select value={p.rest_mode} onChange={e => set('rest_mode', e.target.value)}
              className="w-full border bg-white rounded-lg px-2 py-2 text-sm focus:outline-none">
              <option value="time">Temps (sec)</option>
              <option value="dist">Distance (m)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {p.rest_mode === 'time' ? 'Récup (sec)' : 'Récup (m)'}
            </label>
            <input type="number" min={0} step={p.rest_mode === 'time' ? 30 : 50} value={p.rest}
              onChange={e => set('rest', parseInt(e.target.value) || 0)}
              className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
            <div className="flex gap-1">
              {ZONES.map(z => (
                <button key={z} type="button" onClick={() => set('zone', z)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all"
                  style={p.zone === z
                    ? { backgroundColor: ZONE_COLORS[z], borderColor: ZONE_COLORS[z], color: '#fff' }
                    : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Note (optionnel)</label>
          <input type="text" value={p.note ?? ''} placeholder="Ex: Piste 400m, départ lancé, côte..."
            onChange={e => set('note', e.target.value)}
            className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
        </div>
      </div>
    </div>
  )
}

// ─── Cycling form ─────────────────────────────────────────────────────────────
function CyclingForm({ params, onChange, pmaRef }) {
  const zones = calcPMAZones(pmaRef || 0)
  const p = params ?? { zone: 4, duration_min: 15, reps: 1, rest_min: 5, note: '' }

  function set(key, val) { onChange({ ...p, [key]: val }) }

  const selectedZone = zones.find(z => z.zone === p.zone)

  return (
    <div className="space-y-5">
      {/* Zone table — inspired by the PMA cyclisme Excel */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-xs min-w-[460px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold w-10">Z</th>
              <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Niveau</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">% PMA</th>
              {pmaRef > 0 && <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Watts</th>}
              <th className="px-3 py-2.5 text-center text-gray-500 font-semibold">Durée type</th>
              <th className="px-3 py-2.5 text-left text-gray-500 font-semibold hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => {
              const isSelected = p.zone === z.zone
              const textColor = z.textDark === false ? '#fff' : '#1f2937'
              const subColor = z.textDark === false ? 'rgba(255,255,255,0.7)' : '#6b7280'
              return (
                <tr key={z.zone}
                  onClick={() => set('zone', z.zone)}
                  className="border-t cursor-pointer transition-all"
                  style={{
                    backgroundColor: isSelected ? z.color : z.color + 'aa',
                    outline: isSelected ? `2px solid ${MOOV_GREEN}` : 'none',
                    outlineOffset: '-2px',
                  }}>
                  <td className="px-3 py-3 text-center font-extrabold" style={{ color: textColor }}>
                    {isSelected ? '✓' : z.zone}
                  </td>
                  <td className="px-3 py-3 font-semibold" style={{ color: textColor }}>{z.label}</td>
                  <td className="px-3 py-3 text-center font-mono" style={{ color: textColor }}>
                    {z.pct_min}–{z.pct_max}%
                  </td>
                  {pmaRef > 0 && (
                    <td className="px-3 py-3 text-center font-mono font-bold" style={{ color: textColor }}>
                      {z.watts_min}–{z.watts_max}W
                    </td>
                  )}
                  <td className="px-3 py-3 text-center font-medium" style={{ color: subColor }}>{z.time}</td>
                  <td className="px-3 py-3 hidden sm:table-cell" style={{ color: subColor }}>{z.desc}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!pmaRef && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          Entrez une FTP/PMA de référence pour voir les watts par zone
        </p>
      )}

      {/* Zone parameters */}
      {selectedZone && (
        <div className="rounded-xl border p-4 space-y-3"
          style={{ backgroundColor: selectedZone.color + '22', borderColor: selectedZone.color + '88' }}>
          <div className="flex items-center gap-3">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Zone {selectedZone.zone} — {selectedZone.label}
            </h4>
            {pmaRef > 0 && (
              <span className="text-xs font-mono font-bold text-orange-600">
                {selectedZone.watts_min}–{selectedZone.watts_max}W
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Durée (min)</label>
              <input type="number" min={1} value={p.duration_min}
                onChange={e => set('duration_min', parseInt(e.target.value) || 1)}
                className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Répétitions</label>
              <input type="number" min={1} value={p.reps}
                onChange={e => set('reps', parseInt(e.target.value) || 1)}
                className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Récup (min)</label>
              <input type="number" min={0} step={0.5} value={p.rest_min}
                onChange={e => set('rest_min', parseFloat(e.target.value) || 0)}
                className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
            <input type="text" value={p.note ?? ''} placeholder="Ex: Assis / danseuse, home trainer, col..."
              onChange={e => set('note', e.target.value)}
              className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Strength default sets table ───────────────────────────────────────────────
function StrengthSetsTable({ params, onChange }) {
  const defaultSets = params?.default_sets ?? []

  function addSet() {
    onChange({ ...(params ?? {}), default_sets: [...defaultSets, { reps: 10, weight_kg: '', rest_sec: 60 }] })
  }

  function updateSet(idx, key, val) {
    onChange({ ...(params ?? {}), default_sets: defaultSets.map((s, i) => i === idx ? { ...s, [key]: val } : s) })
  }

  function removeSet(idx) {
    onChange({ ...(params ?? {}), default_sets: defaultSets.filter((_, i) => i !== idx) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Séries par défaut</label>
        <button type="button" onClick={addSet} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          + Ajouter une série
        </button>
      </div>

      {defaultSets.length === 0 ? (
        <div onClick={addSet}
          className="rounded-xl border-2 border-dashed border-gray-200 p-3 text-center text-sm text-gray-400 cursor-pointer hover:border-gray-300 transition-colors">
          Optionnel — cliquez pour définir les séries par défaut
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-center text-xs text-gray-500 font-semibold w-10">#</th>
                <th className="px-3 py-2 text-center text-xs text-gray-500 font-semibold">Répétitions</th>
                <th className="px-3 py-2 text-center text-xs text-gray-500 font-semibold">Charge (kg)</th>
                <th className="px-3 py-2 text-center text-xs text-gray-500 font-semibold">Repos (sec)</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {defaultSets.map((s, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2 text-center text-gray-400 font-bold">{idx + 1}</td>
                  <td className="px-2 py-1.5">
                    <input type="number" min={1} max={100} value={s.reps}
                      onChange={e => updateSet(idx, 'reps', parseInt(e.target.value) || 1)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-300" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min={0} step={2.5} value={s.weight_kg} placeholder="—"
                      onChange={e => updateSet(idx, 'weight_kg', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-300" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min={0} step={15} value={s.rest_sec}
                      onChange={e => updateSet(idx, 'rest_sec', parseInt(e.target.value) || 0)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-300" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeSet(idx)}
                      className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main ExerciseForm ─────────────────────────────────────────────────────────
export default function ExerciseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { exercises, createExercise, updateExercise } = useExercises()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [videoMode, setVideoMode] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [vmaRef, setVmaRef] = useState('')
  const [pmaRef, setPmaRef] = useState('')

  useEffect(() => {
    if (isEdit) {
      const ex = exercises.find(e => e.id === id)
      if (ex) setForm({
        sport_type: ex.sport_type ?? 'strength',
        name: ex.name ?? '',
        description: ex.description ?? '',
        instructions: ex.instructions ?? '',
        muscle_groups: ex.muscle_groups ?? [],
        equipment: ex.equipment ?? [],
        video_url: ex.video_url ?? '',
        thumbnail_url: ex.thumbnail_url ?? '',
        session_params: ex.session_params ?? null,
      })
    }
  }, [id, exercises])

  function toggle(field, value) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value]
    }))
  }

  async function handleVideoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `videos/${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const { data, error: uploadError } = await supabase.storage.from('exercises').upload(path, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('exercises').getPublicUrl(data.path)
      setForm(f => ({ ...f, video_url: publicUrl }))
    } else {
      setError(`Upload échoué: ${uploadError.message}`)
    }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...form, video_type: detectVideoType(form.video_url) }
    const { error: saveError } = isEdit
      ? await updateExercise(id, payload)
      : await createExercise(payload)
    if (saveError) { setError(saveError.message); setSaving(false); return }
    navigate('/coach/exercises')
  }

  const st = form.sport_type
  const isStrengthLike = st === 'strength' || st === 'swimming' || st === 'other'

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate('/coach/exercises')}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none">←</button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Modifier' : 'Nouvel'} exercice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* Sport type selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de sport</label>
          <div className="flex gap-2 flex-wrap">
            {SPORT_TYPES.map(s => (
              <button key={s.id} type="button"
                onClick={() => setForm(f => ({ ...f, sport_type: s.id, session_params: null }))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  st === s.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={
              st === 'running' ? 'Ex: Fractionné 400m VMA, Séance au seuil 2000m...' :
              st === 'cycling' ? 'Ex: Zone 4 FTP, Intervalles PMA 5min...' :
              'Ex: Squat barre, Gainage planche...'
            }
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        {/* VMA reference for running */}
        {st === 'running' && (
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-blue-700 whitespace-nowrap">VMA référence</span>
            <input type="number" min={5} max={30} step={0.1} value={vmaRef}
              onChange={e => setVmaRef(e.target.value)}
              placeholder="15.5"
              className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <span className="text-sm text-blue-500">km/h — pour prévisualiser les allures</span>
          </div>
        )}

        {/* FTP/PMA reference for cycling */}
        {st === 'cycling' && (
          <div className="flex items-center gap-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-purple-700 whitespace-nowrap">FTP / PMA référence</span>
            <input type="number" min={50} max={600} step={5} value={pmaRef}
              onChange={e => setPmaRef(e.target.value)}
              placeholder="300"
              className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <span className="text-sm text-purple-500">Watts — pour calculer les zones</span>
          </div>
        )}

        {/* Running form */}
        {st === 'running' && (
          <RunningForm
            params={form.session_params}
            onChange={p => setForm(f => ({ ...f, session_params: p }))}
            vmaRef={parseFloat(vmaRef) || 0}
          />
        )}

        {/* Cycling form */}
        {st === 'cycling' && (
          <CyclingForm
            params={form.session_params}
            onChange={p => setForm(f => ({ ...f, session_params: p }))}
            pmaRef={parseFloat(pmaRef) || 0}
          />
        )}

        {/* Strength / Swimming / Other */}
        {isStrengthLike && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={2} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instructions</label>
              <textarea rows={3} value={form.instructions}
                onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            {st === 'strength' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Groupes musculaires</label>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map(m => (
                      <button type="button" key={m} onClick={() => toggle('muscle_groups', m)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          form.muscle_groups.includes(m)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Équipement</label>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map(eq => (
                      <button type="button" key={eq} onClick={() => toggle('equipment', eq)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          form.equipment.includes(eq)
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-300 hover:border-green-400'
                        }`}>{eq}</button>
                    ))}
                  </div>
                </div>

                <StrengthSetsTable
                  params={form.session_params}
                  onChange={p => setForm(f => ({ ...f, session_params: p }))}
                />
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Vidéo</label>
              <div className="flex gap-2 mb-3">
                {['url', 'upload'].map(mode => (
                  <button type="button" key={mode} onClick={() => setVideoMode(mode)}
                    className={`px-3 py-1 rounded-lg text-sm ${videoMode === mode ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
                    {mode === 'url' ? 'Lien URL' : 'Upload fichier'}
                  </button>
                ))}
              </div>
              {videoMode === 'url' ? (
                <input placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                  value={form.video_url}
                  onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <div>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="text-sm" />
                  {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
                </div>
              )}
              {form.video_url && <div className="mt-3"><VideoPlayer url={form.video_url} /></div>}
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="font-bold px-6 py-2.5 rounded-lg disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => navigate('/coach/exercises')}
            className="border px-6 py-2.5 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
