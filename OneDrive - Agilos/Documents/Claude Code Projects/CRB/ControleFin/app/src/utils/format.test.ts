import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPercentage, daysUntil } from './format'

describe('formatCurrency', () => {
  it('includes the numeric value and € symbol', () => {
    const result = formatCurrency(284500)
    expect(result).toContain('284')
    expect(result).toContain('500')
    expect(result).toContain('€')
  })
  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0')
    expect(formatCurrency(0)).toContain('€')
  })
})

describe('formatPercentage', () => {
  it('appends % sign', () => {
    expect(formatPercentage(67)).toBe('67%')
  })
  it('rounds to nearest integer', () => {
    expect(formatPercentage(66.6)).toBe('67%')
  })
})

describe('daysUntil', () => {
  it('returns positive days for a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    const dateStr = future.toISOString().split('T')[0]
    expect(daysUntil(dateStr)).toBe(10)
  })
  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(daysUntil(today)).toBe(0)
  })
  it('returns negative days for a past date', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    const dateStr = past.toISOString().split('T')[0]
    expect(daysUntil(dateStr)).toBe(-5)
  })
})
