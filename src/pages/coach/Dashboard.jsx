import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, subDays, startOfWeek } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ programs: 0, exercises: 0, clients: 0, sessionsThisWeek: 0 })
  const [recentLogs, setRecentLogs] = useState([])
  const [inactiveClients, setInactiveClients] = useState([])

  useEffect(() => {
    if (!profile) return
    loadStats()
  }, [profile])

  async function loadStats() {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()

    const [progRes, exRes, myProgsRes] = await Promise.all([
      supabase.from('programs').select('id', { count: 'exact', head: true }).eq('coach_id', profile.id),
      supabase.from('exercises').select('id', { count: 'exact', head: true }),
      supabase.from('programs').select('id').eq('coach_id', profile.id),
    ])

    const progIds = (myProgsRes.data ?? []).map(p => p.id)
    if (progIds.length === 0) {
      setStats({ programs: progRes.count ?? 0, exercises: exRes.count ?? 0, clients: 0, sessionsThisWeek: 0 })
      return
    }

    const sessionIds = (await supabase.from('program_sessions').select('id').in('program_id', progIds)).data?.map(s => s.id) ?? []
    const cpRes = await supabase.from('client_programs').select('client_id').in('program_id', progIds)
    const uniqueClients = [...new Set((cpRes.data ?? []).map(c => c.client_id))]

    if (sessionIds.length === 0) {
      setStats({ programs: progRes.count ?? 0, exercises: exRes.count ?? 0, clients: uniqueClients.length, sessionsThisWeek: 0 })
      return
    }

    const [logsRes, weekCountRes, allLogsRes] = await Promise.all([
      supabase.from('session_logs')
        .select('*, profiles!client_id(id, name), session:program_sessions(name, week, day)')
        .in('program_session_id', sessionIds)
        .order('logged_at', { ascending: false })
        .limit(10),
      supabase.from('session_logs')
        .select('id', { count: 'exact', head: true })
        .in('program_session_id', sessionIds)
        .gte('logged_at', weekStart),
      supabase.from('session_logs')
        .select('client_id, logged_at')
        .in('program_session_id', sessionIds)
        .order('logged_at', { ascending: false }),
    ])

    setStats({
      programs: progRes.count ?? 0,
      exercises: exRes.count ?? 0,
      clients: uniqueClients.length,
      sessionsThisWeek: weekCountRes.count ?? 0,
    })
    setRecentLogs(logsRes.data ?? [])

    const lastByClient = {}
    ;(allLogsRes.data ?? []).forEach(log => {
      if (!lastByClient[log.client_id]) lastByClient[log.client_id] = log.logged_at
    })
    const sevenDaysAgo = subDays(new Date(), 7).toISOString()
    const inactiveIds = uniqueClients.filter(cid => !lastByClient[cid] || lastByClient[cid] < sevenDaysAgo)
    if (inactiveIds.length > 0) {
      const { data } = await supabase.from('profiles').select('id, name, email').in('id', inactiveIds)
      setInactiveClients(data ?? [])
    } else {
      setInactiveClients([])
    }
  }

  const statCards = [
    { label: 'Mes séances', value: stats.programs, to: '/coach/programs', color: 'text-blue-600' },
    { label: 'Exercices (biblio)', value: stats.exercises, to: '/coach/exercises', color: 'text-green-600' },
    { label: 'Clients actifs', value: stats.clients, to: '/coach/clients', color: 'text-purple-600' },
    { label: 'Séances cette semaine', value: stats.sessionsThisWeek, to: '/coach/clients', color: 'text-orange-500' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, to, color }) => (
          <Link key={label} to={to}
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Activité récente</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune activité récente.</p>
          ) : (
            <div className="divide-y">
              {recentLogs.map(log => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link to={`/coach/clients/${log.profiles?.id}`}
                      className="text-sm font-medium hover:text-blue-600">
                      {log.profiles?.name}
                    </Link>
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

        {inactiveClients.length > 0 && (
          <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5">
            <h2 className="font-semibold mb-4 text-orange-700">⚠ Clients inactifs (7+ jours)</h2>
            <div className="divide-y">
              {inactiveClients.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                  <Link to={`/coach/clients/${c.id}`}
                    className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-lg hover:bg-orange-100">
                    Voir
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
