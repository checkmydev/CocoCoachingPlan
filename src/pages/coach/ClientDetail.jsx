import { useState, useEffect } from 'react'
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
  const [selectedProgram, setSelectedProgram] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadClient()
    loadClientPrograms()
    loadLogs()
  }, [id])

  async function loadClient() {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setClient(data)
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
      .limit(50)
    setLogs(data ?? [])
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

  if (!client) return <div className="p-6 text-gray-400">Chargement...</div>

  const statusColors = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', done: 'bg-gray-100 text-gray-500' }
  const statusLabels = { active: 'Actif', paused: 'En pause', done: 'Terminé' }

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
                <select value={cp.status}
                  onChange={e => updateProgramStatus(cp.id, e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded-full border-0 ${statusColors[cp.status]}`}>
                  {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            {clientPrograms.length === 0 && <p className="text-sm text-gray-400 py-2">Aucun programme assigné.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Séances complétées (8 dernières semaines)</h2>
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
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Historique des séances</h2>
        {logs.length === 0 ? <p className="text-sm text-gray-400">Aucune séance enregistrée.</p> : (
          <div className="divide-y">
            {logs.map(log => (
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
