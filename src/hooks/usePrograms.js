import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePrograms() {
  const { profile } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetchPrograms()
  }, [profile])

  async function fetchPrograms() {
    setLoading(true)
    const { data } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })
    setPrograms(data ?? [])
    setLoading(false)
  }

  async function createProgram(values) {
    const { data, error } = await supabase
      .from('programs')
      .insert({ ...values, coach_id: profile.id })
      .select().single()
    if (!error) await fetchPrograms()
    return { data, error }
  }

  async function deleteProgram(id) {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (!error) setPrograms(prev => prev.filter(p => p.id !== id))
    return { error }
  }

  async function duplicateProgram(id) {
    const { data: prog } = await supabase
      .from('programs')
      .select('*, program_sessions(*, session_exercises(*))')
      .eq('id', id)
      .single()
    if (!prog) return { error: 'Séance introuvable' }

    const { data: newProg, error } = await supabase
      .from('programs')
      .insert({ name: `${prog.name} (Copie)`, description: prog.description, coach_id: profile.id })
      .select().single()
    if (error) return { error }

    for (const session of (prog.program_sessions ?? [])) {
      const { data: newSession } = await supabase
        .from('program_sessions')
        .insert({ program_id: newProg.id, week: session.week, day: session.day, name: session.name })
        .select().single()
      if (newSession && session.session_exercises?.length > 0) {
        await supabase.from('session_exercises').insert(
          session.session_exercises.map(ex => ({
            session_id: newSession.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            order: ex.order,
          }))
        )
      }
    }

    await fetchPrograms()
    return { data: newProg }
  }

  return { programs, loading, createProgram, deleteProgram, duplicateProgram, refetch: fetchPrograms }
}
