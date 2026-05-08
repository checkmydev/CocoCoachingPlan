interface ProgressBarProps {
  value: number
  showLabel?: boolean
}

function getBarColor(value: number): string {
  if (value > 90) return 'bg-red-500'
  if (value > 75) return 'bg-orange-400'
  return 'bg-green-500'
}

export function ProgressBar({ value, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="w-full">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor(clamped)}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1 block">{clamped}%</span>
      )}
    </div>
  )
}
