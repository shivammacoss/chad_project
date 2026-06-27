import { Link } from 'react-router-dom'
import { useTr, type Localized } from '@/lib/i18n'

/* ----------------------------- icons ----------------------------- */

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H17.6v-5.3c0-1.27-.02-2.9-1.77-2.9-1.78 0-2.05 1.38-2.05 2.8V21H9z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.87.24-1.46 1.49-1.46H16V5.04c-.28-.04-1.24-.12-2.36-.12-2.33 0-3.93 1.42-3.93 4.04V11H7.3v3h2.41v7z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.06 6.6.86-4.85 4.6 1.22 6.55L12 17.9l-5.87 3.17 1.22-6.55L2.5 9.42l6.6-.86L12 2.5z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.1L2 22l5.05-1.32A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 0 1 6.85 12.4l-.2.32.78 2.85-2.92-.77-.31.18a8.1 8.1 0 1 1-4.2-15.2zm-3.2 4.13c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.06 0 1.21.88 2.38 1 2.55.12.16 1.7 2.7 4.2 3.68 2.07.82 2.5.66 2.95.62.45-.04 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.25-.12-1.45-.72-1.67-.8-.22-.08-.39-.12-.55.13-.16.25-.63.8-.77.96-.14.16-.28.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.28.37-.42.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" />
    </svg>
  )
}

/* ----------------------------- data ----------------------------- */

const SOCIALS = [
  { label: 'LinkedIn', href: '#', Icon: LinkedInIcon },
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'YouTube', href: '#', Icon: YouTubeIcon },
]

const OFFICE_LOCATIONS: Localized[] = [
  { fr: "N'Djamena, Tchad", en: "N'Djamena, Chad", ar: 'نجامينا، تشاد' },
  { fr: 'Zone Franche Internationale du Tchad', en: 'Chad International Free Zone', ar: 'المنطقة الحرة الدولية بتشاد' },
  { fr: 'Moundou, Tchad', en: 'Moundou, Chad', ar: 'موندو، تشاد' },
  { fr: 'Sarh, Tchad', en: 'Sarh, Chad', ar: 'سرح، تشاد' },
  { fr: 'Abéché, Tchad', en: 'Abéché, Chad', ar: 'أبيشي، تشاد' },
]

const QUICK_LINKS: { label: Localized; to: string }[] = [
  { label: { fr: 'À propos', en: 'About Us', ar: 'من نحن' }, to: '/chad-free-zone' },
  { label: { fr: 'Derniers articles', en: 'Latest Insights', ar: 'أحدث المقالات' }, to: '/insights' },
  { label: { fr: 'Contactez-nous', en: 'Contact Us', ar: 'اتصل بنا' }, to: '/contact' },
  { label: { fr: "Programme d'affiliation", en: 'Affiliate Programme', ar: 'برنامج الشراكة' }, to: '/affiliate' },
  { label: { fr: 'Politique de confidentialité', en: 'Privacy Policy', ar: 'سياسة الخصوصية' }, to: '/contact' },
  { label: { fr: 'Conditions générales', en: 'Terms & Conditions', ar: 'الشروط والأحكام' }, to: '/contact' },
  { label: { fr: 'Plan du site', en: 'Site Map', ar: 'خريطة الموقع' }, to: '/' },
]

const CONTACT_CARDS: { title: Localized; sub: Localized; href: string; Icon: typeof MailIcon }[] = [
  { title: { fr: 'E-mail', en: 'Email', ar: 'البريد الإلكتروني' }, sub: { fr: 'hello@gridglobalgate.com', en: 'hello@gridglobalgate.com', ar: 'hello@gridglobalgate.com' }, href: 'mailto:hello@gridglobalgate.com', Icon: MailIcon },
  { title: { fr: 'Chat en direct', en: 'Live Chat', ar: 'الدردشة المباشرة' }, sub: { fr: 'Parlez à un spécialiste', en: 'Talk to a specialist', ar: 'تحدث إلى أحد المختصين' }, href: '#chat', Icon: ChatIcon },
  { title: { fr: 'WhatsApp', en: 'WhatsApp', ar: 'واتساب' }, sub: { fr: 'Envoyez un message maintenant', en: 'Drop a message now', ar: 'أرسل رسالة الآن' }, href: 'https://wa.me/23585243639', Icon: WhatsAppIcon },
  { title: { fr: 'Téléphone', en: 'Phone', ar: 'الهاتف' }, sub: { fr: '+235 85 24 36 39', en: '+235 85 24 36 39', ar: '+235 85 24 36 39' }, href: 'tel:+23585243639', Icon: PhoneIcon },
]

const PAYMENTS = ['VISA', 'Mastercard', 'Amex', 'PayPal', 'Wise']

const YEAR = 2026

/* ----------------------------- footer ----------------------------- */

export function Footer() {
  const tr = useTr()
  return (
    <footer className="relative overflow-hidden bg-chad-blue text-white">
      {/* Faint dotted map backdrop on the right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1.5px)] [background-size:9px_9px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_72%)] lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        {/* Top: brand + locations + quick links */}
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand block */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2" aria-label="GATE home">
              <span className="font-display text-xl font-bold tracking-tight text-chad-yellow">
                GATE
              </span>
            </Link>
            <p className="max-w-xs font-body text-sm leading-relaxed text-white/70">
              {tr({
                fr: "Avenue Charles de Gaulle, N'Djamena, République du Tchad — votre porte d'entrée vers l'accompagnement des entreprises internationales au Tchad.",
                en: "Avenue Charles de Gaulle, N'Djamena, Republic of Chad — your gateway to international business support in Chad.",
                ar: 'شارع شارل ديغول، نجامينا، جمهورية تشاد — بوابتك إلى دعم الأعمال الدولية في تشاد.',
              })}
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-chad-yellow hover:text-chad-blue"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Google reviews */}
            <div className="flex w-fit items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <span className="font-display text-2xl font-bold leading-none">
                <span className="text-[#4285F4]">G</span>
              </span>
              <div className="flex flex-col">
                <span className="font-body text-sm font-semibold text-white">{tr({ fr: 'Avis Google', en: 'Google Reviews', ar: 'تقييمات Google' })}</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-display text-sm font-bold text-white">4.8</span>
                  <span className="flex text-chad-yellow">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="h-3.5 w-3.5" />
                    ))}
                  </span>
                  <span className="font-body text-xs text-white/60">{tr({ fr: '500+ avis', en: '500+ reviews', ar: '+500 تقييم' })}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Office Locations */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-white">{tr({ fr: 'Nos bureaux', en: 'Office Locations', ar: 'مواقع المكاتب' })}</h3>
            <ul className="flex flex-col gap-3">
              {OFFICE_LOCATIONS.map((loc) => (
                <li key={loc.en} className="flex items-center gap-2.5 font-body text-sm text-white/70">
                  <span className="text-chad-yellow">
                    <Chevron />
                  </span>
                  {tr(loc)}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-white">{tr({ fr: 'Liens rapides', en: 'Quick Links', ar: 'روابط سريعة' })}</h3>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label.en}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2.5 font-body text-sm text-white/70 transition-colors hover:text-chad-yellow"
                  >
                    <span className="text-chad-yellow">
                      <Chevron />
                    </span>
                    {tr(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact cards */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map(({ title, sub, href, Icon }) => (
            <a
              key={title.en}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-white/15 px-6 py-7 text-center transition-colors hover:border-chad-yellow/60 hover:bg-white/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-chad-yellow transition-colors group-hover:bg-chad-yellow group-hover:text-chad-blue">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                {tr(title)}
              </span>
              <span className="font-body text-sm text-white/60">{tr(sub)}</span>
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/10 pt-8 text-center">
          <p className="font-body text-sm text-white/70">
            © {YEAR} GATE. {tr({ fr: 'Tous droits réservés.', en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' })}
          </p>
          <p className="max-w-xl font-body text-xs leading-relaxed text-white/45">
            {tr({
              fr: "GATE est un agent agréé de création d'entreprises exerçant en République du Tchad.",
              en: 'GATE is a registered company-formation agent operating in the Republic of Chad.',
              ar: 'GATE وكيل معتمد لتأسيس الشركات يعمل في جمهورية تشاد.',
            })}
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[0.7rem] font-medium uppercase tracking-wider text-white/55"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
