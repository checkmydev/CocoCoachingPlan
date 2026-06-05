import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function ProgramDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [program, setProgram] = useState(null)
  const [sessions, setSessions] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())

  useEffect(() => {
    loadProgram()
    loadCompleted()
  }, [id, profile])

  async function loadProgram() {
    const { data } = await supabase.from('programs').select('*').eq('id', id).single()
    setProgram(data)
    const { data: sess } = await supabase
      .from('program_sessions')
      .select('*, session_exercises(*, exercise:exercises(name))')
      .eq('program_id', id)
      .order('week').order('day')
    setSessions(sess ?? [])
  }

  async function loadCompleted() {
    if (!profile) return
    const { data } = await supabase
      .from('session_logs')
      .select('program_session_id')
      .eq('client_id', profile.id)
      .eq('completed', true)
    setCompletedIds(new Set((data ?? []).map(l => l.program_session_id)))
  }

  if (!program) return <p className="text-gray-400">Chargement...</p>

  const weeks = [...new Set(sessions.map(s => s.week))].sort((a, b) => a - b)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{program.name}</h1>
      {program.description && <p className="text-gray-500 mb-6">{program.description}</p>}

      {weeks.map(week => (
        <div key={week} className="mb-6">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Semaine {week}
          </h2>
          <div className="space-y-2">
            {sessions.filter(s => s.week === week).sort((a, b) => a.day - b.day).map(session => {
              const done = completedIds.has(session.id)
              const exCount = session.session_exercises?.length ?? 0
              return (
                <div key={session.id}
                  className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between ${done ? 'opacity-60' : ''}`}>
                  <div>
                    <h3 className="font-semibold">{session.name}</h3>
                    <p className="text-sm text-gray-400">{exCount} exercice{exCount !== 1 ? 's' : ''}</p>
                  </div>
                  {done ? (
                    <span className="text-green-600 font-medium text-sm">✓ Complétée</span>
                  ) : (
                    <Link to={`/client/session/${session.id}`}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                      Commencer
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
