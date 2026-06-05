import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ programs: 0, exercises: 0, clients: 0 })
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    if (!profile) return
    loadStats()
  }, [profile])

  async function loadStats() {
    const [progRes, exRes, programIds] = await Promise.all([
      supabase.from('programs').select('id', { count: 'exact', head: true }).eq('coach_id', profile.id),
      supabase.from('exercises').select('id', { count: 'exact', head: true }).eq('created_by', profile.id),
      supabase.from('programs').select('id').eq('coach_id', profile.id),
    ])

    const ids = (programIds.data ?? []).map(p => p.id)
    if (ids.length === 0) {
      setStats({ programs: progRes.count ?? 0, exercises: exRes.count ?? 0, clients: 0 })
      return
    }

    const sessionIds = (await supabase.from('program_sessions').select('id').in('program_id', ids)).data?.map(s => s.id) ?? []

    const [cpRes, logsRes] = await Promise.all([
      supabase.from('client_programs').select('client_id').in('program_id', ids),
      sessionIds.length
        ? supabase.from('session_logs')
            .select('*, profiles!client_id(name), session:program_sessions(name, week, day)')
            .in('program_session_id', sessionIds)
            .order('logged_at', { ascending: false })
            .limit(5)
        : { data: [] }
    ])

    setStats({
      programs: progRes.count ?? 0,
      exercises: exRes.count ?? 0,
      clients: new Set((cpRes.data ?? []).map(c => c.client_id)).size,
    })
    setRecentLogs(logsRes.data ?? [])
  }

  const statCards = [
    { label: 'Programmes', value: stats.programs, to: '/coach/programs', color: 'text-blue-600' },
    { label: 'Exercices', value: stats.exercises, to: '/coach/exercises', color: 'text-green-600' },
    { label: 'Clients', value: stats.clients, to: '/coach/clients', color: 'text-purple-600' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, to, color }) => (
          <Link key={label} to={to}
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Activité récente</h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune activité récente.</p>
        ) : (
          <div className="divide-y">
            {recentLogs.map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{log.profiles?.name}</p>
                  <p className="text-xs text-gray-400">{log.session?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{format(new Date(log.logged_at), 'dd/MM HH:mm')}</p>
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
