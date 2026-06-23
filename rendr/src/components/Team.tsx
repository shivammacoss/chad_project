import { SectionLabel } from '@/components/ui/SectionLabel'
import { SOCIAL_ICONS } from '@/components/ui/Icons'
import { TEAM } from '@/data'

export function Team() {
  return (
    <section id="team" className="py-16 sm:py-20">
      <div className="container-x flex flex-col gap-12">
        <div className="flex flex-col gap-5">
          <SectionLabel>Start exploring</SectionLabel>
          <h2 className="max-w-2xl text-balance font-display text-h-lg font-bold text-ink">
            Our passionate team of creative professionals
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <article
              key={member.name}
              className="group flex items-center gap-4 rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-soft"
            >
              <img
                src={member.avatar}
                alt={member.name}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
              <div className="flex min-w-0 flex-col gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">{member.name}</h3>
                  <p className="font-body text-xs font-medium text-slatey">{member.role}</p>
                </div>
                <p className="truncate font-body text-xs text-slatey/80">{member.blurb}</p>
                <div className="flex items-center gap-2.5 pt-0.5 text-ink/50">
                  {member.socials.map((s) => {
                    const Icon = SOCIAL_ICONS[s]
                    return (
                      <a
                        key={s}
                        href="#top"
                        aria-label={`${member.name} on ${s}`}
                        className="transition-colors hover:text-brand-600"
                      >
                        <Icon />
                      </a>
                    )
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
