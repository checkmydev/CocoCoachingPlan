export type KpiStatus = 'ok' | 'warning' | 'critical'
export type Trend = 'up' | 'down' | 'stable'
export type BadgeStatus = 'ok' | 'warning' | 'critical' | 'active' | 'closing' | 'expired' | 'suspended'
export type DocType = 'Facture' | 'Contrat' | 'Convention'
export type DocStatus = 'pending' | 'approved' | 'rejected'

export interface Kpi {
  id: string
  label: string
  value: number
  unit: string
  trend: Trend
  trendValue: string
  status: KpiStatus
}

export type Severity = 'critical' | 'warning'

export interface Alert {
  id: string
  message: string
  severity: Severity
}

export interface BudgetVsReelPoint {
  centre: string
  budget: number
  reel: number
}

export interface MonthlyPoint {
  month: string
  amount: number
}

export interface ChartPoint {
  name: string
  value: number
}

export interface BudgetLine {
  id: string
  centre: string
  project: string
  category: string
  allocated: number
  spent: number
}

export interface Subside {
  id: string
  name: string
  bailleur: string
  totalAmount: number
  consumedAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'closing' | 'expired' | 'suspended'
}

export interface ValidationDocument {
  id: string
  type: DocType
  description: string
  amount: number
  centre: string
  requester: string
  date: string
  status: DocStatus
}
