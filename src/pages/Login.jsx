import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Login() {
  const [mode, setMode] = useState('password') // 'password' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirectByRole(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f0f' }}>
      {/* Background subtle texture */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #39E229 0%, transparent 50%), radial-gradient(circle at 75% 80%, #39E229 0%, transparent 40%)' }} />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo dark size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 space-y-5">
          <div className="text-center">
            <h2 className="text-white font-semibold">Espace entraînement</h2>
            <p className="text-white/40 text-sm mt-0.5">Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}
          {info && (
            <div className="border text-sm p-3 rounded-xl"
              style={{ background: 'rgba(57,226,41,0.1)', borderColor: 'rgba(57,226,41,0.3)', color: '#39E229' }}>
              {info}
            </div>
          )}

          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <input type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-moov focus:ring-1 focus:ring-moov" />
              <input type="password" placeholder="Mot de passe" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-moov focus:ring-1 focus:ring-moov" />
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-black disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#39E229' }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <p className="text-white/50 text-sm leading-relaxed">
                Entrez votre email — vous recevrez un lien de connexion instantané, sans mot de passe.
              </p>
              <input type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-moov focus:ring-1 focus:ring-moov" />
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-black disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#39E229' }}>
                {loading ? 'Envoi...' : 'Recevoir un lien de connexion ✉'}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => { setMode(m => m === 'password' ? 'magic' : 'password'); setError(null); setInfo(null) }}
            className="w-full text-sm text-white/30 hover:text-white/60 text-center pt-1 transition-colors">
            {mode === 'password'
              ? 'Première connexion ou mot de passe oublié ?'
              : '← Connexion avec mot de passe'}
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          MooV'Lab — Laboratoire du Mouvement
        </p>
      </div>
    </div>
  )
}
