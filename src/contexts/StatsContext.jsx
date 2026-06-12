import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { ACHIEVEMENTS, getLevel, calculateXP } from '../lib/gamification'

const StatsContext = createContext(null)

export function StatsProvider({ children }) {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    if (!profile || profile.role !== 'client') return
    fetchStats()
    fetchAchievements()
  }, [profile?.id])

  async function fetchStats() {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('client_id', profile.id)
      .maybeSingle()

    if (!data) {
      const { data: created } = await supabase
        .from('user_stats')
        .insert({ client_id: profile.id, total_xp: 0, total_sessions: 0, streak_days: 0 })
        .select()
        .single()
      setStats(created)
    } else {
      setStats(data)
    }
  }

  async function fetchAchievements() {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('client_id', profile.id)
    setAchievements(data ?? [])
  }

  async function onSessionComplete() {
    if (!profile) return null

    const today = new Date().toISOString().split('T')[0]
    const current = stats ?? { total_xp: 0, total_sessions: 0, streak_days: 0, last_session_date: null }

    let newStreak = 1
    if (current.last_session_date) {
      if (current.last_session_date === today) {
        newStreak = current.streak_days
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        newStreak = current.last_session_date === yesterdayStr
          ? (current.streak_days ?? 0) + 1
          : 1
      }
    }

    const xpGained = calculateXP(newStreak)
    const newTotalXp = current.total_xp + xpGained
    const newTotalSessions = current.total_sessions + 1
    const newLevelNum = getLevel(newTotalXp).level

    const updates = {
      total_xp: newTotalXp,
      total_sessions: newTotalSessions,
      streak_days: newStreak,
      last_session_date: today,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('user_stats').upsert(
      { client_id: profile.id, ...updates },
      { onConflict: 'client_id' }
    )

    const earnedIds = new Set(achievements.map(a => a.achievement_id))
    const stateForCheck = { total_xp: newTotalXp, total_sessions: newTotalSessions, streak_days: newStreak }
    const newlyEarned = ACHIEVEMENTS.filter(a =>
      !earnedIds.has(a.id) && a.condition(stateForCheck, newLevelNum)
    )

    if (newlyEarned.length > 0) {
      await supabase.from('user_achievements').insert(
        newlyEarned.map(a => ({ client_id: profile.id, achievement_id: a.id }))
      )
    }

    setStats(prev => ({ ...(prev ?? { client_id: profile.id }), ...updates }))
    setAchievements(prev => [
      ...prev,
      ...newlyEarned.map(a => ({ achievement_id: a.id, earned_at: new Date().toISOString() })),
    ])

    return { xpGained, newStreak, totalXp: newTotalXp, newAchievements: newlyEarned }
  }

  return (
    <StatsContext.Provider value={{ stats, achievements, onSessionComplete }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  return useContext(StatsContext)
}
