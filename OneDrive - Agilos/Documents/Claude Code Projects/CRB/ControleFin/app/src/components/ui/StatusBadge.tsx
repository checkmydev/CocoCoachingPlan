import type { BadgeStatus } from '../../types'

const BADGE_STYLES: Record<BadgeStatus, string> = {
  ok: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  closing: 'bg-orange-100 text-orange-800',
  expired: 'bg-gray-100 text-gray-600',
  suspended: 'bg-purple-100 text-purple-800',
}

const BADGE_LABELS: Record<BadgeStatus, string> = {
  ok: 'OK',
  warning: 'Attention',
  critical: 'Critique',
  active: 'Actif',
  closing: 'En clôture',
  expired: 'Expiré',
  suspended: 'Suspendu',
}

interface StatusBadgeProps {
  status: BadgeStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[status]}`}
    >
      {BADGE_LABELS[status]}
    </span>
  )
}
