import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('renders the page title', () => {
    render(<Header title="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders a different title', () => {
    render(<Header title="Contrôle budgétaire" />)
    expect(screen.getByText('Contrôle budgétaire')).toBeInTheDocument()
  })
})
