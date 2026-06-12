import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { usePrograms } from '../../hooks/usePrograms'

export default function ClientDetail() {
  const { id } = useParams()
  const { programs } = usePrograms()
  const [client, setClient] = useState(null)
  const [clientPrograms, setClientPrograms] = useState([])
  const [logs, setLogs] = useState([])
  const [checkins, setCheckins] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    loadClient()
    loadClientPrograms()
    loadLogs()
    loadCheckins()
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
