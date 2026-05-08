import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders the app name', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(screen.getByText('CRB Finance Hub')).toBeInTheDocument()
  })

  it('renders Dashboard navigation link', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders Contrôle budgétaire navigation link', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(screen.getByText('Contrôle budgétaire')).toBeInTheDocument()
  })

  it('renders Subsides navigation link', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(screen.getByText('Subsides')).toBeInTheDocument()
  })

  it('renders Validations navigation link', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(screen.getByText('Validations')).toBeInTheDocument()
  })
})
