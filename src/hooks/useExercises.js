import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useExercises() {
  const { profile } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetchExercises()
  }, [profile])

  async function fetchExercises() {
    setLoading(true)
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('created_by', profile.id)
      .order('name')
    setExercises(data ?? [])
    setLoading(false)
  }

  async function createExercise(values) {
    const { data, error } = await supabase
      .from('exercises')
      .insert({ ...values, created_by: profile.id })
      .select().single()
    if (!error) setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data, error }
  }

  async function updateExercise(id, values) {
    const { data, error } = await supabase
      .from('exercises').update(values).eq('id', id).select().single()
    if (!error) setExercises(prev => prev.map(e => e.id === id ? data : e))
    return { data, error }
  }

  async function deleteExercise(id) {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (!error) setExercises(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { exercises, loading, createExercise, updateExercise, deleteExercise, refetch: fetchExercises }
}
