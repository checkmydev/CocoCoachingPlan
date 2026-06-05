import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useExercises } from '../../hooks/useExercises'
import VideoPlayer from '../../components/VideoPlayer'
import { detectVideoType } from '../../lib/videoUtils'

const MUSCLE_GROUPS = ['Dos', 'Pectoraux', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Abdominaux', 'Full body']
const EQUIPMENT = ['Haltères', 'Barre', 'Machine', 'Câble', 'Poids du corps', 'Bandes élastiques', 'Kettlebell']
const EMPTY = { name: '', description: '', instructions: '', muscle_groups: [], equipment: [], video_url: '', thumbnail_url: '' }

export default function ExerciseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { exercises, createExercise, updateExercise } = useExercises()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [videoMode, setVideoMode] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const ex = exercises.find(e => e.id === id)
      if (ex) setForm({
        name: ex.name ?? '',
        description: ex.description ?? '',
        instructions: ex.instructions ?? '',
        muscle_groups: ex.muscle_groups ?? [],
        equipment: ex.equipment ?? [],
        video_url: ex.video_url ?? '',
        thumbnail_url: ex.thumbnail_url ?? '',
      })
    }
  }, [id, exercises])

  function toggle(field, value) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value]
    }))
  }

  async function handleVideoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `videos/${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const { data, error: uploadError } = await supabase.storage.from('exercises').upload(path, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('exercises').getPublicUrl(data.path)
      setForm(f => ({ ...f, video_url: publicUrl }))
    } else {
      setError(`Upload échoué: ${uploadError.message}`)
    }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...form, video_type: detectVideoType(form.video_url) }
    const { error: saveError } = isEdit
      ? await updateExercise(id, payload)
      : await createExercise(payload)
    if (saveError) { setError(saveError.message); setSaving(false); return }
    navigate('/coach/exercises')
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Modifier' : 'Nouvel'} exercice</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea rows={4} value={form.instructions}
            onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Groupes musculaires</label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map(m => (
              <button type="button" key={m} onClick={() => toggle('muscle_groups', m)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.muscle_groups.includes(m)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                }`}>{m}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Équipement</label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map(eq => (
              <button type="button" key={eq} onClick={() => toggle('equipment', eq)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.equipment.includes(eq)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 hover:border-green-400'
                }`}>{eq}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vidéo</label>
          <div className="flex gap-2 mb-3">
            {['url', 'upload'].map(mode => (
              <button type="button" key={mode} onClick={() => setVideoMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm ${videoMode === mode ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
                {mode === 'url' ? 'Lien URL' : 'Upload fichier'}
              </button>
            ))}
          </div>
          {videoMode === 'url' ? (
            <input placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
              value={form.video_url}
              onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          ) : (
            <div>
              <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="text-sm" />
              {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
            </div>
          )}
          {form.video_url && <div className="mt-3"><VideoPlayer url={form.video_url} /></div>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => navigate('/coach/exercises')}
            className="border px-6 py-2 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
