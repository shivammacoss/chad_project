import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { formatPrice } from '@/content/formations'
import { apiPost, ApiError } from '@/lib/api'
import { useTr } from '@/lib/i18n'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GetStartedPage() {
  const tr = useTr()
  const [services, setServices] = useState<ServiceDef[]>([])
  const [service, setService] = useState<ServiceDef | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ fullName: '', email: '', country: '', phone: '', password: '' })
  const [done, setDone] = useState(false); const [verified, setVerified] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetchServices('TD').then((s) => {
      setServices(s)
      const params = new URLSearchParams(window.location.search)
      const pre = params.get('service')
      setService(s.find((x) => x.key === pre) ?? s[0] ?? null)
    })
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { const r = await apiPost<{ verified?: boolean }>('/api/auth/signup', form); setVerified(!!r?.verified); setDone(true) }
    catch (err) { setError(err instanceof ApiError ? err.message : tr({ fr: 'Échec de l’inscription', en: 'Signup failed', ar: 'فشل التسجيل' })) }
    finally { setBusy(false) }
  }

  if (done) return verified ? (
    <AuthShell
      title={tr({ fr: 'Compte prêt', en: 'Account ready', ar: 'الحساب جاهز' })}
      subtitle={tr({
        fr: `Vous pouvez maintenant vous connecter en tant que ${form.email}.`,
        en: `You can log in now as ${form.email}.`,
        ar: `يمكنك تسجيل الدخول الآن باسم ${form.email}.`,
      })}
    >
      <p className="text-sm text-frost/70">
        {tr({ fr: 'Connectez-vous pour finaliser votre demande de ', en: 'Log in to complete your ', ar: 'سجّل الدخول لإتمام طلب ' })}
        {service?.name}
        {tr({ fr: '.', en: ' request.', ar: '.' })}
      </p>
      <Link to="/login" className="mt-4 inline-block text-teal-electric">{tr({ fr: 'Aller à la connexion', en: 'Go to login', ar: 'الذهاب إلى تسجيل الدخول' })}</Link>
    </AuthShell>
  ) : (
    <AuthShell
      title={tr({ fr: 'Vérifiez votre boîte de réception', en: 'Check your inbox', ar: 'تحقّق من بريدك الوارد' })}
      subtitle={tr({
        fr: `Nous avons envoyé un lien de vérification à ${form.email}.`,
        en: `We sent a verification link to ${form.email}.`,
        ar: `أرسلنا رابط تحقّق إلى ${form.email}.`,
      })}
    >
      <p className="text-sm text-frost/70">
        {tr({ fr: 'Vérifiez votre e-mail, puis connectez-vous pour finaliser votre demande de ', en: 'Verify your email, then log in to complete your ', ar: 'تحقّق من بريدك الإلكتروني، ثم سجّل الدخول لإتمام طلب ' })}
        {service?.name}
        {tr({ fr: '.', en: ' request.', ar: '.' })}
      </p>
      <Link to="/login" className="mt-4 inline-block text-teal-electric">{tr({ fr: 'Aller à la connexion', en: 'Go to login', ar: 'الذهاب إلى تسجيل الدخول' })}</Link>
    </AuthShell>
  )

  if (step === 1) {
    const cats = Array.from(new Set(services.map((s) => s.category)))
    return (
      <AuthShell
        title={tr({ fr: 'Commencez votre demande', en: 'Start your application', ar: 'ابدأ طلبك' })}
        subtitle={tr({ fr: 'Choisissez un service', en: 'Choose a service', ar: 'اختر خدمة' })}
      >
        <div className="flex flex-col gap-5">
          {cats.map((cat) => (
            <div key={cat}>
              <p className="mb-2 text-xs uppercase tracking-wider text-frost/50">{cat}</p>
              <div className="flex flex-col gap-2">
                {services.filter((s) => s.category === cat).map((s) => (
                  <button key={s.key} type="button" onClick={() => setService(s)}
                    className={`rounded-xl border px-4 py-3 text-left ${service?.key === s.key ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-frost">{s.name}</span>
                      <span className="text-sm text-teal-electric">{formatPrice(s.priceCents)}</span>
                    </div>
                    <span className="text-sm text-frost/55">{s.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button disabled={!service} onClick={() => setStep(2)}>{tr({ fr: 'Continuer', en: 'Continue', ar: 'متابعة' })}</Button>
          <p className="text-center text-sm text-frost/55">{tr({ fr: 'Vous avez déjà un compte ? ', en: 'Have an account? ', ar: 'هل لديك حساب؟ ' })}<Link to="/login" className="text-teal-electric">{tr({ fr: 'Se connecter', en: 'Log in', ar: 'تسجيل الدخول' })}</Link></p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={tr({ fr: 'Créez votre compte', en: 'Create your account', ar: 'أنشئ حسابك' })}
      subtitle={tr({ fr: `Service : ${service?.name}`, en: `Service: ${service?.name}`, ar: `الخدمة: ${service?.name}` })}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder={tr({ fr: 'Nom complet', en: 'Full name', ar: 'الاسم الكامل' })} value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder={tr({ fr: 'E-mail', en: 'Email', ar: 'البريد الإلكتروني' })} value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder={tr({ fr: 'Pays', en: 'Country', ar: 'البلد' })} value={form.country} onChange={set('country')} required />
        <input className={inputCls} type="tel" placeholder={tr({ fr: 'Téléphone', en: 'Phone', ar: 'الهاتف' })} value={form.phone} onChange={set('phone')} />
        <input className={inputCls} type="password" placeholder={tr({ fr: 'Mot de passe (min. 8)', en: 'Password (min 8)', ar: 'كلمة المرور (8 على الأقل)' })} minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? tr({ fr: 'Création…', en: 'Creating…', ar: 'جارٍ الإنشاء…' }) : tr({ fr: 'Créer un compte', en: 'Create account', ar: 'إنشاء حساب' })}</Button>
        <button type="button" className="text-sm text-frost/55" onClick={() => setStep(1)}>{tr({ fr: '← Retour', en: '← Back', ar: '← رجوع' })}</button>
      </form>
    </AuthShell>
  )
}
