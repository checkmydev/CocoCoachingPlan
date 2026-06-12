import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('password') // 'password' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Auto-redirect if a session already exists (e.g. after clicking invite / magic link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirectByRole(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        redirectByRole(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function redirectByRole(userId) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', userId).single()
    navigate(
      profile?.role === 'coach' ? '/coach/dashboard' : '/client/programs',
      { replace: true }
    )
  }

  async function handlePasswordLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    await redirectByRole(data.user.id)
  }

  async function handleMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const redirectTo = window.location.origin + (window.location.pathname || '/')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setInfo(`Lien de connexion envoyé à ${email} — vérifiez vos emails !`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">CoachApp</h1>

        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}
        {info  && <p className="text-green-600 text-sm bg-green-50 p-3 rounded">{info}</p>}

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-3">
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" placeholder="Mot de passe" value={password}
              onChange={e => setPassword(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <p className="text-sm text-gray-500 leading-relaxed">
              Entrez votre email — vous recevrez un lien de connexion instantané, sans mot de passe.
            </p>
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Envoi...' : 'Recevoir un lien de connexion ✉'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => { setMode(m => m === 'password' ? 'magic' : 'password'); setError(null); setInfo(null) }}
          className="w-full text-sm text-gray-400 hover:text-blue-600 text-center pt-1">
          {mode === 'password'
            ? 'Première connexion ou mot de passe oublié ?'
            : '← Connexion avec mot de passe'}
        </button>
      </div>
    </div>
  )
}
