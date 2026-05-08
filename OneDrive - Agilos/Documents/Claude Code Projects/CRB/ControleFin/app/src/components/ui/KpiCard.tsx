import type { KpiStatus, Trend } from '../../types'
import { formatCurrency } from '../../utils/format'

const STATUS_BORDER: Record<KpiStatus, string> = {
  ok: 'border-l-green-500',
  warning: 'border-l-orange-400',
  critical: 'border-l-red-500',
}

const TREND_ICON: Record<Trend, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
}

interface KpiCardProps {
  title: string
  value: number
  unit: string
  trend: Trend
  trendValue: string
  status: KpiStatus
}

function displayValue(value: number, unit: string): string {
  if (unit === '€') return formatCurrency(value).replace(' €', '')
  return String(value)
}

export function KpiCard({ title, value, unit, trend, trendValue, status }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${STATUS_BORDER[status]}`}>
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-gray-900">{displayValue(value, unit)}</span>
        <span className="text-xl text-gray-600">{unit}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {TREND_ICON[trend]} <span>{trendValue}</span>
      </p>
    </div>
  )
}
