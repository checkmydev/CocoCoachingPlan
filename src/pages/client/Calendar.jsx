import { useState, useEffect, useCallback } from 'react'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { SESSION_TYPES } from '../../lib/sessionTypes'
import { useClientProfile } from '../../hooks/useClientProfile'

const MOOV_GREEN = '#39E229'

function SessionModal({ session, onClose }) {
  if (!session) return null
  const type = SESSION_TYPES[session.session_type] ?? SESSION_TYPES.other
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{type.emoji}</span>
          <div>
            <h3 className="font-bold text-lg leading-tight">{session.title || type.label}</h3>
            <span className="text-sm font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: type.bg, color: type.color }}>
              {type.label}
            </span>
          </div>
        </div>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📅</span>
            <span>{format(new Date(session.session_date + 'T12:00:00'), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          {session.duration_minutes && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⏱</span>
              <span>{session.duration_minutes} minutes</span>
            </div>
          )}
          {session.objective && (
            <div className="flex gap-2">
              <span className="text-gray-400 mt-0.5">🎯</span>
              <div>
                <p className="font-medium text-gray-800 mb-0.5">Objectif</p>
                <p>{session.objective}</p>
              </div>
            </div>
          )}
          {session.description && (
            <div className="flex gap-2">
              <span className="text-gray-400 mt-0.5">📝</span>
              <div>
                <p className="font-medium text-gray-800 mb-0.5">Description</p>
                <p className="whitespace-pre-wrap">{session.description}</p>
              </div>
            </div>
          )}
        </div>
        <button onClick={onClose}
          className="mt-5 w-full rounded-xl py-2.5 text-sm font-semibold"
          style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
          Fermer
        </button>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { profile } = useAuth()
  const { clientProfile } = useClientProfile()
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 6)

  const fetchSessions = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const from = format(weekStart, 'yyyy-MM-dd')
    const to = format(weekEnd, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('planned_sessions')
      .select('*')
      .eq('client_id', profile.id)
      .gte('session_date', from)
      .lte('session_date', to)
      .order('session_date', { ascending: true })
    setSessions(data ?? [])
    setLoading(false)
  }, [profile, weekStart])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  function prevWeek() { setWeekStart(d => addDays(d, -7)) }
  function nextWeek() { setWeekStart(d => addDays(d, 7)) }
  function goToToday() { setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })) }

  const sessionsByDay = weekDays.map(day => ({
    day,
    sessions: sessions.filter(s => {
      const sDate = new Date(s.session_date + 'T12:00:00')
      return isSameDay(sDate, day)
    }),
  }))

  const totalSessions = sessions.length

  return (
    <div className="space-y-4">
      {/* Objective banner */}
      {clientProfile?.personal_objectives && (
        <div className="rounded-xl p-3 text-sm"
          style={{ backgroundColor: '#f0fdf4', borderLeft: `4px solid ${MOOV_GREEN}` }}>
          <p className="font-semibold text-gray-800 mb-0.5">🎯 Objectif principal</p>
          <p className="text-gray-600 line-clamp-2">{clientProfile.personal_objectives}</p>
        </div>
      )}

      {/* Week navigation */}
      <div className="bg-white rounded-2xl border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevWeek}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            ← Semaine précédente
          </button>
          <div className="text-center">
            <p className="font-bold text-sm">
              {format(weekStart, 'd MMM', { locale: fr })} – {format(weekEnd, 'd MMM yyyy', { locale: fr })}
            </p>
            {totalSessions > 0 && (
              <p className="text-xs text-gray-500">{totalSessions} séance{totalSessions > 1 ? 's' : ''} planifiée{totalSessions > 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={nextWeek}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            Semaine suivante →
          </button>
        </div>
        <div className="flex justify-center">
          <button onClick={goToToday}
            className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">Chargement des séances...</p>
        </div>
      ) : totalSessions === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
          <p className="text-3xl mb-3">📅</p>
          <p className="font-semibold text-gray-700">Aucune séance planifiée cette semaine</p>
          <p className="text-sm text-gray-400 mt-1">Votre coach n'a pas encore planifié de séances pour cette période.</p>
        </div>
      ) : (
        <>
          {/* Mobile: vertical list */}
          <div className="block sm:hidden space-y-3">
            {sessionsByDay.map(({ day, sessions: daySessions }) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div key={day.toISOString()} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b"
                    style={isToday ? { backgroundColor: MOOV_GREEN } : { backgroundColor: '#f9fafb' }}>
                    <p className="font-semibold text-sm capitalize"
                      style={isToday ? { color: '#000' } : { color: '#374151' }}>
                      {format(day, 'EEEE d MMM', { locale: fr })}
                    </p>
                  </div>
                  {daySessions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">Repos</p>
                  ) : (
                    <div className="divide-y">
                      {daySessions.map(s => {
                        const type = SESSION_TYPES[s.session_type] ?? SESSION_TYPES.other
                        return (
                          <button key={s.id} onClick={() => setSelectedSession(s)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{type.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{s.title || type.label}</p>
                                <p className="text-xs text-gray-500">{type.label} · {s.duration_minutes ?? 60} min</p>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: type.bg, color: type.color }}>
                                {s.duration_minutes ?? 60}min
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop: horizontal columns */}
          <div className="hidden sm:block bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 divide-x">
              {sessionsByDay.map(({ day, sessions: daySessions }) => {
                const isToday = isSameDay(day, new Date())
                return (
                  <div key={day.toISOString()} className="flex flex-col min-h-[200px]">
                    <div className="px-2 py-2 text-center border-b"
                      style={isToday ? { backgroundColor: MOOV_GREEN } : { backgroundColor: '#f9fafb' }}>
                      <p className="text-xs font-semibold uppercase tracking-wide"
                        style={isToday ? { color: '#000' } : { color: '#6b7280' }}>
                        {format(day, 'EEE', { locale: fr })}
                      </p>
                      <p className="text-lg font-bold"
                        style={isToday ? { color: '#000' } : { color: '#111827' }}>
                        {format(day, 'd')}
                      </p>
                    </div>
                    <div className="flex-1 p-1.5 space-y-1.5">
                      {daySessions.map(s => {
                        const type = SESSION_TYPES[s.session_type] ?? SESSION_TYPES.other
                        return (
                          <button key={s.id} onClick={() => setSelectedSession(s)}
                            className="w-full text-left rounded-lg p-1.5 text-xs transition-all hover:opacity-80"
                            style={{ backgroundColor: type.bg, color: type.color }}>
                            <div className="font-bold">{type.emoji} {type.label}</div>
                            {s.title && <div className="truncate mt-0.5 text-gray-700">{s.title}</div>}
                            {s.duration_minutes && <div className="mt-0.5">{s.duration_minutes} min</div>}
                          </button>
                        )
                      })}
                      {daySessions.length === 0 && (
                        <p className="text-xs text-gray-300 text-center pt-2">—</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  )
}
