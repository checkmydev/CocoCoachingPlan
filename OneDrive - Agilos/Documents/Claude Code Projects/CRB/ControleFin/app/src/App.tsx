import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { BudgetControl } from './pages/BudgetControl'
import { SubsidyManagement } from './pages/SubsidyManagement'
import { ValidationWorkflow } from './pages/ValidationWorkflow'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budget" element={<BudgetControl />} />
        <Route path="/subsidies" element={<SubsidyManagement />} />
        <Route path="/validations" element={<ValidationWorkflow />} />
      </Route>
    </Routes>
  )
}
