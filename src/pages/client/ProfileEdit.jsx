import { useNavigate } from 'react-router-dom'
import { useClientProfile } from '../../hooks/useClientProfile'
import Onboarding from './Onboarding'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { clientProfile, loading, saveClientProfile } = useClientProfile()

  async function handleSave(payload) {
    return saveClientProfile({ ...payload, completed_at: clientProfile?.completed_at })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <Onboarding
      editMode
      initialData={clientProfile ?? {}}
      save={handleSave}
      onComplete={() => navigate(-1)}
      onCancel={() => navigate(-1)}
    />
  )
}
