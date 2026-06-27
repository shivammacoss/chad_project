import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/store/AuthContext'
import { ApiError } from '@/lib/api'
import { useTr } from '@/lib/i18n'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function LoginPage() {
  const tr = useTr()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(email, password)
      navigate(u.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tr({ fr: 'Échec de la connexion', en: 'Login failed', ar: 'فشل تسجيل الدخول' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title={tr({ fr: 'Bon retour', en: 'Welcome back', ar: 'مرحبًا بعودتك' })}
      subtitle={tr({ fr: 'Connectez-vous pour gérer vos formations', en: 'Log in to manage your formations', ar: 'سجّل الدخول لإدارة عملياتك' })}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} type="email" placeholder={tr({ fr: 'E-mail', en: 'Email', ar: 'البريد الإلكتروني' })} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inputCls} type="password" placeholder={tr({ fr: 'Mot de passe', en: 'Password', ar: 'كلمة المرور' })} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? tr({ fr: 'Connexion…', en: 'Signing in…', ar: 'جارٍ تسجيل الدخول…' }) : tr({ fr: 'Se connecter', en: 'Log in', ar: 'تسجيل الدخول' })}</Button>
        <p className="text-center text-sm text-frost/55">
          {tr({ fr: 'Nouveau ici ?', en: 'New here?', ar: 'جديد هنا؟' })} <Link to="/get-started" className="text-teal-electric">{tr({ fr: 'Commencer', en: 'Get started', ar: 'ابدأ الآن' })}</Link>
        </p>
      </form>
    </AuthShell>
  )
}
