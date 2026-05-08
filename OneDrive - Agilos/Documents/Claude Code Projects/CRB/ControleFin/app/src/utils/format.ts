export function formatCurrency(value: number): string {
  return (
    new Intl.NumberFormat('fr-BE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' €'
  )
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
