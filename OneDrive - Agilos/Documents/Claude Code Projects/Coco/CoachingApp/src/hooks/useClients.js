import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePrograms } from './usePrograms'

export function useClients() {
  const { programs } = usePrograms()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programs.length === 0) { setLoading(false); return }
    fetchClients()
  }, [programs])

  async function fetchClients() {
    setLoading(true)
    const programIds = programs.map(p => p.id)
    const { data: cp } = await supabase
      .from('client_programs')
      .select('client_id')
      .in('program_id', programIds)
    const clientIds = [...new Set((cp ?? []).map(c => c.client_id))]
    if (clientIds.length === 0) { setClients([]); setLoading(false); return }
    const { data } = await supabase.from('profiles').select('*').in('id', clientIds)
    setClients(data ?? [])
    setLoading(false)
  }

  return { clients, loading, refetch: fetchClients }
}
