import { SectionLabel } from '@/components/common/SectionLabel'

/**
 * Intro / about block — mirrors the reference "International Business Support
 * Solutions" copy, localised to company formation and virtual offices in Chad.
 */
export function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden py-16 sm:py-20">
      {/* Blurred background image — kept vivid (no fade), only blurred */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
        style={{ backgroundImage: "url('/blurbg.png')" }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 text-center sm:px-8">
        <SectionLabel>Who we are</SectionLabel>
        <h2 className="max-w-2xl font-display text-display-md font-bold text-frost sm:text-display-lg">
          International business support solutions for SMEs and large enterprises
        </h2>

        <div className="flex flex-col gap-5 text-left">
          <p className="font-body text-base leading-relaxed text-frost/65">
            At GRIDGLOBAL GATE, we make starting and running a business in Chad simple, fast and
            professional. As a trusted provider of business support solutions, we work with
            entrepreneurs, start-ups, SMEs and large enterprises to establish, grow and manage their
            operations in Chad with confidence.
          </p>
          <p className="font-body text-base leading-relaxed text-frost/65">
            Our flagship services are company incorporation and virtual offices in Chad. We handle
            the entire process — from registering your company name and preparing your incorporation
            documents to keeping your statutory filings current — so you always remain in good
            standing.
          </p>
          <p className="font-body text-base leading-relaxed text-frost/65">
            Equally popular is our Chad virtual office service, which gives your business an instant
            professional presence without the cost of a physical office. We build a virtual office
            address that suits your needs, with secure mail handling and forwarding so you never miss
            what matters — wherever in the world you happen to be.
          </p>
        </div>
      </div>
    </section>
  )
}
