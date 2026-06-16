import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/Logo'
import { OBJECTIVES } from '../../lib/tips'

const MOOV_GREEN = '#39E229'

const STEPS = [
  'Informations personnelles',
  'Historique médical',
  'Objectifs & engagement',
]

const SCALE_LABELS = {
  interest:      'Intérêt pour votre santé / sport',
  motivation:    'Motivation actuelle',
  confidence:    'Confiance en vous',
  availability:  'Disponibilité hebdomadaire',
}

function ScaleInput({ name, label, value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(name, n)}
            className="w-9 h-9 rounded-lg text-sm font-semibold border-2 transition-all"
            style={
              value === n
                ? { backgroundColor: MOOV_GREEN, borderColor: MOOV_GREEN, color: '#000' }
                : { backgroundColor: '#fff', borderColor: '#d1d5db', color: '#374151' }
            }
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>Faible</span>
        <span>Élevé</span>
      </div>
    </div>
  )
}

export default function Onboarding({ onComplete, onCancel, initialData = {}, save, editMode = false }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    first_name: initialData.first_name ?? '',
    last_name: initialData.last_name ?? '',
    phone: initialData.phone ?? '',
    uses_whatsapp: initialData.uses_whatsapp ?? false,
    gender: initialData.gender ?? '',
    birth_date: initialData.birth_date ?? '',
    height_cm: initialData.height_cm ?? '',
    weight_kg: initialData.weight_kg ?? '',
    postal_code: initialData.postal_code ?? '',
    city: initialData.city ?? '',
    address: initialData.address ?? '',
    emergency_contact: initialData.emergency_contact ?? '',
    medical_history: initialData.medical_history ?? '',
    trauma_history: initialData.trauma_history ?? '',
    current_treatments: initialData.current_treatments ?? '',
    allergies: initialData.allergies ?? '',
    exercise_contraindications: initialData.exercise_contraindications ?? '',
    special_precautions: initialData.special_precautions ?? '',
    personal_stakes: initialData.personal_stakes ?? '',
    personal_objectives: initialData.personal_objectives ?? '',
    selected_objectives: initialData.selected_objectives ?? [],
    scale_interest: initialData.scale_interest ?? null,
    scale_motivation: initialData.scale_motivation ?? null,
    scale_confidence: initialData.scale_confidence ?? null,
    scale_availability: initialData.scale_availability ?? null,
  })

  const imc = useMemo(() => {
    const h = parseFloat(form.height_cm)
    const w = parseFloat(form.weight_kg)
    if (h > 0 && w > 0) return (w / Math.pow(h / 100, 2)).toFixed(1)
    return null
  }, [form.height_cm, form.weight_kg])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleScale(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function toggleObjective(id) {
    setForm(prev => {
      const arr = prev.selected_objectives || []
      return {
        ...prev,
        selected_objectives: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id],
      }
    })
  }

  function nextStep() {
    setStep(s => Math.min(s + 1, 3))
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      completed_at: new Date().toISOString(),
    }
    const { error: saveError } = await save(payload)
    setSaving(false)
    if (saveError) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } else {
      onComplete()
    }
  }

  const progressPercent = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
            <Logo size="sm" />
          </div>
          <span className="font-semibold text-gray-800 flex-1">
            {editMode ? 'Mon profil' : 'Bienvenue — Profil personnel'}
          </span>
          {editMode
            ? <button onClick={onCancel}
                className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
                ← Retour
              </button>
            : <button
                onClick={async () => { await supabase.auth.signOut(); navigate('/login') }}
                className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors">
                ↩ Déconnexion
              </button>
          }
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: MOOV_GREEN }}
          />
        </div>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 pb-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 my-6">
          {STEPS.map((label, i) => {
            const n = i + 1
            const active = n === step
            const done = n < step
            return (
              <div key={n} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                    style={
                      done
                        ? { backgroundColor: MOOV_GREEN, borderColor: MOOV_GREEN, color: '#000' }
                        : active
                        ? { backgroundColor: '#fff', borderColor: MOOV_GREEN, color: '#000' }
                        : { backgroundColor: '#fff', borderColor: '#d1d5db', color: '#9ca3af' }
                    }
                  >
                    {done ? '✓' : n}
                  </div>
                  <span
                    className="text-xs mt-1 text-center hidden sm:block"
                    style={{ color: active ? '#000' : done ? '#6b7280' : '#9ca3af', maxWidth: 80 }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="w-10 h-0.5 mb-5 transition-all"
                    style={{ backgroundColor: done ? MOOV_GREEN : '#e5e7eb' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1">{STEPS[step - 1]}</h2>
          <p className="text-sm text-gray-500 mb-5">Étape {step} sur {STEPS.length}</p>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': MOOV_GREEN }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange} type="tel"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" name="uses_whatsapp" checked={form.uses_whatsapp} onChange={handleChange}
                    className="w-4 h-4 rounded" style={{ accentColor: MOOV_GREEN }} />
                  Utilise WhatsApp sur ce numéro
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select name="gender" value={form.gender} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2">
                    <option value="">Choisir...</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <input name="birth_date" value={form.birth_date} onChange={handleChange} type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
                  <input name="height_cm" value={form.height_cm} onChange={handleChange} type="number" min={100} max={250}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                  <input name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" min={30} max={300} step={0.1}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                </div>
              </div>

              {imc && (
                <div className="rounded-xl p-3 text-sm font-medium text-center"
                  style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                  IMC calculé : <span className="font-bold text-lg">{imc}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {parseFloat(imc) < 18.5 ? '(Insuffisance pondérale)'
                      : parseFloat(imc) < 25 ? '(Poids normal)'
                      : parseFloat(imc) < 30 ? '(Surpoids)'
                      : '(Obésité)'}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'urgence</label>
                <input name="emergency_contact" value={form.emergency_contact} onChange={handleChange}
                  placeholder="Nom + téléphone"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
                Ces informations sont confidentielles et uniquement accessibles à votre coach. Tous les champs sont optionnels.
              </p>

              {[
                { name: 'medical_history',           label: 'Historique médical',                   placeholder: 'Maladies chroniques, opérations, hospitalisations...' },
                { name: 'trauma_history',            label: 'Traumatismes / blessures passées',     placeholder: 'Entorses, fractures, hernies, etc.' },
                { name: 'current_treatments',        label: 'Traitements en cours',                 placeholder: 'Médicaments, suppléments...' },
                { name: 'allergies',                 label: 'Allergies',                            placeholder: 'Alimentaires, médicamenteuses...' },
                { name: 'exercise_contraindications',label: 'Contre-indications à l\'exercice',    placeholder: 'Mouvements ou efforts à éviter...' },
                { name: 'special_precautions',       label: 'Précautions particulières',            placeholder: 'Informations complémentaires utiles pour votre coach...' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea name={name} value={form[name]} onChange={handleChange} rows={3}
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none" />
                </div>
              ))}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Sélection d'objectifs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes objectifs sportifs
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Sélectionnez les objectifs qui vous correspondent — vous recevrez des conseils personnalisés 2× par semaine.
                </p>
                <div className="flex flex-col gap-2">
                  {OBJECTIVES.map(obj => {
                    const selected = (form.selected_objectives || []).includes(obj.id)
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => toggleObjective(obj.id)}
                        className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all"
                        style={selected
                          ? { borderColor: MOOV_GREEN, backgroundColor: '#f0fdf4' }
                          : { borderColor: '#e5e7eb', backgroundColor: '#fff' }
                        }
                      >
                        <span className="text-2xl">{obj.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{obj.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{obj.subtitle}</p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={selected
                            ? { borderColor: MOOV_GREEN, backgroundColor: MOOV_GREEN }
                            : { borderColor: '#d1d5db' }
                          }
                        >
                          {selected && <span className="text-black text-xs font-bold">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mes enjeux personnels</label>
                <textarea name="personal_stakes" value={form.personal_stakes} onChange={handleChange} rows={3}
                  placeholder="Pourquoi avez-vous décidé de faire appel à un coach ? Qu'est-ce qui est important pour vous ?"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none" />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Auto-évaluation (1 = faible, 7 = élevé)</h3>
                <ScaleInput name="scale_interest"    label={SCALE_LABELS.interest}    value={form.scale_interest}    onChange={handleScale} />
                <ScaleInput name="scale_motivation"  label={SCALE_LABELS.motivation}  value={form.scale_motivation}  onChange={handleScale} />
                <ScaleInput name="scale_confidence"  label={SCALE_LABELS.confidence}  value={form.scale_confidence}  onChange={handleScale} />
                <ScaleInput name="scale_availability"label={SCALE_LABELS.availability}value={form.scale_availability}onChange={handleScale} />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            {step > 1 && (
              <button type="button" onClick={prevStep}
                className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={nextStep}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors"
                style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
                Continuer →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={saving}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-60"
                style={{ backgroundColor: MOOV_GREEN, color: '#000' }}>
                {saving ? 'Enregistrement...' : editMode ? 'Sauvegarder ✓' : 'Terminer et accéder à l\'app ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
