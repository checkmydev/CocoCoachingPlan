import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/coach/Dashboard'
import ExerciseList from './pages/coach/ExerciseList'
import ExerciseForm from './pages/coach/ExerciseForm'
import ProgramList from './pages/coach/ProgramList'
import ProgramBuilder from './pages/coach/ProgramBuilder'
import ClientList from './pages/coach/ClientList'
import ClientDetail from './pages/coach/ClientDetail'
import MyPrograms from './pages/client/MyPrograms'
import ProgramDetail from './pages/client/ProgramDetail'
import ActiveSession from './pages/client/ActiveSession'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/coach" element={<ProtectedRoute role="coach" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exercises" element={<ExerciseList />} />
          <Route path="exercises/new" element={<ExerciseForm />} />
          <Route path="exercises/:id" element={<ExerciseForm />} />
          <Route path="programs" element={<ProgramList />} />
          <Route path="programs/new" element={<ProgramBuilder />} />
          <Route path="programs/:id" element={<ProgramBuilder />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetail />} />
        </Route>
        <Route path="/client" element={<ProtectedRoute role="client" />}>
          <Route path="programs" element={<MyPrograms />} />
          <Route path="programs/:id" element={<ProgramDetail />} />
          <Route path="session/:id" element={<ActiveSession />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
