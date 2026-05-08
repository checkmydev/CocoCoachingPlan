import { subsidiesData } from '../data/subsidies'
import { StatusBadge } from '../components/ui/StatusBadge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatCurrency, daysUntil } from '../utils/format'
import type { Subside } from '../types'

const STATUS_ORDER: Record<Subside['status'], number> = {
  closing: 0,
  expired: 1,
  active: 2,
  suspended: 3,
}

function DaysLabel({ endDate, status }: { endDate: string; status: Subside['status'] }) {
  if (status === 'expired') return null
  if (status === 'suspended') return null
  const days = daysUntil(endDate)
  const color = days < 0 ? 'text-red-600' : days < 30 ? 'text-orange-600' : 'text-gray-500'
  return <span className={`text-xs font-medium ${color}`}>{days < 0 ? 'Expiré' : `${days}j restants`}</span>
}

export function SubsidyManagement() {
  const sorted = [...subsidiesData].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
  )

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-700">Subsides actifs et en cours</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((s) => {
          const pct = s.totalAmount > 0 ? (s.consumedAmount / s.totalAmount) * 100 : 0
          return (
            <div key={s.id} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.bailleur}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{formatCurrency(s.consumedAmount)} consommés</span>
                  <span>sur {formatCurrency(s.totalAmount)}</span>
                </div>
                <ProgressBar value={pct} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{Math.round(pct)}% consommé</span>
                  <DaysLabel endDate={s.endDate} status={s.status} />
                </div>
              </div>
              <div className="text-xs text-gray-400 border-t pt-3">
                {s.startDate} → {s.endDate}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
