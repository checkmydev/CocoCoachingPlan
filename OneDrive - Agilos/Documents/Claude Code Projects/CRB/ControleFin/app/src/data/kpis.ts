import type { Kpi, Alert, BudgetVsReelPoint, MonthlyPoint, ChartPoint } from '../types'

export const kpisData: Kpi[] = [
  {
    id: 'budget-consumed',
    label: 'Budget consommé',
    value: 81,
    unit: '%',
    trend: 'up',
    trendValue: '+3% vs mois dernier',
    status: 'warning',
  },
  {
    id: 'cash-available',
    label: 'Cash disponible',
    value: 284500,
    unit: '€',
    trend: 'down',
    trendValue: '-12% vs mois dernier',
    status: 'warning',
  },
  {
    id: 'subsidy-rate',
    label: 'Taux subsides',
    value: 83,
    unit: '%',
    trend: 'stable',
    trendValue: 'Stable',
    status: 'ok',
  },
  {
    id: 'hr-costs',
    label: 'Coûts RH',
    value: 1240000,
    unit: '€',
    trend: 'up',
    trendValue: '+5% vs budget',
    status: 'warning',
  },
]

export const alertsData: Alert[] = [
  { id: 'a1', message: 'Subside "Plan cohésion sociale" expire dans 22 jours', severity: 'critical' },
  { id: 'a2', message: 'Centre Charleroi : budget logistique à 99%', severity: 'critical' },
  { id: 'a3', message: 'Cash disponible en baisse de 12% ce mois', severity: 'warning' },
  { id: 'a4', message: '5 documents en attente de validation', severity: 'warning' },
  { id: 'a5', message: 'Subside ACODEV expiré — 2 000 € non justifiés', severity: 'critical' },
]

export const budgetVsReelData: BudgetVsReelPoint[] = [
  { centre: 'BXL', budget: 180000, reel: 160000 },
  { centre: 'LGE', budget: 145000, reel: 124500 },
  { centre: 'NAM', budget: 80000, reel: 45000 },
  { centre: 'CHA', budget: 115000, reel: 110800 },
  { centre: 'GND', budget: 110000, reel: 78000 },
  { centre: 'BRG', budget: 15000, reel: 5000 },
]

export const monthlyExpensesData: MonthlyPoint[] = [
  { month: 'Mai 25', amount: 145000 },
  { month: 'Juin 25', amount: 162000 },
  { month: 'Juil 25', amount: 138000 },
  { month: 'Août 25', amount: 120000 },
  { month: 'Sep 25', amount: 155000 },
  { month: 'Oct 25', amount: 168000 },
  { month: 'Nov 25', amount: 172000 },
  { month: 'Déc 25', amount: 195000 },
  { month: 'Jan 26', amount: 158000 },
  { month: 'Fév 26', amount: 163000 },
  { month: 'Mar 26', amount: 170000 },
  { month: 'Avr 26', amount: 178000 },
]

export const expensesByNatureData: ChartPoint[] = [
  { name: 'RH', value: 454000 },
  { name: 'Logistique', value: 37800 },
  { name: 'Énergie', value: 26500 },
  { name: 'Admin', value: 5000 },
]
