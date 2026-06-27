import type { EntityType, ApplicationStatus, OwnerRole, VoPlan } from '@/types/app'
import type { Localized } from '@/lib/i18n'

export const ENTITY_TYPES: { value: EntityType; label: Localized; blurb: Localized }[] = [
  {
    value: 'SARL',
    label: { fr: 'SARL', en: 'SARL', ar: 'SARL' },
    blurb: {
      fr: 'Société à responsabilité limitée — le choix standard pour les investisseurs étrangers.',
      en: 'Limited liability company — the standard for foreign investors.',
      ar: 'شركة ذات مسؤولية محدودة — الخيار المعتاد للمستثمرين الأجانب.',
    },
  },
  {
    value: 'SARL_U',
    label: { fr: 'SARL Unipersonnelle', en: 'SARL Unipersonnelle', ar: 'SARL أحادية الشريك' },
    blurb: {
      fr: 'Société à responsabilité limitée à associé unique.',
      en: 'Single-member limited liability company.',
      ar: 'شركة ذات مسؤولية محدودة بشريك واحد.',
    },
  },
  {
    value: 'SA',
    label: { fr: 'SA', en: 'SA', ar: 'SA' },
    blurb: {
      fr: 'Société anonyme pour les projets de plus grande envergure.',
      en: 'Public limited company for larger ventures.',
      ar: 'شركة مساهمة عامة للمشاريع الأكبر حجمًا.',
    },
  },
  {
    value: 'BRANCH',
    label: { fr: 'Succursale (Branch)', en: 'Branch (Succursale)', ar: 'فرع (Succursale)' },
    blurb: {
      fr: 'Une succursale d\'une société étrangère existante.',
      en: 'A branch of an existing foreign company.',
      ar: 'فرع لشركة أجنبية قائمة.',
    },
  },
  {
    value: 'REP_OFFICE',
    label: { fr: 'Bureau de représentation', en: 'Representative Office', ar: 'مكتب تمثيلي' },
    blurb: {
      fr: 'Présence de liaison non commerciale au Tchad.',
      en: 'Non-trading liaison presence in Chad.',
      ar: 'وجود تنسيقي غير تجاري في تشاد.',
    },
  },
]

export const STATUS_LABEL: Record<ApplicationStatus, Localized> = {
  draft: { fr: 'Brouillon', en: 'Draft', ar: 'مسودة' },
  documents_submitted: { fr: 'Documents soumis', en: 'Documents submitted', ar: 'تم تقديم المستندات' },
  payment_pending: { fr: 'Paiement en attente', en: 'Payment pending', ar: 'الدفع قيد الانتظار' },
  paid: { fr: 'Payé', en: 'Paid', ar: 'مدفوع' },
  in_review: { fr: 'Examen des documents', en: 'Document Review', ar: 'مراجعة المستندات' },
  filing_submitted: { fr: 'Traitement administratif', en: 'Government Processing', ar: 'المعالجة الحكومية' },
  registered: { fr: 'Approuvé', en: 'Approved', ar: 'تمت الموافقة' },
  needs_more_docs: { fr: 'Documents supplémentaires requis', en: 'Needs more documents', ar: 'يلزم مزيد من المستندات' },
  rejected: { fr: 'Rejeté', en: 'Rejected', ar: 'مرفوض' },
  legal_review: { fr: 'Examen juridique', en: 'Legal Review', ar: 'المراجعة القانونية' },
  waiting_government: { fr: 'En attente de l\'administration', en: 'Waiting Government', ar: 'في انتظار الجهة الحكومية' },
  completed: { fr: 'Terminé', en: 'Completed', ar: 'مكتمل' },
}

export const ENTITY_PRICE_CENTS: Record<EntityType, number> = {
  SARL: 49900, SARL_U: 39900, SA: 99900, BRANCH: 79900, REP_OFFICE: 59900,
}

export const VO_PLANS: { value: VoPlan; label: Localized; priceCents: number; blurb: Localized }[] = [
  {
    value: 'basic',
    label: { fr: 'Siège social de base', en: 'Basic registered office', ar: 'مقر مسجَّل أساسي' },
    priceCents: 20000,
    blurb: {
      fr: 'Une adresse de siège conforme à N\'Djamena avec réception du courrier.',
      en: 'A compliant registered address in N\'Djamena with mail receipt.',
      ar: 'عنوان مسجَّل مطابق للأنظمة في نجامينا مع استلام البريد.',
    },
  },
  {
    value: 'premium',
    label: { fr: 'Bureau premium', en: 'Premium office', ar: 'مكتب متميز' },
    priceCents: 50000,
    blurb: {
      fr: 'Adresse de siège avec réexpédition du courrier et gestion des appels.',
      en: 'Registered address plus mail forwarding and call handling.',
      ar: 'عنوان مسجَّل مع إعادة توجيه البريد وإدارة المكالمات.',
    },
  },
]

export const OWNER_ROLES: { value: OwnerRole; label: Localized }[] = [
  { value: 'director', label: { fr: 'Administrateur', en: 'Director', ar: 'مدير' } },
  { value: 'shareholder', label: { fr: 'Actionnaire', en: 'Shareholder', ar: 'مساهم' } },
  { value: 'both', label: { fr: 'Administrateur et actionnaire', en: 'Director & Shareholder', ar: 'مدير ومساهم' } },
]

export const BUSINESS_ACTIVITIES: string[] = [
  'Trading', 'IT', 'Consulting', 'Import/Export', 'Manufacturing', 'Construction', 'Agriculture', 'Services', 'Other',
]

export const CURRENCIES: string[] = ['FCFA', 'USD', 'EUR']

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}
