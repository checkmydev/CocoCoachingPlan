export const LEVELS = [
  { level: 1, minXp: 0,    title: 'Débutant',   color: '#6B7280' },
  { level: 2, minXp: 100,  title: 'Motivé',     color: '#3B82F6' },
  { level: 3, minXp: 300,  title: 'Régulier',   color: '#10B981' },
  { level: 4, minXp: 600,  title: 'Endurant',   color: '#F59E0B' },
  { level: 5, minXp: 1000, title: 'Athlète',    color: '#EF4444' },
  { level: 6, minXp: 1800, title: 'Champion',   color: '#8B5CF6' },
  { level: 7, minXp: 3000, title: 'Légende',    color: '#EC4899' },
]

export const ACHIEVEMENTS = [
  { id: 'first_session', name: 'Premier pas',        description: 'Complète ta 1ère séance',       emoji: '🏃', condition: (s) => s.total_sessions >= 1 },
  { id: 'sessions_5',    name: 'Engagé',             description: '5 séances complétées',           emoji: '⭐', condition: (s) => s.total_sessions >= 5 },
  { id: 'sessions_10',   name: 'Déterminé',          description: '10 séances complétées',          emoji: '🌟', condition: (s) => s.total_sessions >= 10 },
  { id: 'sessions_25',   name: 'Warrior',            description: '25 séances complétées',          emoji: '💪', condition: (s) => s.total_sessions >= 25 },
  { id: 'sessions_50',   name: 'Athlète accompli',   description: '50 séances complétées',          emoji: '💎', condition: (s) => s.total_sessions >= 50 },
  { id: 'streak_3',      name: 'En feu',             description: '3 sessions en 3 jours consécutifs', emoji: '🔥', condition: (s) => s.streak_days >= 3 },
  { id: 'streak_7',      name: 'Semaine de feu',     description: '7 jours consécutifs',            emoji: '🔥🔥', condition: (s) => s.streak_days >= 7 },
  { id: 'streak_30',     name: 'Inébranlable',       description: '30 jours consécutifs',           emoji: '🏆', condition: (s) => s.streak_days >= 30 },
  { id: 'level_3',       name: 'Régulier confirmé',  description: 'Atteindre le niveau 3',          emoji: '🎯', condition: (s, lv) => lv >= 3 },
  { id: 'level_5',       name: 'Élite',              description: 'Atteindre le niveau 5',          emoji: '🎖️', condition: (s, lv) => lv >= 5 },
]

export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(xp) {
  const current = getLevel(xp)
  return LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function getLevelProgress(xp) {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.minXp - current.minXp
  const done = xp - current.minXp
  return Math.round((done / range) * 100)
}

export function calculateXP(streakDays) {
  const base = 50
  const bonus = Math.min(streakDays * 5, 50)
  return base + bonus
}
