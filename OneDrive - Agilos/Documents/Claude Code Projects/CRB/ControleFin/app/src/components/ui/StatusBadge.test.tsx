import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders "Actif" for active status', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('renders "En clôture" for closing status', () => {
    render(<StatusBadge status="closing" />)
    expect(screen.getByText('En clôture')).toBeInTheDocument()
  })

  it('renders "Expiré" for expired status', () => {
    render(<StatusBadge status="expired" />)
    expect(screen.getByText('Expiré')).toBeInTheDocument()
  })

  it('renders "Suspendu" for suspended status', () => {
    render(<StatusBadge status="suspended" />)
    expect(screen.getByText('Suspendu')).toBeInTheDocument()
  })

  it('renders "Critique" for critical status', () => {
    render(<StatusBadge status="critical" />)
    expect(screen.getByText('Critique')).toBeInTheDocument()
  })

  it('renders "Attention" for warning status', () => {
    render(<StatusBadge status="warning" />)
    expect(screen.getByText('Attention')).toBeInTheDocument()
  })
})
