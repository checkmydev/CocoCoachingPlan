import { useState, useEffect } from 'react'
import { format, startOfWeek } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const RECOVERY_SCALE = [
  { value: 1, emoji: '😴', label: 'Très faible' },
  { value: 2, emoji: '😕', label: 'Faible' },
  { value: 3, emoji: '😐', label: 'Moyen' },
  { value: 4, emoji: '😊', label: 'Bon' },
  { value: 5, emoji: '💪', label: 'Excellent' },
]

const STRESS_SCALE = [
  { value: 1, emoji: '😌', label: 'Aucun' },
  { value: 2, emoji: '🙂', label: 'Faible' },
  { value: 3, emoji: '😐', label: 'Modéré' },
  { value: 4, emoji: '😟', label: 'Élevé' },
  { value: 5, emoji: '😰', label: 'Très élevé' },
]

function EmojiPicker({ value, onChange, scale }) {
  return (
    <div className="flex gap-2">
      {scale.map(({ value: v, emoji, label }) => (
        <button key={v} type="button" onClick={() => onChange(v)} title={label}
          className={`flex-1 py-2.5 rounded-xl border text-2xl transition-all ${
            value === v ? 'border-blue-500 bg-blue-50 scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}>
          {emoji}
        </button>
      ))}
    </div>
  )
}

export default function CheckIn() {
  const { profile } = useAuth()
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0]

  const [form, setForm] = useState({ recovery: 3, sleep_quality: 3, stress: 3, notes: '' })
  const [existing, setExisting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!profile) return
    loadExisting()
    loadHistory()
  }, [profile])

  async function loadExisting() {
    const { data } = await supabase
      .from('client_checkins')
      .select('*')
      .eq('client_id', profile.id)
      .eq('week_start', weekStart)
      .maybeSingle()
    if (data) {
      setExisting(data)
      setForm({ recovery: data.recovery, sleep_quality: data.sleep_quality, stress: data.stress, notes: data.notes ?? '' })
    }
  }

  async function loadHistory() {
    const { data } = await supabase
      .from('client_checkins')
      .select('*')
      .eq('client_id', profile.id)
      .order('week_start', { ascending: false })
      .limit(5)
    setHistory(data ?? [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    if (existing) {
      await supabase.from('client_checkins').update(form).eq('id', existing.id)
    } else {
      const { data } = await supabase
        .from('client_checkins')
        .insert({ client_id: profile.id, week_start: weekStart, ...form })
        .select().single()
      setExisting(data)
    }
    setSaved(true)
    setSaving(false)
    loadHistory()
    setTimeout(() => setSaved(false), 3000)
  }

  const emojiRecovery = { 1: '😴', 2: '😕', 3: '😐', 4: '😊', 5: '💪' }
  const emojiStress = { 1: '😌', 2: '🙂', 3: '😐', 4: '😟', 5: '😰' }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Check-in de la semaine</h1>
      <p className="text-gray-500 text-sm mb-6">
        Semaine du {format(new Date(weekStart + 'T12:00:00'), 'dd/MM/yyyy')}
        {existing && <span className="ml-2 text-green-600 font-medium">✓ Déjà soumis</span>}
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-5 mb-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Récupération physique</label>
          <EmojiPicker value={form.recovery} onChange={v => setForm(f => ({ ...f, recovery: v }))} scale={RECOVERY_SCALE} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Qualité du sommeil</label>
          <EmojiPicker value={form.sleep_quality} onChange={v => setForm(f => ({ ...f, sleep_quality: v }))} scale={RECOVERY_SCALE} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Niveau de stress</label>
          <EmojiPicker value={form.stress} onChange={v => setForm(f => ({ ...f, stress: v }))} scale={STRESS_SCALE} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Notes libres</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
            placeholder="Comment s'est passée cette semaine ? Douleurs, fatigue, motivation..."
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={saving}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
            saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50`}>
          {saving ? 'Envoi...' : saved ? '✓ Enregistré !' : existing ? 'Mettre à jour' : 'Envoyer le check-in'}
        </button>
      </form>

      {history.length > 1 && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Historique</h2>
          <div className="divide-y">
            {history.map(ci => (
              <div key={ci.id} className="py-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">Sem. {format(new Date(ci.week_start + 'T12:00:00'), 'dd/MM')}</p>
                <div className="flex gap-3 text-xl">
                  <span title="Récupération">{emojiRecovery[ci.recovery]}</span>
                  <span title="Sommeil">{emojiRecovery[ci.sleep_quality]}</span>
                  <span title="Stress">{emojiStress[ci.stress]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
