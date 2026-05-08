import { useState } from 'react'
import { validationsData } from '../data/validations'
import { formatCurrency } from '../utils/format'
import type { DocStatus, ValidationDocument } from '../types'

const TAB_LABELS: Record<DocStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvés',
  rejected: 'Rejetés',
}

const DOC_TYPE_STYLES: Record<string, string> = {
  Facture: 'bg-blue-100 text-blue-700',
  Contrat: 'bg-purple-100 text-purple-700',
  Convention: 'bg-teal-100 text-teal-700',
}

export function ValidationWorkflow() {
  const [docs, setDocs] = useState<ValidationDocument[]>(validationsData)
  const [activeTab, setActiveTab] = useState<DocStatus>('pending')

  function changeStatus(id: string, newStatus: 'approved' | 'rejected') {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)))
  }

  const filtered = docs.filter((d) => d.status === activeTab)
  const pendingCount = docs.filter((d) => d.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['pending', 'approved', 'rejected'] as DocStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-crb-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {TAB_LABELS[tab]}
            {tab === 'pending' && pendingCount > 0 && (
              <span className="ml-2 bg-crb-red text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400 text-sm">
          Aucun document dans cette catégorie
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${DOC_TYPE_STYLES[doc.type]}`}
              >
                {doc.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doc.centre} · {doc.requester} · {doc.date}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {doc.amount > 0 ? formatCurrency(doc.amount) : '—'}
                </p>
              </div>
              {activeTab === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => changeStatus(doc.id, 'approved')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => changeStatus(doc.id, 'rejected')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
