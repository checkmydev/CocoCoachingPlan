import { useState, useEffect, useCallback } from 'react'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { SESSION_TYPES } from '../../lib/sessionTypes'
import { useClientProfile } from '../../hooks/useClientProfile'
import VideoPlayer from '../../components/VideoPlayer'

const MOOV_GREEN = '#39E229'

const ZONE_COLORS = { Z1: '#60A5FA', Z2: '#34D399', Z3: '#FBBF24', Z4: '#F87171', Z5: '#A78BFA' }

function SessionModal({ session, onClose }) {
  const [enrichedExercises, setEnrichedExercises] = useState([])

  useEffect(() => {
    if (!session) { setEnrichedExercises([]); return }
    const exList = session.session_data?.exercises ?? []
    const ids = exList.map(e => e.exercise_id).filter(Boolean)
    if (ids.length === 0) { setEnrichedExercises([]); return }
    supabase.from('exercises')
      .select('id, name, description, instructions, muscle_groups, equipment, video_url')
      .in('id', ids)
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map(e => [e.id, e]))
        setEnrichedExercises(exList.map(ex => ({ ...ex, _detail: map[ex.exercise_id] ?? null })))
      })
  }, [session?.id])

  if (!session) return null
  const type = SESSION_TYPES[session.session_type] ?? SESSION_TYPES.other
  const data = session.session_data ?? {}
  const isCardio = ['running', 'trail', 'cycling'].includes(session.session_type)
  const isGym = ['strength', 'mobility', 'home_trainer', 'other'].includes(session.session_type)
  const isSwim = session.session_type === 'swimming'

  const displayExercises = enrichedExercises.length > 0 ? enrichedExercises : (data.exercises ?? [])
  const hasExercises = isGym && displayExercises.length > 0
  const hasCardioData = (isCardio || isSwim) && (data.warmup || data.main || data.cooldown)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0">
          <span className="text-3xl">{type.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight truncate">{session.title || type.label}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: type.bg, color: type.color }}>
              {type.label}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 divide-y">

          {/* Meta */}
          <div className="px-5 py-3 space-y-1.5 text-sm text-gray-700">
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
                <span className="text-gray-400">🎯</span>
                <span>{session.objective}</span>
              </div>
            )}
          </div>

          {/* Gym exercises */}
          {hasExercises && (
            <div className="px-5 py-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Programme · {displayExercises.length} exercice{displayExercises.length > 1 ? 's' : ''}</p>
              {displayExercises.map((ex, i) => {
                const detail = ex._detail
                return (
                  <div key={ex.exercise_id ?? i} className="rounded-xl border bg-gray-50 overflow-hidden">
                    {/* Exercise header */}
                    <div className="px-3 py-2.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{i + 1}. {ex.exercise_name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {ex.sets} séries × {ex.reps} rép.
                          {ex.weight_kg ? ` · ${ex.weight_kg} kg` : ''}
                          {ex.rest_sec ? ` · repos ${ex.rest_sec}s` : ''}
                        </p>
                        {detail?.muscle_groups?.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">{detail.muscle_groups.join(' · ')}</p>
                        )}
                      </div>
                    </div>
                    {/* Notes from coach */}
                    {ex.notes ? (
                      <div className="px-3 pb-2 text-xs text-blue-700 bg-blue-50 border-t border-blue-100 py-1.5">
                        💬 {ex.notes}
                      </div>
                    ) : null}
                    {/* Description / instructions */}
                    {(detail?.description || detail?.instructions) && (
                      <div className="px-3 py-2 border-t space-y-1 bg-white">
                        {detail.description && <p className="text-xs text-gray-600">{detail.description}</p>}
                        {detail.instructions && (
                          <p className="text-xs text-gray-500 whitespace-pre-wrap">{detail.instructions}</p>
                        )}
                      </div>
                    )}
                    {/* Video */}
                    {detail?.video_url && (
                      <div className="border-t">
                        <VideoPlayer url={detail.video_url} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Cardio / Swim structure */}
          {hasCardioData && (
            <div className="px-5 py-3 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Séance</p>

              {data.warmup?.duration_min && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400 mt-0.5">🔥</span>
                  <div>
                    <span className="font-medium">Échauffement</span>
                    <span className="text-gray-500 ml-2">{data.warmup.duration_min} min
                      {data.warmup.zone ? ` (${data.warmup.zone})` : ''}
                    </span>
                    {data.warmup.notes ? <p className="text-xs text-gray-400 mt-0.5">{data.warmup.notes}</p> : null}
                  </div>
                </div>
              )}

              {data.main?.mode === 'continuous' && (
                <div className="flex items-center gap-2 text-sm">
                  <span>💪</span>
                  <span className="font-medium">Corps</span>
                  <span className="text-gray-600">
                    {data.main.duration_min ? `${data.main.duration_min} min` : ''}
                    {data.main.distance_km ? ` · ${data.main.distance_km} km` : ''}
                  </span>
                  {data.main.zone && (
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: ZONE_COLORS[data.main.zone] ?? '#9ca3af' }}>
                      {data.main.zone}
                    </span>
                  )}
                </div>
              )}

              {data.main?.mode !== 'continuous' && (data.main?.intervals ?? []).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">💪 Intervalles</p>
                  <div className="space-y-1.5 ml-2">
                    {data.main.intervals.map((intv, i) => (
                      <div key={i} className="rounded-lg bg-gray-50 border px-3 py-2 text-xs flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800">
                          {intv.reps}×{intv.distance_m ? `${intv.distance_m} m` : intv.duration_sec ? `${intv.duration_sec} s` : ''}
                        </span>
                        {intv.zone && (
                          <span className="px-1.5 py-0.5 rounded font-bold text-white"
                            style={{ backgroundColor: ZONE_COLORS[intv.zone] ?? '#9ca3af' }}>
                            {intv.zone}
                          </span>
                        )}
                        {intv.vma_pct ? <span className="text-gray-500">@ {intv.vma_pct}%</span> : null}
                        {intv.recovery_min ? <span className="text-gray-400">· récup {intv.recovery_min} min</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.cooldown?.duration_min && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">🌿</span>
                  <div>
                    <span className="font-medium">Retour au calme</span>
                    <span className="text-gray-500 ml-2">{data.cooldown.duration_min} min
                      {data.cooldown.zone ? ` (${data.cooldown.zone})` : ''}
                    </span>
                    {data.cooldown.notes ? <p className="text-xs text-gray-400 mt-0.5">{data.cooldown.notes}</p> : null}
                  </div>
                </div>
              )}

              {isSwim && (data.equipment ?? []).length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span>🏊</span>
                  <span className="text-gray-600">{data.equipment.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Fallback: plain description */}
          {!hasExercises && !hasCardioData && session.description && (
            <div className="px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1.5">Détail</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0 border-t">
          <button onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm font-semibold"
            style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
            Fermer
          </button>
        </div>
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
