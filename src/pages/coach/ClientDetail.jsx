import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, addMonths, subMonths, addDays
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../../lib/supabase'
import { usePrograms } from '../../hooks/usePrograms'
import { useAuth } from '../../contexts/AuthContext'
import { SESSION_TYPES } from '../../lib/sessionTypes'
import SessionBuilder from '../../components/coach/SessionBuilder'
import { generateRunTCX, generateBikeZWO, generateBikeMRC, downloadFile } from '../../lib/watchExports'

const MOOV_GREEN = '#39E229'
const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function fmtDuration(minutes) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

function getMonthWeeks(month) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}


// ─── Coach calendar ──────────────────────────────────────────────────────────
function CoachCalendar({ clientId, coachId, logs, clientVma, clientFtp, refreshKey }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [tab, setTab] = useState('planned') // 'planned' | 'done' | 'both'
  const [planned, setPlanned] = useState([])
  const [modalDay, setModalDay] = useState(null)
  const [editSession, setEditSession] = useState(null)

  // Drag & drop
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  // Copy mode
  const [copyMode, setCopyMode] = useState(false)
  const [selectedDays, setSelectedDays] = useState(new Set())
  const [copyTargetClient, setCopyTargetClient] = useState('')
  const [clients, setClients] = useState([])
  const [copying, setCopying] = useState(false)
  const [copyDone, setCopyDone] = useState(null)

  const weeks = useMemo(() => getMonthWeeks(currentMonth), [currentMonth])

  // Load clients list when entering copy mode
  useEffect(() => {
    if (!copyMode || clients.length > 0) return
    supabase.from('profiles').select('id, name, email').eq('role', 'client').neq('id', clientId)
      .then(({ data }) => setClients(data ?? []))
  }, [copyMode, clientId, clients.length])

  const fetchPlanned = useCallback(async () => {
    const from = format(startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const to = format(endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('planned_sessions')
      .select('*')
      .eq('client_id', clientId)
      .gte('session_date', from)
      .lte('session_date', to)
      .order('session_date')
    setPlanned(data ?? [])
  }, [clientId, currentMonth, refreshKey])

  useEffect(() => { fetchPlanned() }, [fetchPlanned])

  // Build log sessions (from session_logs) for "Réalisé" view
  const logEvents = useMemo(() => {
    return logs.filter(l => {
      if (!l.logged_at) return false
      const d = new Date(l.logged_at)
      return d >= startOfMonth(currentMonth) && d <= endOfMonth(currentMonth)
    }).map(l => ({
      id: l.id,
      session_date: format(new Date(l.logged_at), 'yyyy-MM-dd'),
      session_type: 'done',
      title: l.session?.name ?? 'Séance',
      duration_minutes: null,
      _isLog: true,
      completed: l.completed,
    }))
  }, [logs, currentMonth])

  function sessionsForDay(day) {
    const key = format(day, 'yyyy-MM-dd')
    const items = []
    if (tab === 'planned' || tab === 'both') {
      items.push(...planned.filter(s => s.session_date === key))
    }
    if (tab === 'done' || tab === 'both') {
      items.push(...logEvents.filter(s => s.session_date === key))
    }
    return items
  }

  function weekTotal(week) {
    if (tab === 'done') return null
    const total = week.reduce((sum, day) => {
      const key = format(day, 'yyyy-MM-dd')
      return sum + planned
        .filter(s => s.session_date === key)
        .reduce((s2, s) => s2 + (s.duration_minutes ?? 0), 0)
    }, 0)
    return total > 0 ? fmtDuration(total) : '—'
  }

  function openAdd(day) {
    if (dragging) return
    if (copyMode) {
      const key = format(day, 'yyyy-MM-dd')
      const hasSessions = planned.some(s => s.session_date === key)
      if (!hasSessions) return
      setSelectedDays(prev => {
        const next = new Set(prev)
        next.has(key) ? next.delete(key) : next.add(key)
        return next
      })
      return
    }
    setModalDay(day); setEditSession(null)
  }
  function openEdit(s, e) {
    if (copyMode) return
    e.stopPropagation(); setEditSession(s); setModalDay(null)
  }
  function closeModal() { setModalDay(null); setEditSession(null) }
  async function afterSave() { await fetchPlanned(); closeModal() }

  function onSessionDragStart(e, s) {
    setDragging(s)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onSessionDragEnd() {
    setDragging(null)
    setDragOver(null)
  }

  function onCellDragOver(e, day) {
    if (!dragging) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const key = format(day, 'yyyy-MM-dd')
    setDragOver(prev => prev === key ? prev : key)
  }

  async function onCellDrop(e, day) {
    e.preventDefault()
    if (!dragging) return
    const newDate = format(day, 'yyyy-MM-dd')
    setDragging(null)
    setDragOver(null)
    if (dragging.session_date === newDate) return
    await supabase.from('planned_sessions').update({ session_date: newDate }).eq('id', dragging.id)
    await fetchPlanned()
  }

  function cancelCopy() {
    setCopyMode(false)
    setSelectedDays(new Set())
    setCopyTargetClient('')
    setCopyDone(null)
  }

  async function executeCopy() {
    if (!copyTargetClient || selectedDays.size === 0) return
    setCopying(true)
    const dates = [...selectedDays]
    const { data: sessions } = await supabase
      .from('planned_sessions')
      .select('*')
      .eq('client_id', clientId)
      .in('session_date', dates)
    const inserts = (sessions ?? []).map(s => ({
      client_id: copyTargetClient,
      coach_id: coachId,
      session_date: s.session_date,
      session_type: s.session_type,
      title: s.title,
      description: s.description,
      duration_minutes: s.duration_minutes,
      session_data: s.session_data,
      completed: false,
    }))
    if (inserts.length > 0) await supabase.from('planned_sessions').insert(inserts)
    setCopying(false)
    setCopyDone(inserts.length)
    setSelectedDays(new Set())
    setCopyTargetClient('')
  }

  const TABS = [
    { key: 'planned', label: 'Prévu' },
    { key: 'done',    label: 'Réalisé' },
    { key: 'both',    label: 'Prévu et réalisé' },
  ]

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b px-4 gap-1 pt-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors"
            style={tab === t.key
              ? { borderBottomColor: MOOV_GREEN, color: '#000' }
              : { borderBottomColor: 'transparent', color: '#6b7280' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 gap-2">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 shrink-0">
          ←
        </button>
        <span className="font-semibold capitalize flex-1 text-center">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 shrink-0">
          →
        </button>
        {!copyMode ? (
          <button onClick={() => { setCopyMode(true); setCopyDone(null) }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors shrink-0">
            📋 Copier des jours
          </button>
        ) : (
          <button onClick={cancelCopy}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors shrink-0">
            Annuler
          </button>
        )}
      </div>

      {/* Copy mode banner */}
      {copyMode && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          {copyDone !== null ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">
                ✅ {copyDone} séance{copyDone > 1 ? 's' : ''} copiée{copyDone > 1 ? 's' : ''} !
              </span>
              <button onClick={cancelCopy} className="text-xs text-gray-500 hover:text-gray-700 underline">Terminer</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-blue-700 font-medium shrink-0">
                {selectedDays.size === 0
                  ? '👆 Cliquez sur des jours avec des séances'
                  : `${selectedDays.size} jour${selectedDays.size > 1 ? 's' : ''} sélectionné${selectedDays.size > 1 ? 's' : ''}`}
              </span>
              {selectedDays.size > 0 && (
                <>
                  <select value={copyTargetClient} onChange={e => setCopyTargetClient(e.target.value)}
                    className="flex-1 min-w-0 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                    <option value="">Choisir un client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                  <button onClick={executeCopy} disabled={copying || !copyTargetClient}
                    className="text-sm font-bold px-4 py-1.5 rounded-lg disabled:opacity-50 shrink-0"
                    style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
                    {copying ? '⏳' : 'Copier →'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              {DAYS_HEADER.map(d => (
                <th key={d} className="px-2 py-2 text-xs font-semibold text-gray-500 text-center">{d}</th>
              ))}
              <th className="px-2 py-2 text-xs font-semibold text-gray-500 text-right w-16">Total</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi} className="border-b last:border-b-0">
                {week.map(day => {
                  const inMonth = isSameMonth(day, currentMonth)
                  const today = isToday(day)
                  const daySessions = sessionsForDay(day)
                  return (
                    <td key={day.toISOString()}
                      onClick={() => inMonth && openAdd(day)}
                      onDragOver={e => inMonth && onCellDragOver(e, day)}
                      onDrop={e => inMonth && onCellDrop(e, day)}
                      className={`align-top p-1 border-r last:border-r-0 transition-colors ${
                        !inMonth ? 'bg-gray-50 cursor-default'
                        : dragOver === format(day, 'yyyy-MM-dd') && dragging ? 'bg-green-100 ring-2 ring-inset ring-green-400'
                        : copyMode && selectedDays.has(format(day, 'yyyy-MM-dd')) ? 'bg-blue-100 cursor-pointer ring-2 ring-inset ring-blue-400'
                        : copyMode ? 'cursor-pointer hover:bg-blue-50'
                        : 'cursor-pointer hover:bg-green-50'
                      }`}
                      style={{ minHeight: 64 }}>
                      <div className="flex flex-col gap-0.5 min-h-[56px]">
                        <span className={`text-xs font-medium mb-0.5 inline-flex w-5 h-5 items-center justify-center rounded-full ${
                          today ? 'text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'
                        }`}
                          style={today ? { backgroundColor: MOOV_GREEN } : {}}>
                          {format(day, 'd')}
                        </span>
                        {daySessions.map(s => {
                          const type = s._isLog
                            ? { label: s.title, color: '#22c55e', bg: '#dcfce7', emoji: '✅' }
                            : (SESSION_TYPES[s.session_type] ?? SESSION_TYPES.other)
                          const isDraggingThis = dragging?.id === s.id
                          return (
                            <button key={s.id}
                              draggable={!s._isLog && !copyMode}
                              onDragStart={e => !s._isLog && onSessionDragStart(e, s)}
                              onDragEnd={onSessionDragEnd}
                              onClick={e => !s._isLog && openEdit(s, e)}
                              className={`w-full text-left rounded px-1 py-0.5 text-xs font-medium truncate leading-tight transition-all ${
                                isDraggingThis ? 'opacity-40 scale-95' : 'hover:opacity-80'
                              } ${!s._isLog && !copyMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                              style={{ backgroundColor: type.bg, color: type.color }}
                              title={s.title || type.label}>
                              {type.emoji} {s.title || type.label}
                              {s.duration_minutes ? <span className="ml-1 opacity-70">{fmtDuration(s.duration_minutes)}</span> : null}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
                <td className="px-2 py-1 text-right align-top">
                  <span className="text-xs text-gray-400 font-medium">{weekTotal(week)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Session builder (portal-rendered, always on top) */}
      {(modalDay !== null || editSession) && (
        <SessionBuilder
          day={modalDay}
          session={editSession}
          coachId={coachId}
          clientId={clientId}
          clientVma={clientVma}
          clientFtp={clientFtp}
          onSave={afterSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ClientDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { programs } = usePrograms()

  const [client, setClient] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [clientPrograms, setClientPrograms] = useState([])
  const [logs, setLogs] = useState([])
  const [checkins, setCheckins] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [section, setSection] = useState('calendar')
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)
  const [generating, setGenerating] = useState(null) // cpId being generated
  const [fcMax, setFcMax] = useState(190)
  const [fcRest, setFcRest] = useState(55)
  const [savingPhysio, setSavingPhysio] = useState(false)

  useEffect(() => { loadAll() }, [id])

  useEffect(() => {
    if (clientProfile) {
      setFcMax(clientProfile.fc_max ?? 190)
      setFcRest(clientProfile.fc_repos ?? 55)
    }
  }, [clientProfile])

  async function loadAll() {
    const [cRes, cpRes, logsRes, ciRes, extRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('client_programs').select('*, program:programs(*)').eq('client_id', id).order('start_date', { ascending: false }),
      supabase.from('session_logs').select('*, session:program_sessions(name, week, day)').eq('client_id', id).order('logged_at', { ascending: false }).limit(100),
      supabase.from('client_checkins').select('*').eq('client_id', id).order('week_start', { ascending: false }).limit(8),
      supabase.from('client_profiles').select('*').eq('client_id', id).maybeSingle(),
    ])
    setClient(cRes.data)
    setNotes(cRes.data?.coach_notes ?? '')
    setClientPrograms(cpRes.data ?? [])
    setLogs(logsRes.data ?? [])
    setCheckins(ciRes.data ?? [])
    setClientProfile(extRes.data ?? null)
  }

  async function assignProgram(e) {
    e.preventDefault()
    if (!selectedProgram) return
    setAssigning(true)
    await supabase.from('client_programs').insert({
      client_id: id, program_id: selectedProgram,
      start_date: new Date().toISOString().split('T')[0], status: 'active'
    })
    const { data } = await supabase.from('client_programs').select('*, program:programs(*)').eq('client_id', id).order('start_date', { ascending: false })
    setClientPrograms(data ?? [])
    setSelectedProgram('')
    setAssigning(false)
  }

  async function updateProgramStatus(cpId, status) {
    await supabase.from('client_programs').update({ status }).eq('id', cpId)
    const { data } = await supabase.from('client_programs').select('*, program:programs(*)').eq('client_id', id).order('start_date', { ascending: false })
    setClientPrograms(data ?? [])
  }

  async function saveNotes() {
    setSavingNotes(true)
    await supabase.from('profiles').update({ coach_notes: notes }).eq('id', id)
    setSavingNotes(false)
  }

  async function savePhysio() {
    setSavingPhysio(true)
    await supabase.from('client_profiles')
      .upsert({ client_id: id, fc_max: parseInt(fcMax) || null, fc_repos: parseInt(fcRest) || null }, { onConflict: 'client_id' })
    setSavingPhysio(false)
  }

  async function generateCalendarFromProgram(cp) {
    if (!cp.start_date) {
      alert('Cette séance n\'a pas de date de début. Ajoutez une date de début.')
      return
    }
    setGenerating(cp.id)
    const { data: pSessions } = await supabase
      .from('program_sessions')
      .select('id, name, week, day')
      .eq('program_id', cp.program_id)
      .order('week').order('day')

    if (!pSessions?.length) {
      alert('Cette séance ne contient aucun exercice.')
      setGenerating(null)
      return
    }

    const startDate = new Date(cp.start_date + 'T12:00:00')
    const insertData = pSessions.map(s => ({
      client_id: id,
      coach_id: profile.id,
      session_date: format(addDays(startDate, (s.week - 1) * 7 + (s.day - 1)), 'yyyy-MM-dd'),
      session_type: 'other',
      title: s.name,
      description: `Séance : ${cp.program?.name ?? ''} — Sem. ${s.week} / Jour ${s.day}`,
      duration_minutes: 60,
      completed: false,
      program_session_id: s.id,
    }))

    await supabase.from('planned_sessions').insert(insertData)
    setGenerating(null)
    setCalendarRefreshKey(k => k + 1)
    setSection('calendar')
  }

  if (!client) return (
    <div className="p-6 text-gray-400 flex items-center gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
      Chargement...
    </div>
  )

  const scaleEmoji = v => v ? ['', '😕', '😐', '😊', '😊', '💪', '💪', '⭐'][v] ?? '' : '—'
  const statusColors = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', done: 'bg-gray-100 text-gray-500' }
  const statusLabels = { active: 'Actif', paused: 'En pause', done: 'Terminé' }
  const emojiRecovery = { 1: '😴', 2: '😕', 3: '😐', 4: '😊', 5: '💪' }
  const emojiStress   = { 1: '😌', 2: '🙂', 3: '😐', 4: '😟', 5: '😰' }

  const completionByWeek = logs
    .filter(l => l.completed)
    .reduce((acc, log) => {
      const week = format(new Date(log.logged_at), 'dd/MM')
      const ex = acc.find(d => d.date === week)
      if (ex) ex.séances++; else acc.push({ date: week, séances: 1 })
      return acc
    }, []).slice(-8)

  const SECTIONS = [
    { key: 'calendar',  label: '📅 Calendrier' },
    { key: 'programs',  label: '📋 Séances' },
    { key: 'notes',     label: '📝 Notes' },
    { key: 'history',   label: '📊 Historique' },
    { key: 'montre',    label: '⌚ Montre' },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/coach/clients" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Clients</Link>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shrink-0">
            {(client.name ?? client.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{client.name || '—'}</h1>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Objectifs */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Objectifs</h3>
            <span className="text-lg">🎯</span>
          </div>
          {clientProfile?.personal_objectives
            ? <p className="text-sm text-gray-700 line-clamp-3">{clientProfile.personal_objectives}</p>
            : <p className="text-sm text-gray-400 italic">Non renseigné</p>}
        </div>

        {/* Profil */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profil</h3>
            <span className="text-lg">👤</span>
          </div>
          {clientProfile ? (
            <div className="space-y-1 text-xs text-gray-600">
              {clientProfile.first_name && <p><span className="text-gray-400">Nom :</span> {clientProfile.first_name} {clientProfile.last_name}</p>}
              {clientProfile.birth_date  && <p><span className="text-gray-400">DDN :</span> {format(new Date(clientProfile.birth_date + 'T12:00:00'), 'dd/MM/yyyy')}</p>}
              {clientProfile.height_cm && clientProfile.weight_kg && (
                <p><span className="text-gray-400">IMC :</span> {(clientProfile.weight_kg / Math.pow(clientProfile.height_cm / 100, 2)).toFixed(1)}</p>
              )}
              {clientProfile.phone && <p><span className="text-gray-400">Tél :</span> {clientProfile.phone} {clientProfile.uses_whatsapp ? '(WA)' : ''}</p>}
            </div>
          ) : <p className="text-sm text-gray-400 italic">Fiche non complétée</p>}
        </div>

        {/* Engagement */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Engagement</h3>
            <span className="text-lg">⚡</span>
          </div>
          {clientProfile?.scale_motivation ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
              <span className="text-gray-400">Intérêt</span>     <span>{scaleEmoji(clientProfile.scale_interest)} {clientProfile.scale_interest}/7</span>
              <span className="text-gray-400">Motivation</span>  <span>{scaleEmoji(clientProfile.scale_motivation)} {clientProfile.scale_motivation}/7</span>
              <span className="text-gray-400">Confiance</span>   <span>{scaleEmoji(clientProfile.scale_confidence)} {clientProfile.scale_confidence}/7</span>
              <span className="text-gray-400">Dispo</span>       <span>{scaleEmoji(clientProfile.scale_availability)} {clientProfile.scale_availability}/7</span>
              {clientProfile.vma_kmh  && <><span className="text-gray-400">VMA</span>  <span className="font-bold text-blue-600">{clientProfile.vma_kmh} km/h</span></>}
              {clientProfile.ftp_watts && <><span className="text-gray-400">FTP</span> <span className="font-bold text-purple-600">{clientProfile.ftp_watts} W</span></>}
            </div>
          ) : <p className="text-sm text-gray-400 italic">Non renseigné</p>}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className="shrink-0 flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
            style={section === s.key
              ? { backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.1)', color: '#000' }
              : { color: '#6b7280' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Calendar section */}
      {section === 'calendar' && (
        <CoachCalendar
          clientId={id}
          coachId={profile?.id}
          logs={logs}
          clientVma={clientProfile?.vma_kmh ?? null}
          clientFtp={clientProfile?.ftp_watts ?? null}
          refreshKey={calendarRefreshKey}
        />
      )}

      {/* Programs section */}
      {section === 'programs' && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Séances assignées</h2>
          <form onSubmit={assignProgram} className="flex gap-2 mb-4">
            <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Choisir une séance...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button type="submit" disabled={assigning || !selectedProgram}
              className="text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
              Assigner
            </button>
          </form>
          <div className="divide-y">
            {clientPrograms.map(cp => (
              <div key={cp.id} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{cp.program?.name}</span>
                  <select value={cp.status} onChange={e => updateProgramStatus(cp.id, e.target.value)}
                    className={`text-xs px-2 py-0.5 rounded-full border-0 ${statusColors[cp.status]}`}>
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Début : {cp.start_date ? format(new Date(cp.start_date + 'T12:00:00'), 'dd/MM/yyyy') : '—'}
                  </span>
                  <button
                    onClick={() => generateCalendarFromProgram(cp)}
                    disabled={generating === cp.id}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}
                    title="Génère une séance planifiée par jour du programme dans le calendrier">
                    {generating === cp.id ? '⏳ Génération...' : '📅 Planifier dans le calendrier'}
                  </button>
                </div>
              </div>
            ))}
            {clientPrograms.length === 0 && <p className="text-sm text-gray-400 py-2">Aucune séance assignée.</p>}
          </div>
        </div>
      )}

      {/* Notes section */}
      {section === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold mb-3">Notes coach</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
              placeholder="Blessures, objectifs, restrictions alimentaires, historique médical..."
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            <button onClick={saveNotes} disabled={savingNotes}
              className="mt-2 text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
              {savingNotes ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>

          {/* Medical data from onboarding */}
          {clientProfile && (clientProfile.medical_history || clientProfile.trauma_history || clientProfile.allergies || clientProfile.exercise_contraindications) && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold mb-4 text-red-700">⚕️ Données médicales</h2>
              <div className="space-y-3 text-sm">
                {clientProfile.medical_history && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Antécédents médicaux</p><p className="text-gray-700">{clientProfile.medical_history}</p></div>}
                {clientProfile.trauma_history && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Traumatismes</p><p className="text-gray-700">{clientProfile.trauma_history}</p></div>}
                {clientProfile.current_treatments && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Traitements</p><p className="text-gray-700">{clientProfile.current_treatments}</p></div>}
                {clientProfile.allergies && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Allergies</p><p className="text-gray-700">{clientProfile.allergies}</p></div>}
                {clientProfile.exercise_contraindications && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Contre-indications</p><p className="text-gray-700">{clientProfile.exercise_contraindications}</p></div>}
                {clientProfile.special_precautions && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Précautions</p><p className="text-gray-700">{clientProfile.special_precautions}</p></div>}
                {clientProfile.emergency_contact && <div><p className="text-xs text-gray-400 font-medium uppercase mb-1">Contact d'urgence</p><p className="text-gray-700">{clientProfile.emergency_contact}</p></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History section */}
      {section === 'history' && (
        <div className="space-y-4">
          {completionByWeek.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold mb-4">Activité — séances complétées</h2>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={completionByWeek}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="séances" stroke={MOOV_GREEN} strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {checkins.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
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
                {logs.slice(0, 30).map(log => (
                  <div key={log.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{log.session?.name}</p>
                      <p className="text-xs text-gray-400">Sem. {log.session?.week} / Jour {log.session?.day}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{format(new Date(log.logged_at), 'dd/MM/yy HH:mm')}</p>
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
      )}

      {/* ── Montre section ── */}
      {section === 'montre' && (() => {
        const vma    = clientProfile?.vma_kmh   ?? 14
        const ftp    = clientProfile?.ftp_watts ?? 200
        const name   = encodeURIComponent(client?.name ?? '')
        const src    = `${import.meta.env.BASE_URL}watch-exports/emulator.html?vma=${vma}&ftp=${ftp}&fcmax=${fcMax}&fcrest=${fcRest}&name=${name}`
        const missingVma = !clientProfile?.vma_kmh
        const missingFtp = !clientProfile?.ftp_watts

        return (
          <div className="space-y-4">
            {/* Physio data card */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold mb-4">Données physiologiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">VMA</p>
                  <p className={`text-lg font-bold ${missingVma ? 'text-gray-300' : 'text-blue-600'}`}>
                    {missingVma ? '—' : `${vma} km/h`}
                  </p>
                  {missingVma && <p className="text-xs text-orange-400 mt-0.5">Non renseigné</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">FTP</p>
                  <p className={`text-lg font-bold ${missingFtp ? 'text-gray-300' : 'text-purple-600'}`}>
                    {missingFtp ? '—' : `${ftp} W`}
                  </p>
                  {missingFtp && <p className="text-xs text-orange-400 mt-0.5">Non renseigné</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">FC max (bpm)</label>
                  <input type="number" value={fcMax} onChange={e => setFcMax(e.target.value)}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">FC repos (bpm)</label>
                  <input type="number" value={fcRest} onChange={e => setFcRest(e.target.value)}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={savePhysio} disabled={savingPhysio}
                  className="text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
                  style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
                  {savingPhysio ? 'Sauvegarde...' : 'Sauvegarder FC'}
                </button>
                <a href={src} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Plein écran ↗
                </a>
              </div>
            </div>

            {/* Export buttons */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">Exporter la séance vers une montre</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadFile(
                    generateRunTCX(client?.name, vma),
                    `moovlab_course_vma_${(client?.name ?? 'client').replace(/\s+/g, '_').toLowerCase()}.tcx`
                  )}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <span>⬇</span>
                  <span>Garmin / Polar / Suunto</span>
                  <span className="text-xs text-gray-400 font-normal">Course .tcx — {vma} km/h{!clientProfile?.vma_kmh && ' (défaut)'}</span>
                </button>

                <button
                  onClick={() => downloadFile(
                    generateBikeZWO(client?.name),
                    `moovlab_velo_zone4_${(client?.name ?? 'client').replace(/\s+/g, '_').toLowerCase()}.zwo`
                  )}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <span>⬇</span>
                  <span>Zwift</span>
                  <span className="text-xs text-gray-400 font-normal">Vélo .zwo</span>
                </button>

                <button
                  onClick={() => downloadFile(
                    generateBikeMRC(client?.name, ftp),
                    `moovlab_velo_zone4_${(client?.name ?? 'client').replace(/\s+/g, '_').toLowerCase()}.mrc`
                  )}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <span>⬇</span>
                  <span>Wahoo / TrainerRoad</span>
                  <span className="text-xs text-gray-400 font-normal">Vélo .mrc — {ftp}W{!clientProfile?.ftp_watts && ' (défaut)'}</span>
                </button>

                <a
                  href="https://connect.garmin.com/modern/import-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  ↗ Importer sur Garmin Connect
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Télécharge le fichier → glisse-le dans Garmin Connect / Zwift / Wahoo app → synchronise sur la montre
              </p>
            </div>

            {/* Emulator iframe */}
            <div className="rounded-xl overflow-hidden border shadow-sm" style={{ height: 640, background: '#0a0a0a' }}>
              <iframe
                key={`${vma}-${ftp}-${fcMax}-${fcRest}`}
                src={src}
                title="Watch Emulator"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
