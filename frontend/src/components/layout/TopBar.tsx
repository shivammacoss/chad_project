import { Link } from 'react-router-dom'

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.06 6.6.86-4.85 4.6 1.22 6.55L12 17.9l-5.87 3.17 1.22-6.55L2.5 9.92l6.6-.86L12 2.5z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const CONTACTS = [
  { label: 'Email', href: 'mailto:hello@gridglobalgate.com', Icon: MailIcon },
  { label: 'Live Chat', href: '#chat', Icon: ChatIcon },
  { label: 'WhatsApp', href: 'https://wa.me/8112345678900', Icon: WhatsAppIcon },
  { label: 'Call', href: 'tel:+8112345678900', Icon: PhoneIcon },
]

/** Slim utility bar above the navbar: reviews + contact channels + client login. */
export function TopBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-12 bg-chad-blue text-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Reviews */}
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold">500+</span>
          <span className="flex items-center gap-0.5 text-chad-yellow">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-3.5 w-3.5" />
            ))}
          </span>
          <span className="hidden font-body text-sm font-medium text-white/85 sm:inline">
            Reviews
          </span>
        </div>

        {/* Contact + login */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center md:flex">
            {CONTACTS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-body text-sm text-white/75 transition-colors hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-chad-yellow px-3.5 py-1.5 font-display text-sm font-semibold text-chad-blue transition-colors hover:bg-chad-yellow/90"
          >
            <UserIcon className="h-4 w-4" />
            Client Login
          </Link>
        </div>
      </div>
    </div>
  )
}
