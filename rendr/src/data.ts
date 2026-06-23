export interface Service {
  id: string
  title: string
  description: string
  icon: 'code' | 'pen' | 'megaphone' | 'search'
}

export interface TeamMember {
  name: string
  role: string
  blurb: string
  avatar: string
  socials: Array<'facebook' | 'twitter' | 'instagram' | 'linkedin'>
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  avatar: string
  tone: 'brand' | 'dark'
}

export interface NavItem {
  label: string
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Demos', badge: '09' },
  { label: 'Blog', badge: '03' },
  { label: 'Works', badge: '14' },
  { label: 'Elements', badge: '21' },
  { label: 'Features', badge: '07' },
  { label: 'Shop', badge: '03' },
]

export const SERVICES: Service[] = [
  {
    id: '01',
    title: 'Web Development',
    description: 'Professionally orchestrate technical sound platforms that scale with your brand.',
    icon: 'code',
  },
  {
    id: '02',
    title: 'Design',
    description: 'Distinctively craft interfaces that feel effortless and look unmistakably yours.',
    icon: 'pen',
  },
  {
    id: '03',
    title: 'Marketing',
    description: 'Compellingly cultivate enabled campaigns that turn attention into momentum.',
    icon: 'megaphone',
  },
  {
    id: '04',
    title: 'SEO & Content',
    description: 'Seamlessly grow organic reach with content engineered to be found and shared.',
    icon: 'search',
  },
]

export const TEAM: TeamMember[] = [
  {
    name: 'Kevin Stanford',
    role: 'CEO / Co-Founder',
    blurb: 'Synergistically scalable thinking.',
    avatar: 'https://i.pravatar.cc/160?img=12',
    socials: ['linkedin', 'facebook', 'twitter'],
  },
  {
    name: 'Melissa Redmond',
    role: 'Head of HR',
    blurb: 'Collaboratively exploit insight.',
    avatar: 'https://i.pravatar.cc/160?img=5',
    socials: ['twitter', 'instagram'],
  },
  {
    name: 'Robert Bridge',
    role: 'Corporate Relations',
    blurb: 'Conveniently cultivate growth.',
    avatar: 'https://i.pravatar.cc/160?img=15',
    socials: ['linkedin', 'facebook', 'instagram'],
  },
  {
    name: 'Christy Finch',
    role: 'Project Manager',
    blurb: 'Appropriately deploy roadmaps.',
    avatar: 'https://i.pravatar.cc/160?img=9',
    socials: ['facebook', 'twitter', 'instagram'],
  },
  {
    name: 'Tomas Moran',
    role: 'Lead Designer',
    blurb: 'Compellingly cultivate craft.',
    avatar: 'https://i.pravatar.cc/160?img=33',
    socials: ['facebook', 'twitter', 'instagram'],
  },
  {
    name: 'Jennifer Rawlings',
    role: 'VP Diversity',
    blurb: 'Distinctively unleash culture.',
    avatar: 'https://i.pravatar.cc/160?img=20',
    socials: ['linkedin', 'twitter'],
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Proactively utilise competitive process improvements rather than extensive catalysts. The team delivered ahead of every deadline.',
    name: 'Eric Rosenberg',
    role: 'Marketing Director',
    avatar: 'https://i.pravatar.cc/120?img=53',
    tone: 'brand',
  },
  {
    quote:
      'Seamlessly create enterprise imperatives vis-a-vis corporate results. Dynamically deploy high standards. Easily the best partner we have worked with.',
    name: 'Mike Slater',
    role: 'PM / Developer',
    avatar: 'https://i.pravatar.cc/120?img=68',
    tone: 'dark',
  },
  {
    quote:
      'Intrinsically formulate fully tested material rather than proactive action items. Continually communicate and ship. Highly recommended.',
    name: 'Zara Winters',
    role: 'Corporate Advisor',
    avatar: 'https://i.pravatar.cc/120?img=49',
    tone: 'brand',
  },
  {
    quote:
      'Holistically reinvent our roadmap with clear priorities and zero noise. The collaboration felt effortless from kickoff to launch.',
    name: 'Priya Nair',
    role: 'Product Lead',
    avatar: 'https://i.pravatar.cc/120?img=45',
    tone: 'dark',
  },
  {
    quote:
      'Dramatically improved our conversion in a single quarter. Sharp strategy, beautiful execution, honest communication throughout.',
    name: 'Daniel Okafor',
    role: 'Growth Manager',
    avatar: 'https://i.pravatar.cc/120?img=60',
    tone: 'brand',
  },
  {
    quote:
      'They treated our brand like their own. Thoughtful, fast and relentlessly focused on the details that actually move the needle.',
    name: 'Hannah Beck',
    role: 'Head of Brand',
    avatar: 'https://i.pravatar.cc/120?img=32',
    tone: 'dark',
  },
]

export const TRUSTED_LOGOS: string[] = [
  'logoipsum',
  'LOGO95LM',
  'nodes',
  'logoipsum+',
  'LOGO95LM',
  'logoipsum',
]
