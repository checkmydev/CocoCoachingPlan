import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

describe('KpiCard', () => {
  const baseProps = {
    title: 'Budget consommé',
    value: 67,
    unit: '%',
    trend: 'up' as const,
    trendValue: '+3% vs mois dernier',
    status: 'ok' as const,
  }

  it('renders the title', () => {
    render(<KpiCard {...baseProps} />)
    expect(screen.getByText('Budget consommé')).toBeInTheDocument()
  })

  it('renders the value', () => {
    render(<KpiCard {...baseProps} />)
    expect(screen.getByText('67')).toBeInTheDocument()
  })

  it('renders the unit', () => {
    render(<KpiCard {...baseProps} />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders the trendValue', () => {
    render(<KpiCard {...baseProps} />)
    expect(screen.getByText('+3% vs mois dernier')).toBeInTheDocument()
  })

  it('renders € unit for currency values', () => {
    render(<KpiCard {...baseProps} value={284500} unit="€" />)
    expect(screen.getByText('€')).toBeInTheDocument()
  })
})
