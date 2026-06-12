import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { usePrograms } from '../../hooks/usePrograms'
import { useAuth } from '../../contexts/AuthContext'
import { SESSION_TYPES } from '../../lib/sessionTypes'

const MOOV_GREEN = '#39E229'

export default function ClientDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { programs } = usePrograms()
  const [client, setClient] = useState(null)
  const [clientPrograms, setClientPrograms] = useState([])
  const [logs, setLogs] = useState([])
  const [checkins, setCheckins] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Planned sessions state
  const [plannedSessions, setPlannedSessions] = useState([])
  const [sessionForm, setSessionForm] = useState({
    session_date: '',
    session_type: 'running',
    title: '',
    description: '',
    duration_minutes: 60,
    objective: '',
  })
  const [savingSession, setSavingSession] = useState(false)
  const [sessionError, setSessionError] = useState(null)

  useEffect(() => {
    loadClient()
    loadClientPrograms()
    loadLogs()
    loadCheckins()
    loadPlannedSessions()
  }, [id])

  async function loadClient() {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setClient(data)
    setNotes(data?.coach_notes ?? '')
  }

  async function loadClientPrograms() {
    const { data } = await supabase
      .from('client_programs')
      .select('*, program:programs(*)')
      .eq('client_id', id)
      .order('start_date', { ascending: false })
    setClientPrograms(data ?? [])
  }

  async function loadLogs() {
    const { data } = await supabase
      .from('session_logs')
      .select('*, session:program_sessions(name, week, day)')
      .eq('client_id', id)
      .order('logged_at', { ascending: false })
      .limit(100)
    setLogs(data ?? [])
  }

  async function loadCheckins() {
    const { data } = await supabase
      .from('client_checkins')
      .select('*')
      .eq('client_id', id)
      .order('week_start', { ascending: false })
      .limit(8)
    setCheckins(data ?? [])
  }

  async function loadPlannedSessions() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('planned_sessions')
      .select('*')
      .eq('client_id', id)
      .gte('session_date', today)
      .order('session_date', { ascending: true })
    setPlannedSessions(data ?? [])
  }

  async function assignProgram(e) {
    e.preventDefault()
    if (!selectedProgram) return
    setAssigning(true)
    await supabase.from('client_programs').insert({
      client_id: id,
      program_id: selectedProgram,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active'
    })
    await loadClientPrograms()
    setSelectedProgram('')
    setAssigning(false)
  }

  async function updateProgramStatus(cpId, status) {
    await supabase.from('client_programs').update({ status }).eq('id', cpId)
    await loadClientPrograms()
  }

  async function saveNotes() {
    setSavingNotes(true)
    await supabase.from('profiles').update({ coach_notes: notes }).eq('id', id)
    setSavingNotes(false)
  }

  function handleSessionFormChange(e) {
    const { name, value } = e.target
    setSessionForm(prev => ({ ...prev, [name]: value }))
  }

  async function handlePlanSession(e) {
    e.preventDefault()
    setSessionError(null)
    if (!sessionForm.session_date) {
      setSessionError('La date de la séance est requise.')
      return
    }
    setSavingSession(true)
    const { error } = await supabase.from('planned_sessions').insert({
      client_id: id,
      coach_id: profile.id,
      session_date: sessionForm.session_date,
      session_type: sessionForm.session_type,
      title: sessionForm.title || null,
      description: sessionForm.description || null,
      duration_minutes: parseInt(sessionForm.duration_minutes, 10) || 60,
      objective: sessionForm.objective || null,
      completed: false,
    })
    setSavingSession(false)
    if (error) {
      setSessionError('Erreur lors de la création de la séance.')
    } else {
      setSessionForm({
        session_date: '',
        session_type: 'running',
        title: '',
        description: '',
        duration_minutes: 60,
        objective: '',
      })
      await loadPlannedSessions()
    }
  }

  async function deletePlannedSession(sessionId) {
    await supabase.from('planned_sessions').delete().eq('id', sessionId)
    await loadPlannedSessions()
  }

  const completionByWeek = logs
    .filter(l => l.completed)
    .reduce((acc, log) => {
      const week = format(new Date(log.logged_at), 'dd/MM')
      const existing = acc.find(d => d.date === week)
      if (existing) existing.séances++
      else acc.push({ date: week, séances: 1 })
      return acc
    }, [])
    .slice(-8)

  const personalRecords = useMemo(() => {
    const prs = {}
    logs.forEach(log => {
      ;(log.exercises_data ?? []).forEach(ex => {
        const w = parseFloat(ex.weight)
        if (!isNaN(w) && w > 0) {
          if (!prs[ex.exercise_name] || w > prs[ex.exercise_name].weight) {
            prs[ex.exercise_name] = { weight: w, date: log.logged_at }
          }
        }
      })
    })
    return Object.entries(prs).sort((a, b) => b[1].weight - a[1].weight)
  }, [logs])

  if (!client) return <div className="p-6 text-gray-400">Chargement...</div>

  const statusColors = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', done: 'bg-gray-100 text-gray-500' }
  const statusLabels = { active: 'Actif', paused: 'En pause', done: 'Terminé' }
  const emojiRecovery = { 1: '😴', 2: '😕', 3: '😐', 4: '😊', 5: '💪' }
  const emojiStress = { 1: '😌', 2: '🙂', 3: '😐', 4: '😟', 5: '😰' }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
          {(client.name ?? client.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <p className="text-gray-500">{client.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Programmes assignés</h2>
          <form onSubmit={assignProgram} className="flex gap-2 mb-4">
            <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Choisir un programme...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button type="submit" disabled={assigning || !selectedProgram}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700">
              Assigner
            </button>
          </form>
          <div className="divide-y">
            {clientPrograms.map(cp => (
              <div key={cp.id} className="flex items-center justify-between py-3">
                <span className="font-medium text-sm">{cp.program?.name}</span>
                <select value={cp.status} onChange={e => updateProgramStatus(cp.id, e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded-full border-0 ${statusColors[cp.status]}`}>
                  {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            {clientPrograms.length === 0 && <p className="text-sm text-gray-400 py-2">Aucun programme assigné.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-3">Notes coach</h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
            placeholder="Blessures, objectifs, restrictions alimentaires, historique médical..."
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <button onClick={saveNotes} disabled={savingNotes}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {savingNotes ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Planned sessions section */}
      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">Planifier une séance</h2>
        <form onSubmit={handlePlanSession} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" name="session_date" value={sessionForm.session_date} onChange={handleSessionFormChange} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': MOOV_GREEN }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type de séance</label>
              <select name="session_type" value={sessionForm.session_type} onChange={handleSessionFormChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2">
                {Object.entries(SESSION_TYPES).map(([key, { label, emoji }]) => (
                  <option key={key} value={key}>{emoji} {label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Titre</label>
              <input type="text" name="title" value={sessionForm.title} onChange={handleSessionFormChange}
                placeholder="Ex: Sortie longue, Fractionné..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Durée (minutes)</label>
              <input type="number" name="duration_minutes" value={sessionForm.duration_minutes} onChange={handleSessionFormChange}
                min={5} max={480}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Objectif</label>
            <input type="text" name="objective" value={sessionForm.objective} onChange={handleSessionFormChange}
              placeholder="Ex: Améliorer l'endurance de base, travailler la cadence..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description / Consignes</label>
            <textarea name="description" value={sessionForm.description} onChange={handleSessionFormChange} rows={3}
              placeholder="Instructions détaillées pour la séance..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none" />
          </div>
          {sessionError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sessionError}</p>
          )}
          <button type="submit" disabled={savingSession}
            className="w-full rounded-lg py-2.5 text-sm font-bold disabled:opacity-60 transition-colors"
            style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
            {savingSession ? 'Planification...' : '+ Planifier cette séance'}
          </button>
        </form>

        {plannedSessions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Séances à venir ({plannedSessions.length})</h3>
            <div className="divide-y">
              {plannedSessions.map(s => {
                const type = SESSION_TYPES[s.session_type] ?? SESSION_TYPES.other
                return (
                  <div key={s.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{type.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{s.title || type.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: type.bg, color: type.color }}>
                            {type.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(s.session_date + 'T12:00:00'), 'dd/MM/yyyy')}
                          </span>
                          <span className="text-xs text-gray-400">{s.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePlannedSession(s.id)}
                      className="shrink-0 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2 py-1 transition-colors">
                      Supprimer
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Séances complétées</h2>
          {completionByWeek.length === 0
            ? <p className="text-sm text-gray-400">Aucune séance enregistrée.</p>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={completionByWeek}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="séances" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Records personnels (PR)</h2>
          {personalRecords.length === 0
            ? <p className="text-sm text-gray-400">Aucune donnée de poids encore enregistrée.</p>
            : (
              <div className="divide-y max-h-44 overflow-y-auto">
                {personalRecords.map(([name, { weight, date }]) => (
                  <div key={name} className="flex items-center justify-between py-2">
                    <span className="text-sm truncate mr-2">{name}</span>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-blue-600">{weight} kg</span>
                      <p className="text-xs text-gray-400">{format(new Date(date), 'dd/MM/yy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {checkins.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-6">
          <h2 className="font-semibold mb-4">Check-ins récents</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b">
                  <th className="text-left pb-2 font-medium">Semaine</th>
                  <th className="text-center pb-2 font-medium">Récup.</th>
                  <th className="text-center pb-2 font-medium">Sommeil</th>
                  <th className="text-center pb-2 font-medium">Stress</th>
                  <th className="text-left pb-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {checkins.map(ci => (
                  <tr key={ci.id}>
                    <td className="py-2 text-gray-600">{format(new Date(ci.week_start + 'T12:00:00'), 'dd/MM/yyyy')}</td>
                    <td className="py-2 text-center text-lg">{emojiRecovery[ci.recovery] ?? '—'}</td>
                    <td className="py-2 text-center text-lg">{emojiRecovery[ci.sleep_quality] ?? '—'}</td>
                    <td className="py-2 text-center text-lg">{emojiStress[ci.stress] ?? '—'}</td>
                    <td className="py-2 text-gray-500 text-xs max-w-xs truncate">{ci.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Historique des séances</h2>
        {logs.length === 0 ? <p className="text-sm text-gray-400">Aucune séance enregistrée.</p> : (
          <div className="divide-y">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{log.session?.name}</p>
                  <p className="text-xs text-gray-400">Sem. {log.session?.week} / Jour {log.session?.day}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{format(new Date(log.logged_at), 'dd/MM/yyyy HH:mm')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${log.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {log.completed ? 'Complétée' : 'Partielle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
