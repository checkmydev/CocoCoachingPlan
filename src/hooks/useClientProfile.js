import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useClientProfile() {
  const { profile } = useAuth()
  const [clientProfile, setClientProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!profile || profile.role !== 'client') {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', profile.id)
      .maybeSingle()
    setClientProfile(data ?? null)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function saveClientProfile(values) {
    if (!profile) return { error: 'No profile' }
    const payload = { ...values, client_id: profile.id }
    const { data, error } = await supabase
      .from('client_profiles')
      .upsert(payload, { onConflict: 'client_id' })
      .select()
      .single()
    if (!error && data) {
      setClientProfile(data)
    }
    return { data, error }
  }

  return { clientProfile, loading, saveClientProfile, refetch: fetchProfile }
}
