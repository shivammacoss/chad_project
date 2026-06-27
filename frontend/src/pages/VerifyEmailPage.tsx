import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { apiGet } from '@/lib/api'
import { useTr } from '@/lib/i18n'

export default function VerifyEmailPage() {
  const tr = useTr()
  const [params] = useSearchParams()
  const [state, setState] = useState<'pending' | 'ok' | 'fail'>('pending')

  useEffect(() => {
    const token = params.get('token')
    if (!token) return setState('fail')
    apiGet(`/api/auth/verify-email?token=${token}`)
      .then(() => setState('ok'))
      .catch(() => setState('fail'))
  }, [params])

  const copy = {
    pending: {
      t: tr({ fr: 'Vérification…', en: 'Verifying…', ar: 'جارٍ التحقق…' }),
      s: tr({ fr: 'Un instant.', en: 'One moment.', ar: 'لحظة من فضلك.' }),
    },
    ok: {
      t: tr({ fr: 'E-mail vérifié ✅', en: 'Email verified ✅', ar: 'تم التحقق من البريد الإلكتروني ✅' }),
      s: tr({ fr: 'Vous pouvez maintenant vous connecter.', en: 'You can now log in.', ar: 'يمكنك الآن تسجيل الدخول.' }),
    },
    fail: {
      t: tr({ fr: 'Échec de la vérification', en: 'Verification failed', ar: 'فشل التحقق' }),
      s: tr({ fr: 'Le lien est invalide ou expiré.', en: 'The link is invalid or expired.', ar: 'الرابط غير صالح أو منتهي الصلاحية.' }),
    },
  }[state]

  return (
    <AuthShell title={copy.t} subtitle={copy.s}>
      {state !== 'pending' && <Link to="/login" className="text-teal-electric">{tr({ fr: 'Aller à la connexion', en: 'Go to login', ar: 'الذهاب إلى تسجيل الدخول' })}</Link>}
    </AuthShell>
  )
}
