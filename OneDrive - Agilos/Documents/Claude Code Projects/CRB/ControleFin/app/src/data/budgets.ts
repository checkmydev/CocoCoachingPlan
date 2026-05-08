import type { BudgetLine } from '../types'

export const budgetsData: BudgetLine[] = [
  { id: '1', centre: 'Bruxelles', project: 'Aide alimentaire', category: 'RH', allocated: 150000, spent: 142000 },
  { id: '2', centre: 'Bruxelles', project: 'Aide alimentaire', category: 'Logistique', allocated: 30000, spent: 18000 },
  { id: '3', centre: 'Liège', project: "Hébergement d'urgence", category: 'RH', allocated: 120000, spent: 98000 },
  { id: '4', centre: 'Liège', project: "Hébergement d'urgence", category: 'Énergie', allocated: 25000, spent: 26500 },
  { id: '5', centre: 'Namur', project: 'Formation secouristes', category: 'RH', allocated: 80000, spent: 45000 },
  { id: '6', centre: 'Charleroi', project: 'Aide alimentaire', category: 'RH', allocated: 95000, spent: 91000 },
  { id: '7', centre: 'Charleroi', project: 'Aide alimentaire', category: 'Logistique', allocated: 20000, spent: 19800 },
  { id: '8', centre: 'Gand', project: 'Migration assistance', category: 'RH', allocated: 110000, spent: 78000 },
  { id: '9', centre: 'Bruges', project: 'Aide alimentaire', category: 'Admin', allocated: 15000, spent: 5000 },
]

export const centres = ['Tous', 'Bruxelles', 'Liège', 'Namur', 'Charleroi', 'Gand', 'Bruges']
export const projects = ['Tous', 'Aide alimentaire', "Hébergement d'urgence", 'Formation secouristes', 'Migration assistance']
