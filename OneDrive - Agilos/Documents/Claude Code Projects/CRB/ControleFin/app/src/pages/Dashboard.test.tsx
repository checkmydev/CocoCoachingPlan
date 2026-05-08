// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('renders 4 KPI cards', () => {
    render(<Dashboard />)
    expect(screen.getByText('Budget consommé')).toBeInTheDocument()
    expect(screen.getByText('Cash disponible')).toBeInTheDocument()
    expect(screen.getByText('Taux subsides')).toBeInTheDocument()
    expect(screen.getByText('Coûts RH')).toBeInTheDocument()
  })

  it('renders the budget vs réel chart section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Budget vs Réel par centre')).toBeInTheDocument()
  })

  it('renders the monthly expenses chart section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dépenses mensuelles')).toBeInTheDocument()
  })

  it('renders the expenses by nature chart section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Répartition par nature')).toBeInTheDocument()
  })

  it('renders the alerts panel', () => {
    render(<Dashboard />)
    expect(screen.getByText('Alertes actives')).toBeInTheDocument()
  })

  it('renders at least one alert message', () => {
    render(<Dashboard />)
    expect(screen.getByText(/expire dans/)).toBeInTheDocument()
  })
})
