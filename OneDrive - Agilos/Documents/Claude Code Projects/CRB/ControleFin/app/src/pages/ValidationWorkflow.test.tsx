import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ValidationWorkflow } from './ValidationWorkflow'

describe('ValidationWorkflow', () => {
  it('renders the three tabs', () => {
    render(<ValidationWorkflow />)
    expect(screen.getByText(/En attente/)).toBeInTheDocument()
    expect(screen.getByText('Approuvés')).toBeInTheDocument()
    expect(screen.getByText('Rejetés')).toBeInTheDocument()
  })

  it('shows pending documents on initial render', () => {
    render(<ValidationWorkflow />)
    expect(screen.getByText('Fournitures colis alimentaires — Lidl Bruxelles')).toBeInTheDocument()
  })

  it('renders Approuver and Rejeter buttons for pending documents', () => {
    render(<ValidationWorkflow />)
    const approveButtons = screen.getAllByText('Approuver')
    expect(approveButtons.length).toBeGreaterThan(0)
    const rejectButtons = screen.getAllByText('Rejeter')
    expect(rejectButtons.length).toBeGreaterThan(0)
  })

  it('moves a document to Approuvés tab after clicking Approuver', () => {
    render(<ValidationWorkflow />)
    const approveButtons = screen.getAllByText('Approuver')
    fireEvent.click(approveButtons[0])
    fireEvent.click(screen.getByText('Approuvés'))
    expect(screen.getByText('Fournitures colis alimentaires — Lidl Bruxelles')).toBeInTheDocument()
  })

  it('moves a document to Rejetés tab after clicking Rejeter', () => {
    render(<ValidationWorkflow />)
    const rejectButtons = screen.getAllByText('Rejeter')
    fireEvent.click(rejectButtons[0])
    fireEvent.click(screen.getByText('Rejetés'))
    expect(screen.getByText('Fournitures colis alimentaires — Lidl Bruxelles')).toBeInTheDocument()
  })
})
