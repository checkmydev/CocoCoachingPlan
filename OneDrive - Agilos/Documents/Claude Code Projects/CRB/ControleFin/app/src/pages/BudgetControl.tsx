import { useState } from 'react'
import { budgetsData, centres, projects } from '../data/budgets'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatCurrency } from '../utils/format'

export function BudgetControl() {
  const [selectedCentre, setSelectedCentre] = useState('Tous')
  const [selectedProject, setSelectedProject] = useState('Tous')

  const filtered = budgetsData.filter((line) => {
    const centreMatch = selectedCentre === 'Tous' || line.centre === selectedCentre
    const projectMatch = selectedProject === 'Tous' || line.project === selectedProject
    return centreMatch && projectMatch
  })

  const totals = filtered.reduce(
    (acc, line) => ({
      allocated: acc.allocated + line.allocated,
      spent: acc.spent + line.spent,
    }),
    { allocated: 0, spent: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-6 items-end">
        <div>
          <label htmlFor="centre-filter" className="sr-only">
            Filtrer par centre
          </label>
          <select
            id="centre-filter"
            aria-label="Centre"
            value={selectedCentre}
            onChange={(e) => setSelectedCentre(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crb-navy"
          >
            {centres.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project-filter" className="sr-only">
            Filtrer par projet
          </label>
          <select
            id="project-filter"
            aria-label="Projet"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crb-navy"
          >
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500 ml-auto">
          {filtered.length} ligne{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Centre', 'Projet', 'Catégorie', 'Alloué', 'Dépensé', 'Restant', 'Avancement'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((line) => {
              const pct = (line.spent / line.allocated) * 100
              const remaining = line.allocated - line.spent
              const rowClass = pct > 100 ? 'bg-red-50' : ''
              return (
                <tr key={line.id} className={`hover:bg-gray-50 ${rowClass}`}>
                  <td className="px-4 py-3 text-gray-700">{line.centre}</td>
                  <td className="px-4 py-3 text-gray-700">{line.project}</td>
                  <td className="px-4 py-3 text-gray-500">{line.category}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(line.allocated)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(line.spent)}</td>
                  <td className={`px-4 py-3 font-medium ${remaining < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatCurrency(remaining)}
                  </td>
                  <td className="px-4 py-3 w-40">
                    <ProgressBar value={pct} showLabel />
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan={3} className="px-4 py-3 font-semibold text-gray-700">Total</td>
              <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(totals.allocated)}</td>
              <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(totals.spent)}</td>
              <td className={`px-4 py-3 font-semibold ${totals.allocated - totals.spent < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(totals.allocated - totals.spent)}
              </td>
              <td className="px-4 py-3 w-40">
                <ProgressBar value={(totals.spent / totals.allocated) * 100} showLabel />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
