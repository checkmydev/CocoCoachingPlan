import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BudgetControl } from './BudgetControl'

describe('BudgetControl', () => {
  it('renders filter dropdowns', () => {
    render(<BudgetControl />)
    expect(screen.getByLabelText('Centre')).toBeInTheDocument()
    expect(screen.getByLabelText('Projet')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<BudgetControl />)
    expect(screen.getByText('Centre')).toBeInTheDocument()
    expect(screen.getByText('Projet')).toBeInTheDocument()
    expect(screen.getByText('Catégorie')).toBeInTheDocument()
    expect(screen.getByText('Alloué')).toBeInTheDocument()
    expect(screen.getByText('Dépensé')).toBeInTheDocument()
    expect(screen.getByText('Restant')).toBeInTheDocument()
  })

  it('renders all budget lines by default', () => {
    render(<BudgetControl />)
    expect(screen.getAllByText('Bruxelles').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Liège').length).toBeGreaterThan(0)
  })

  it('filters by centre when selected', () => {
    render(<BudgetControl />)
    const select = screen.getByLabelText('Centre')
    fireEvent.change(select, { target: { value: 'Namur' } })
    expect(screen.queryByText('Bruxelles')).not.toBeInTheDocument()
    expect(screen.getAllByText('Namur').length).toBeGreaterThan(0)
  })
})
