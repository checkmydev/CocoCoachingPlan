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
      .eq('coach_id', profile.id)
      .order('created_at', { ascending: false })
    setPrograms(data ?? [])
    setLoading(false)
  }

  async function createProgram(values) {
    const { data, error } = await supabase
      .from('programs')
      .insert({ ...values, coach_id: profile.id })
      .select().single()
    if (!error) setPrograms(prev => [data, ...prev])
    return { data, error }
  }

  async function deleteProgram(id) {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (!error) setPrograms(prev => prev.filter(p => p.id !== id))
    return { error }
  }

  return { programs, loading, createProgram, deleteProgram, refetch: fetchPrograms }
}
