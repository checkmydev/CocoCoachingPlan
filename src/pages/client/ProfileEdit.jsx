import { useNavigate } from 'react-router-dom'
import { useClientProfile } from '../../hooks/useClientProfile'
import Onboarding from './Onboarding'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { clientProfile, saveClientProfile } = useClientProfile()

  async function handleSave(payload) {
    // Préserver completed_at existant
    return saveClientProfile({ ...payload, completed_at: clientProfile?.completed_at })
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
