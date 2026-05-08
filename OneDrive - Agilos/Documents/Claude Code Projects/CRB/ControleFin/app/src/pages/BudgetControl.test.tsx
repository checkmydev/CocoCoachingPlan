import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { BudgetControl } from './BudgetControl'

describe('BudgetControl', () => {
  it('renders filter dropdowns', () => {
    render(<BudgetControl />)
    expect(screen.getByLabelText('Centre')).toBeInTheDocument()
    expect(screen.getByLabelText('Projet')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<BudgetControl />)
    expect(screen.getByText('Catégorie')).toBeInTheDocument()
    expect(screen.getByText('Alloué')).toBeInTheDocument()
    expect(screen.getByText('Dépensé')).toBeInTheDocument()
    expect(screen.getByText('Restant')).toBeInTheDocument()
  })

  it('renders all budget lines by default', () => {
    render(<BudgetControl />)
    const tbody = screen.getAllByRole('row')
    const textContent = tbody.map((r) => r.textContent).join(' ')
    expect(textContent).toContain('Bruxelles')
    expect(textContent).toContain('Liège')
  })

  it('filters by centre when selected — table shows only selected centre rows', () => {
    render(<BudgetControl />)
    const select = screen.getByLabelText('Centre')
    fireEvent.change(select, { target: { value: 'Namur' } })
    const table = screen.getByRole('table')
    const tableText = within(table).getAllByRole('row').map((r) => r.textContent).join(' ')
    expect(tableText).toContain('Namur')
    expect(tableText).not.toContain('Bruxelles')
  })
})
