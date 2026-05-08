import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubsidyManagement } from './SubsidyManagement'

describe('SubsidyManagement', () => {
  it('renders the list heading', () => {
    render(<SubsidyManagement />)
    expect(screen.getByText('Subsides actifs et en cours')).toBeInTheDocument()
  })

  it('renders all 5 subsidies', () => {
    render(<SubsidyManagement />)
    expect(screen.getByText('Plan de cohésion sociale 2024-2026')).toBeInTheDocument()
    expect(screen.getByText('Fonds Social Européen+')).toBeInTheDocument()
    expect(screen.getByText('Programme aide alimentaire')).toBeInTheDocument()
    expect(screen.getByText('Subvention fédérale insertion')).toBeInTheDocument()
    expect(screen.getByText('Dotation Province Brabant Wallon')).toBeInTheDocument()
  })

  it('renders bailleur names', () => {
    render(<SubsidyManagement />)
    expect(screen.getByText('Wallonie')).toBeInTheDocument()
    expect(screen.getByText('Union Européenne')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<SubsidyManagement />)
    expect(screen.getByText('En clôture')).toBeInTheDocument()
    expect(screen.getByText('Expiré')).toBeInTheDocument()
    expect(screen.getByText('Suspendu')).toBeInTheDocument()
  })
})
