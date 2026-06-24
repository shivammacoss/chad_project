/**
 * Site content model for GRIDGLOBAL GATE.
 *
 * A single source of truth that drives the navigation mega-menu, the
 * generated service routes, and the category overview pages.
 */

export interface ServiceSection {
  title: string
  description: string
}

export interface ServicePage {
  id: string
  /** Full route path, e.g. "/virtual-offices/chad". */
  path: string
  /** Short label shown in the nav dropdown. */
  menuLabel: string
  /** Hero headline. */
  heroTitle: string
  /** Intro paragraph under the hero. */
  intro: string
  sections: ServiceSection[]
  /** Primary call-to-action label. */
  cta: string
  /** Where the CTA points (defaults to the contact page). */
  ctaTo?: string
  /** Optional pricing/eyebrow note, e.g. "From $0.25 per page". */
  note?: string
}

export interface MenuCategory {
  id: string
  label: string
  /** Overview page path (generated categories only). */
  overviewPath?: string
  blurb: string
  /** Number of columns to use when rendering the dropdown panel. */
  columns?: 1 | 2
  /** True for top-level pages that use bespoke components, not ServicePage. */
  custom?: boolean
  pages: ServicePage[]
}

const CONTACT = '/contact'

export const MENU: MenuCategory[] = [
  {
    id: 'virtual-offices',
    label: 'Office Solutions',
    overviewPath: '/virtual-offices',
    blurb: 'Prestigious Chad business addresses with secure mail handling and forwarding.',
    pages: [
      {
        id: 'chad-virtual-office',
        path: '/virtual-offices/chad',
        menuLabel: 'Chad Virtual Office',
        heroTitle: 'A Prestigious Chad Business Address — Without the Overheads',
        intro:
          "Establish an instant professional presence in Chad. Use our address as your registered office and director's service address, with secure mail handling and forwarding worldwide.",
        sections: [
          {
            title: 'Prestigious Chad Address',
            description:
              "Use our prestigious Chad address as your company's official business address.",
          },
          {
            title: "Director's Service Address",
            description:
              "Keep your home address private with a compliant director's service address in Chad.",
          },
          {
            title: 'Mail Scanning & Forwarding',
            description: 'Secure handling of your post with same-day scanning and forwarding worldwide.',
          },
          {
            title: 'Non-Resident Friendly',
            description: 'Ideal for non-residents registering a Chad company from anywhere in the world.',
          },
        ],
        cta: 'Get Your Chad Address Today',
      },
      {
        id: 'registered-office-address',
        path: '/virtual-offices/registered-office',
        menuLabel: 'Registered Office Address',
        heroTitle: 'Your Official Registered Office in Chad',
        intro:
          'A compliant registered office and agent address in Chad, kept on the official record so your company stays in good standing.',
        sections: [
          {
            title: 'Official Registered Office',
            description: "Our Chad address listed as your company's official registered office.",
          },
          {
            title: 'Registered Agent Included',
            description: 'Registered-agent service to receive official correspondence on your behalf.',
          },
          {
            title: 'Privacy Protected',
            description: 'Keep your personal address off the public record.',
          },
        ],
        cta: 'Get a Registered Office',
      },
      {
        id: 'mail-handling',
        path: '/virtual-offices/mail-handling',
        menuLabel: 'Mail Handling & Forwarding',
        heroTitle: 'Never Miss Important Post',
        intro:
          'Reliable scanning and forwarding of your Chad business mail to anywhere in the world.',
        sections: [
          {
            title: 'Same-Day Scanning',
            description: 'Your post scanned and sent to your inbox the same day.',
          },
          {
            title: 'Worldwide Forwarding',
            description: 'Physical mail forwarded to wherever you are based.',
          },
          {
            title: 'Secure & Confidential',
            description: 'Confidential, secure handling of every item.',
          },
        ],
        cta: 'Set Up Mail Handling',
      },
      {
        id: 'shared-meeting-spaces',
        path: '/virtual-offices/shared-spaces',
        menuLabel: 'Shared & Meeting Spaces',
        heroTitle: 'Professional Spaces When You Need Them',
        intro:
          'Access shared offices and meeting rooms in Chad on flexible terms to complement your virtual office.',
        sections: [
          { title: 'Hot Desks', description: 'Flexible desk space whenever you need a place to work.' },
          { title: 'Meeting Rooms', description: 'Professional meeting rooms booked by the hour or day.' },
          { title: 'Day Offices', description: 'Private day offices for focused work or client meetings.' },
        ],
        cta: 'Enquire About Spaces',
      },
    ],
  },
  {
    id: 'company-incorporation',
    label: 'Company Formation',
    overviewPath: '/incorporation',
    blurb: 'Form your company in Chad — residents and non-residents welcome.',
    pages: [
      {
        id: 'chad-company-formation',
        path: '/incorporation/chad-company',
        menuLabel: 'Chad Company Formation',
        heroTitle: 'Form Your Chad Company — Fully Managed',
        intro:
          'Fully managed company formation in Chad with all documents handled for you. Same pricing for residents and non-residents, no hidden costs.',
        sections: [
          {
            title: 'What You Receive',
            description:
              'Certificate of Incorporation, company statutes, and share documentation.',
          },
          {
            title: 'Filed With the Chad Authorities',
            description: 'We prepare and file your registration directly with the Chad authorities.',
          },
          {
            title: 'Non-Resident Friendly',
            description: 'Identical process and pricing for residents and non-residents.',
          },
        ],
        cta: 'Start Your Chad Company',
      },
      {
        id: 'chad-free-zone-company',
        path: '/incorporation/free-zone-company',
        menuLabel: 'Free Zone Company',
        heroTitle: 'Incorporate in the Chad International Free Zone',
        intro:
          'Set up a free-zone company in Chad with 100% foreign ownership, tax advantages, and a fully remote process.',
        sections: [
          {
            title: '100% Foreign Ownership',
            description: 'Own your company outright with no local shareholder requirement.',
          },
          {
            title: 'Tax-Efficient Structure',
            description: 'Benefit from the free zone’s attractive tax framework.',
          },
          {
            title: 'Fully Remote Setup',
            description: 'Incorporate entirely online from anywhere in the world.',
          },
        ],
        cta: 'Set Up a Free Zone Company',
      },
      {
        id: 'company-name-reservation',
        path: '/incorporation/name-reservation',
        menuLabel: 'Company Name Reservation',
        heroTitle: 'Reserve Your Chad Company Name',
        intro:
          'Secure your preferred company name in Chad before you incorporate, with an availability check handled for you.',
        sections: [
          {
            title: 'Availability Check',
            description: 'We confirm your chosen name is available to register in Chad.',
          },
          {
            title: 'Name Reservation',
            description: 'Reserve your name so it’s ready when you incorporate.',
          },
          {
            title: 'Guidance Included',
            description: 'Advice on naming rules and requirements in Chad.',
          },
        ],
        cta: 'Reserve My Name',
      },
      {
        id: 'non-resident-incorporation',
        path: '/incorporation/non-resident',
        menuLabel: 'Non-Resident Incorporation',
        heroTitle: 'Register Your Chad Company From Anywhere in the World',
        intro:
          'We handle the paperwork, address requirements, and filings so you can incorporate in Chad remotely with confidence.',
        sections: [
          {
            title: 'Required Documents',
            description: "We tell you exactly what's needed and guide you through every step.",
          },
          {
            title: 'Address Solutions',
            description: 'Registered office and service-address solutions in Chad included.',
          },
          {
            title: 'Same Process & Pricing as Residents',
            description: 'Identical process and pricing as resident applicants.',
          },
        ],
        cta: 'Get Started Remotely',
      },
    ],
  },
  {
    id: 'company-services',
    label: 'Corporate Services',
    overviewPath: '/company-services',
    blurb: 'Compliance, secretarial, branding and banking — everything to run your company.',
    columns: 2,
    pages: [
      {
        id: 'confirmation-statement',
        path: '/company-services/annual-compliance',
        menuLabel: 'Annual Compliance Filing',
        heroTitle: 'Keep Your Chad Company Compliant',
        intro:
          'Accurate, on-time annual filings to keep your records current with the Chad company registry.',
        sections: [
          {
            title: "What's Included",
            description: 'Full preparation and filing of your annual compliance returns.',
          },
          {
            title: 'Why It Matters',
            description: 'Avoid penalties and keep your company in good standing.',
          },
          { title: 'Low Fixed Fee', description: 'A simple, transparent price with no surprises.' },
        ],
        cta: 'File My Annual Return',
      },
      {
        id: 'company-secretarial',
        path: '/company-services/secretarial',
        menuLabel: 'Company Secretarial Services',
        heroTitle: 'Ongoing Compliance, Handled for You',
        intro:
          'As a registered company-formation agent in Chad, we manage your statutory and secretarial requirements year-round.',
        sections: [
          {
            title: 'Statutory Filings',
            description: 'We prepare and submit your statutory filings on time.',
          },
          {
            title: 'Record Maintenance',
            description: 'Your statutory registers and records kept accurate and current.',
          },
          {
            title: 'Good-Standing Support',
            description: 'Ongoing support to keep your company compliant.',
          },
        ],
        cta: 'Get Secretarial Support',
      },
      {
        id: 'company-dissolution',
        path: '/company-services/dissolution',
        menuLabel: 'Company Dissolution',
        heroTitle: 'Close Your Company — Hassle-Free',
        intro:
          'A low-cost service to dissolve your Chad-registered company, from application to registry communication.',
        sections: [
          {
            title: 'Dissolution Application',
            description: 'We prepare and submit your dissolution application.',
          },
          {
            title: 'Registry Handling',
            description: 'We manage all communication with the Chad company registry.',
          },
          {
            title: 'What to Expect',
            description: 'Clear guidance on timelines and the dissolution process.',
          },
        ],
        cta: 'Dissolve My Company',
      },
      {
        id: 'trademark-registration',
        path: '/company-services/trademark',
        menuLabel: 'Trademark Registration',
        heroTitle: 'Protect Your Brand',
        intro: 'Secure your business identity with professional trademark registration support.',
        sections: [
          { title: 'Trademark Search', description: 'We check availability before you file.' },
          {
            title: 'Application Filing',
            description: 'Professional preparation and filing of your application.',
          },
          {
            title: 'Ongoing Protection',
            description: 'Guidance on maintaining and enforcing your trademark.',
          },
        ],
        cta: 'Register My Trademark',
      },
      {
        id: 'logo-brand-design',
        path: '/company-services/logo-brand-design',
        menuLabel: 'Logo & Brand Design',
        heroTitle: 'A Professional Identity From Day One',
        intro: 'Strengthen your brand with custom logo and identity design.',
        sections: [
          { title: 'Logo Concepts', description: 'Multiple original concepts crafted for your brand.' },
          { title: 'Brand Files', description: 'A full set of logo files in every format you need.' },
          { title: 'Revisions Included', description: "Refine your chosen concept until it's right." },
        ],
        cta: 'Design My Logo',
      },
      {
        id: 'business-bank-account',
        path: '/company-services/bank-account',
        menuLabel: 'Business Bank Account',
        heroTitle: 'Open a Business Bank Account With Trusted Partners',
        intro:
          'We connect you with trusted banking partners and exclusive offers, including cash rewards on account opening.',
        sections: [
          { title: 'Trusted Bank Referrals', description: 'Introductions to vetted banking partners.' },
          { title: 'Exclusive Offers', description: 'Access partner offers, including cash rewards.' },
          {
            title: 'Support Through the Process',
            description: 'Guidance from application to approval.',
          },
        ],
        cta: 'Open an Account',
      },
    ],
  },
  {
    id: 'communication',
    label: 'Telecoms',
    overviewPath: '/communication',
    blurb: 'Call answering, landline and virtual mobile numbers for a professional image.',
    pages: [
      {
        id: 'virtual-receptionist',
        path: '/communication/virtual-receptionist',
        menuLabel: 'Virtual Receptionist',
        heroTitle: 'Never Miss an Important Call',
        intro:
          "Calls answered in your company's name, with messages and details forwarded to you instantly.",
        sections: [
          {
            title: 'Calls Answered in Your Name',
            description: 'A professional receptionist answers as your company.',
          },
          {
            title: 'Message Forwarding',
            description: 'Messages and caller details sent to you instantly.',
          },
          { title: 'Professional Image', description: 'Project a polished, established presence.' },
        ],
        cta: 'Set Up Call Answering',
      },
      {
        id: 'business-voip',
        path: '/communication/voip-numbers',
        menuLabel: 'Business Phone Numbers',
        heroTitle: 'Professional Business Phone Numbers',
        intro:
          'Get a professional business phone number you can use to make and receive calls from anywhere in the world.',
        sections: [
          {
            title: 'Local & International Numbers',
            description: 'Choose a professional number that suits your market.',
          },
          { title: 'Use Anywhere', description: 'Make and receive calls from anywhere in the world.' },
          { title: 'Mobile App Access', description: 'Manage your calls from a simple mobile app.' },
        ],
        cta: 'Get a Business Number',
      },
      {
        id: 'virtual-mobile',
        path: '/communication/virtual-mobile-numbers',
        menuLabel: 'Virtual Mobile Numbers',
        heroTitle: 'Receive SMS, OTPs & Calls Anywhere',
        intro:
          'Flexible virtual mobile numbers with SMS-to-email, voicemail-to-email, call recording, and diverting.',
        sections: [
          {
            title: 'SMS & OTP Reception',
            description: 'Receive text messages and one-time passcodes reliably.',
          },
          { title: 'Voicemail-to-Email', description: 'Voicemails delivered straight to your inbox.' },
          {
            title: 'Call Recording & Diverting',
            description: 'Record calls and divert them wherever you need.',
          },
        ],
        cta: 'Get a Virtual Mobile Number',
      },
    ],
  },
  {
    id: 'back-office',
    label: 'Back Office Support',
    overviewPath: '/back-office',
    blurb: 'Data, documents, transcription and quality assurance — handled with precision.',
    columns: 2,
    pages: [
      {
        id: 'data-input-management',
        path: '/back-office/data-input',
        menuLabel: 'Data Input & Management',
        heroTitle: 'Accurate Data, Reliably Managed',
        intro:
          'Professional data entry, verification, and database updates with precision.',
        note: 'From $0.25 per page',
        sections: [
          {
            title: 'Manual Data Entry & Verification',
            description: 'Careful entry and verification of your data.',
          },
          {
            title: 'Database Population & Updates',
            description: 'Populate and keep your databases up to date.',
          },
          {
            title: 'Validation & Quality Control',
            description: 'Rigorous checks for accuracy and consistency.',
          },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'data-conversion',
        path: '/back-office/data-conversion',
        menuLabel: 'Data Conversion Services',
        heroTitle: 'Seamless Data Conversion & Migration',
        intro: 'Securely transfer data between systems and formats with minimal downtime.',
        sections: [
          {
            title: 'Migration & Import/Export',
            description: 'Move data between systems safely and accurately.',
          },
          { title: 'Batch Data Processing', description: 'Process large data sets efficiently.' },
          {
            title: 'Format Conversion',
            description: 'Convert between formats without losing integrity.',
          },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'data-extraction',
        path: '/back-office/data-extraction',
        menuLabel: 'Data Extraction & Collection',
        heroTitle: 'Reliable Data Extraction',
        intro:
          'Accurate extraction and collection of data, ready for use in your databases or reports.',
        sections: [
          { title: 'Automated Extraction', description: 'Efficient extraction from your chosen sources.' },
          { title: 'Data Collection', description: 'Structured collection tailored to your needs.' },
          { title: 'Clean Output', description: 'Delivered ready to use in databases or reports.' },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'document-processing',
        path: '/back-office/document-processing',
        menuLabel: 'Document Processing & Formatting',
        heroTitle: 'Polished, Professional Documents',
        intro:
          'Formatting and preparation of reports, proposals, and manuals to a professional standard.',
        note: 'From $0.25 per page',
        sections: [
          { title: 'Formatting', description: 'Consistent, professional formatting for any document.' },
          { title: 'Merging & Splitting', description: 'Combine or separate documents as required.' },
          { title: 'Printing & Binding', description: 'Final output printed and bound to standard.' },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'content-knowledge',
        path: '/back-office/content-knowledge',
        menuLabel: 'Content & Knowledge Management',
        heroTitle: 'Organise and Empower Your Knowledge Base',
        intro:
          'Tailored solutions to create, organise, and manage your content and knowledge assets.',
        sections: [
          {
            title: 'Knowledge Base Setup',
            description: 'Build a structured, searchable knowledge base.',
          },
          {
            title: 'CMS (WordPress, Drupal, Joomla)',
            description: 'Setup and configuration of your chosen CMS.',
          },
          {
            title: 'Training & Onboarding Materials',
            description: 'Materials to onboard and upskill your team.',
          },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'quality-assurance',
        path: '/back-office/quality-assurance',
        menuLabel: 'Quality Assurance & Compliance',
        heroTitle: 'Reliable, Compliant Data',
        intro: 'Rigorous validation and quality control to keep your data accurate and compliant.',
        sections: [
          { title: 'Data Validation', description: 'Systematic checks for accuracy and completeness.' },
          {
            title: 'Error & Duplicate Detection',
            description: 'Find and resolve errors and duplicate records.',
          },
          { title: 'Compliance Standards', description: 'Aligned to relevant compliance requirements.' },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'document-security',
        path: '/back-office/document-security',
        menuLabel: 'Document & Data Security',
        heroTitle: 'Keep Sensitive Information Protected',
        intro:
          'Secure redaction and confidentiality marking to protect personal and proprietary data.',
        sections: [
          { title: 'Redaction', description: 'Securely remove sensitive content from documents.' },
          {
            title: 'Confidentiality Marking',
            description: 'Clearly mark and classify confidential material.',
          },
          {
            title: 'Compliance-Aligned Process',
            description: 'Handled to recognised compliance standards.',
          },
        ],
        cta: 'Get a Quote Today',
      },
      {
        id: 'transcription',
        path: '/back-office/transcription',
        menuLabel: 'Transcription Services',
        heroTitle: 'Accurate Audio-to-Text Transcription',
        intro:
          'Precise transcription for meetings, interviews, and webinars, properly formatted.',
        note: 'From $0.01 per word',
        sections: [
          { title: 'Meetings & Interviews', description: 'Clear, accurate transcripts of conversations.' },
          { title: 'Webinars', description: 'Full transcription of webinars and presentations.' },
          { title: 'Formatted Output', description: 'Delivered properly formatted and ready to use.' },
        ],
        cta: 'Get a Quote Today',
      },
    ],
  },
  {
    id: 'more',
    label: 'Resources',
    blurb: 'Insights, partnerships and our flagship Chad International Free Zone.',
    custom: true,
    pages: [
      {
        id: 'insights',
        path: '/insights',
        menuLabel: 'Latest Insights',
        heroTitle: 'Expert Guides & Insights',
        intro: 'Practical guidance on business formation, compliance, and entrepreneurship.',
        sections: [],
        cta: 'Read the Latest',
        ctaTo: '/insights',
      },
      {
        id: 'affiliate',
        path: '/affiliate',
        menuLabel: 'Affiliate Programme',
        heroTitle: 'Partner With GRIDGLOBAL GATE',
        intro: 'Earn by referring businesses to our services. Simple sign-up, transparent commissions.',
        sections: [],
        cta: 'Join the Programme',
        ctaTo: CONTACT,
      },
      {
        id: 'chad-free-zone',
        path: '/chad-free-zone',
        menuLabel: 'Chad International Free Zone',
        heroTitle: 'Chad International Free Zone',
        intro:
          'Incorporate in a fast-growing African free zone with tax advantages and full remote setup.',
        sections: [],
        cta: 'Explore the Free Zone',
        ctaTo: '/chad-free-zone',
      },
    ],
  },
]

/** Categories whose pages are rendered by the generic ServicePage template. */
export const SERVICE_CATEGORIES = MENU.filter((c) => !c.custom)

/** Flat list of every generated service page. */
export const ALL_SERVICE_PAGES = SERVICE_CATEGORIES.flatMap((c) =>
  c.pages.map((p) => ({ page: p, category: c })),
)

/** Look up the category that owns a given page path. */
export function findCategoryByPath(path: string): MenuCategory | undefined {
  return MENU.find((c) => c.overviewPath === path || c.pages.some((p) => p.path === path))
}
