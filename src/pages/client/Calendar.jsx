import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { SESSION_TYPES } from '../../lib/sessionTypes'
import { useClientProfile } from '../../hooks/useClientProfile'
import VideoPlayer from '../../components/VideoPlayer'

const MOOV_GREEN = '#39E229'

const ZONE_COLORS  = { Z1: '#60A5FA', Z2: '#34D399', Z3: '#FBBF24', Z4: '#F87171', Z5: '#A78BFA' }
const ZONE_LABELS  = { Z1: 'Fondamental', Z2: 'Endurance', Z3: 'Tempo', Z4: 'VMA', Z5: 'Survitesse' }
const TERRAIN_LABELS = { flat: 'Plat 🛣️', hilly: 'Vallonné ⛰️', trail: 'Trail 🌲', stairs: 'Escaliers 🪜', track: 'Piste 🏟️' }
const SWIM_LABELS  = { pull_buoy: 'Pull-buoy 🟠', fins: 'Palmes 🦈', snorkel: 'Tuba 🤿', kickboard: 'Planche 🏄' }
const RECOVERY_LABELS = { rest: 'repos', jog: 'trot', walk: 'marche' }

function ZoneBadge({ zone }) {
  if (!zone) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: ZONE_COLORS[zone] ?? '#9ca3af' }}>
      {zone} <span className="font-normal opacity-80">{ZONE_LABELS[zone]}</span>
    </span>
  )
}

function ExerciseCard({ ex, index }) {
  const [open, setOpen] = useState(true)
  const d = ex._detail
  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Header row — always visible */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-lg font-bold text-gray-400 w-6 shrink-0">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{ex.exercise_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {ex.sets} × {ex.reps} rép.
            {ex.weight_kg ? ` · ${ex.weight_kg} kg` : ''}
            {ex.rest_sec ? ` · repos ${ex.rest_sec}s` : ''}
          </p>
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="divide-y">
          {/* Coach note */}
          {ex.notes ? (
            <div className="px-4 py-2.5 bg-blue-50 text-xs text-blue-800 flex gap-2">
              <span>💬</span><span>{ex.notes}</span>
            </div>
          ) : null}

          {/* Muscle groups + equipment */}
          {(d?.muscle_groups?.length > 0 || d?.equipment?.length > 0) && (
            <div className="px-4 py-2.5 flex flex-wrap gap-1.5">
              {(d.muscle_groups ?? []).map(m => (
                <span key={m} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">{m}</span>
              ))}
              {(d.equipment ?? []).map(e => (
                <span key={e} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{e}</span>
              ))}
            </div>
          )}

          {/* Description */}
          {d?.description && (
            <div className="px-4 py-2.5 text-sm text-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p>{d.description}</p>
            </div>
          )}

          {/* Instructions */}
          {d?.instructions && (
            <div className="px-4 py-2.5 text-sm text-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Instructions</p>
              <p className="whitespace-pre-wrap leading-relaxed">{d.instructions}</p>
            </div>
          )}

          {/* Video */}
          {d?.video_url && (
            <div className="p-3 bg-black">
              <VideoPlayer url={d.video_url} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SessionModal({ session, onClose }) {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) { setEnriched([]); return }
    const exList = session.session_data?.exercises ?? []
    const ids = exList.map(e => e.exercise_id).filter(Boolean)
    if (ids.length === 0) { setEnriched([]); return }
    setLoading(true)
    supabase.from('exercises')
      .select('id, name, description, instructions, muscle_groups, equipment, video_url')
      .in('id', ids)
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map(e => [e.id, e]))
        setEnriched(exList.map(ex => ({ ...ex, _detail: map[ex.exercise_id] ?? null })))
        setLoading(false)
      })
  }, [session?.id])

  if (!session) return null

  const type = SESSION_TYPES[session.session_type] ?? SESSION_TYPES.other
  const sd = session.session_data ?? {}
  const isCardio = ['running', 'trail', 'cycling'].includes(session.session_type)
  const isGym    = ['strength', 'mobility', 'home_trainer', 'other'].includes(session.session_type)
  const isSwim   = session.session_type === 'swimming'

  const exercises = enriched.length > 0 ? enriched : (sd.exercises ?? [])
  const hasExercises  = isGym && exercises.length > 0
  const hasCardioData = (isCardio || isSwim) && (sd.warmup || sd.main || sd.cooldown)

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/60"
      onClick={onClose}>
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-xl shadow-2xl flex flex-col max-h-[92vh] rounded-t-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0">
          <span className="text-3xl">{type.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight">{session.title || type.label}</h3>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: type.bg, color: type.color }}>
                {type.label}
              </span>
              <span className="text-xs text-gray-400">
                {format(new Date(session.session_date + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })}
              </span>
              {session.duration_minutes && (
                <span className="text-xs text-gray-400">· {session.duration_minutes} min</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl shrink-0">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* Objective */}
          {session.objective && (
            <div className="px-5 py-3 border-b bg-green-50 flex gap-2 text-sm">
              <span>🎯</span>
              <span className="text-gray-700">{session.objective}</span>
            </div>
          )}

          {/* ── GYM EXERCISES ── */}
          {hasExercises && (
            <div className="px-4 py-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Programme — {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
                {loading && <span className="ml-2 text-gray-300 animate-pulse">chargement...</span>}
              </p>
              {exercises.map((ex, i) => (
                <ExerciseCard key={ex.exercise_id ?? i} ex={ex} index={i} />
              ))}
            </div>
          )}

          {/* ── CARDIO / SWIM ── */}
          {hasCardioData && (
            <div className="px-4 py-4 space-y-4">

              {/* Terrain */}
              {sd.terrain && TERRAIN_LABELS[sd.terrain] && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wide w-24 shrink-0">Terrain</span>
                  <span className="font-medium">{TERRAIN_LABELS[sd.terrain]}</span>
                </div>
              )}

              {/* Swimming equipment */}
              {isSwim && (sd.equipment ?? []).length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wide w-24 shrink-0">Matériel</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {sd.equipment.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {SWIM_LABELS[k] ?? k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Échauffement */}
              {sd.warmup?.duration_min && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xl">🔥</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-blue-900">Échauffement</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        {sd.warmup.duration_min} min
                        {sd.warmup.zone ? <> · <ZoneBadge zone={sd.warmup.zone} /></> : ''}
                      </p>
                    </div>
                  </div>
                  {sd.warmup.notes && (
                    <div className="px-4 py-2 border-t border-blue-100 text-xs text-blue-800 italic">
                      {sd.warmup.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Corps — continu */}
              {sd.main?.mode === 'continuous' && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">💪</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-red-900">Corps de séance</p>
                    <p className="text-xs text-red-700 mt-0.5 flex items-center gap-2 flex-wrap">
                      {sd.main.duration_min ? <span>{sd.main.duration_min} min</span> : null}
                      {sd.main.distance_km  ? <span>{sd.main.distance_km} km</span>  : null}
                      {sd.main.zone ? <ZoneBadge zone={sd.main.zone} /> : null}
                    </p>
                  </div>
                </div>
              )}

              {/* Corps — intervalles */}
              {sd.main?.mode !== 'continuous' && (sd.main?.intervals ?? []).length > 0 && (
                <div className="rounded-xl border border-red-100 overflow-hidden">
                  <div className="px-4 py-2.5 bg-red-50 flex items-center gap-2">
                    <span className="text-lg">💪</span>
                    <p className="font-semibold text-sm text-red-900">
                      Intervalles — {sd.main.intervals.length} bloc{sd.main.intervals.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="divide-y">
                    {sd.main.intervals.map((intv, i) => {
                      const work = intv.distance_m
                        ? `${intv.distance_m} m`
                        : intv.duration_sec
                          ? `${intv.duration_sec} s`
                          : ''
                      const recov = intv.recovery_min
                        ? `${intv.recovery_min} min ${RECOVERY_LABELS[intv.recovery_type] ?? ''}`
                        : intv.recovery_dist_m
                          ? `${intv.recovery_dist_m} m ${RECOVERY_LABELS[intv.recovery_type] ?? ''}`
                          : null
                      return (
                        <div key={i} className="px-4 py-3 flex items-start gap-3">
                          <span className="text-xs font-bold text-gray-400 w-5 pt-0.5">{i + 1}</span>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">{intv.reps} × {work}</span>
                              {intv.zone ? <ZoneBadge zone={intv.zone} /> : null}
                              {intv.vma_pct ? (
                                <span className="text-xs text-gray-500 font-mono">@ {intv.vma_pct}%</span>
                              ) : null}
                            </div>
                            {recov && (
                              <p className="text-xs text-gray-400">Récup : {recov}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Retour au calme */}
              {sd.cooldown?.duration_min && (
                <div className="rounded-xl border border-green-100 bg-green-50 overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xl">🌿</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-green-900">Retour au calme</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {sd.cooldown.duration_min} min
                        {sd.cooldown.zone ? <> · <ZoneBadge zone={sd.cooldown.zone} /></> : ''}
                      </p>
                    </div>
                  </div>
                  {sd.cooldown.notes && (
                    <div className="px-4 py-2 border-t border-green-100 text-xs text-green-800 italic">
                      {sd.cooldown.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fallback */}
          {!hasExercises && !hasCardioData && session.description && (
            <div className="px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Détail</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{session.description}</p>
            </div>
          )}

          {/* Day off */}
          {session.session_type === 'day_off' && (
            <div className="px-5 py-10 text-center text-gray-400">
              <p className="text-4xl mb-3">😴</p>
              <p className="font-semibold">Journée de repos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0">
          <button onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-bold"
            style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
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
