/**
 * Site content model for GATE.
 *
 * A single source of truth that drives the navigation mega-menu, the
 * generated service routes, and the category overview pages.
 */

import type { Localized } from '@/lib/i18n'

export interface ServiceSection {
  title: Localized
  description: Localized
}

export interface ServicePage {
  id: string
  /** Full route path, e.g. "/virtual-offices/chad". */
  path: string
  /** Short label shown in the nav dropdown. */
  menuLabel: Localized
  /** Hero headline. */
  heroTitle: Localized
  /** Intro paragraph under the hero. */
  intro: Localized
  sections: ServiceSection[]
  /** Primary call-to-action label. */
  cta: Localized
  /** Where the CTA points (defaults to the contact page). */
  ctaTo?: string
  /** Optional pricing/eyebrow note, e.g. "From $0.25 per page". */
  note?: Localized
}

export interface MenuCategory {
  id: string
  label: Localized
  /** Overview page path (generated categories only). */
  overviewPath?: string
  blurb: Localized
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
    label: { fr: 'Solutions de bureau', en: 'Office Solutions', ar: 'حلول المكاتب' },
    overviewPath: '/virtual-offices',
    blurb: {
      fr: "Des adresses professionnelles prestigieuses au Tchad, avec gestion et réexpédition sécurisées du courrier.",
      en: 'Prestigious Chad business addresses with secure mail handling and forwarding.',
      ar: 'عناوين تجارية مرموقة في تشاد مع معالجة وإعادة توجيه آمنة للبريد.',
    },
    pages: [
      {
        id: 'chad-virtual-office',
        path: '/virtual-offices/chad',
        menuLabel: { fr: 'Bureau virtuel au Tchad', en: 'Chad Virtual Office', ar: 'مكتب افتراضي في تشاد' },
        heroTitle: {
          fr: 'Une adresse professionnelle prestigieuse au Tchad — sans les frais fixes',
          en: 'A Prestigious Chad Business Address — Without the Overheads',
          ar: 'عنوان تجاري مرموق في تشاد — دون التكاليف الثابتة',
        },
        intro: {
          fr: "Établissez une présence professionnelle immédiate au Tchad. Utilisez notre adresse comme siège social et comme adresse professionnelle de votre dirigeant, avec une gestion et une réexpédition sécurisées du courrier dans le monde entier.",
          en: "Establish an instant professional presence in Chad. Use our address as your registered office and director's service address, with secure mail handling and forwarding worldwide.",
          ar: 'أنشئ حضوراً مهنياً فورياً في تشاد. استخدم عنواننا كمقر مسجّل لشركتك وكعنوان خدمة لمديرها، مع معالجة وإعادة توجيه آمنة للبريد في جميع أنحاء العالم.',
        },
        sections: [
          {
            title: { fr: 'Adresse prestigieuse au Tchad', en: 'Prestigious Chad Address', ar: 'عنوان مرموق في تشاد' },
            description: {
              fr: "Utilisez notre adresse prestigieuse au Tchad comme adresse professionnelle officielle de votre entreprise.",
              en: "Use our prestigious Chad address as your company's official business address.",
              ar: 'استخدم عنواننا المرموق في تشاد كعنوان تجاري رسمي لشركتك.',
            },
          },
          {
            title: { fr: 'Adresse professionnelle du dirigeant', en: "Director's Service Address", ar: 'عنوان خدمة المدير' },
            description: {
              fr: "Protégez la confidentialité de votre adresse personnelle grâce à une adresse professionnelle conforme pour votre dirigeant au Tchad.",
              en: "Keep your home address private with a compliant director's service address in Chad.",
              ar: 'حافظ على خصوصية عنوان منزلك من خلال عنوان خدمة متوافق للمدير في تشاد.',
            },
          },
          {
            title: { fr: 'Numérisation et réexpédition du courrier', en: 'Mail Scanning & Forwarding', ar: 'مسح وإعادة توجيه البريد' },
            description: {
              fr: 'Gestion sécurisée de votre courrier avec numérisation le jour même et réexpédition dans le monde entier.',
              en: 'Secure handling of your post with same-day scanning and forwarding worldwide.',
              ar: 'معالجة آمنة لبريدك مع المسح في اليوم نفسه وإعادة التوجيه في جميع أنحاء العالم.',
            },
          },
          {
            title: { fr: 'Adapté aux non-résidents', en: 'Non-Resident Friendly', ar: 'مناسب لغير المقيمين' },
            description: {
              fr: "Idéal pour les non-résidents qui immatriculent une entreprise au Tchad depuis n'importe où dans le monde.",
              en: 'Ideal for non-residents registering a Chad company from anywhere in the world.',
              ar: 'مثالي لغير المقيمين الذين يسجّلون شركة في تشاد من أي مكان في العالم.',
            },
          },
        ],
        cta: { fr: 'Obtenez votre adresse au Tchad dès aujourd\'hui', en: 'Get Your Chad Address Today', ar: 'احصل على عنوانك في تشاد اليوم' },
      },
      {
        id: 'registered-office-address',
        path: '/virtual-offices/registered-office',
        menuLabel: { fr: 'Adresse de siège social', en: 'Registered Office Address', ar: 'عنوان المقر المسجّل' },
        heroTitle: {
          fr: 'Votre siège social officiel au Tchad',
          en: 'Your Official Registered Office in Chad',
          ar: 'مقرك المسجّل الرسمي في تشاد',
        },
        intro: {
          fr: 'Une adresse de siège social et de mandataire conforme au Tchad, inscrite au registre officiel afin que votre entreprise demeure en règle.',
          en: 'A compliant registered office and agent address in Chad, kept on the official record so your company stays in good standing.',
          ar: 'عنوان مقر مسجّل ووكيل متوافق في تشاد، مُدرَج في السجل الرسمي لضمان بقاء شركتك في وضع قانوني سليم.',
        },
        sections: [
          {
            title: { fr: 'Siège social officiel', en: 'Official Registered Office', ar: 'مقر مسجّل رسمي' },
            description: {
              fr: "Notre adresse au Tchad inscrite comme siège social officiel de votre entreprise.",
              en: "Our Chad address listed as your company's official registered office.",
              ar: 'عنواننا في تشاد مُدرَج كمقر مسجّل رسمي لشركتك.',
            },
          },
          {
            title: { fr: 'Mandataire inclus', en: 'Registered Agent Included', ar: 'وكيل مسجّل مشمول' },
            description: {
              fr: 'Service de mandataire pour recevoir la correspondance officielle en votre nom.',
              en: 'Registered-agent service to receive official correspondence on your behalf.',
              ar: 'خدمة وكيل مسجّل لاستلام المراسلات الرسمية نيابةً عنك.',
            },
          },
          {
            title: { fr: 'Confidentialité protégée', en: 'Privacy Protected', ar: 'خصوصية محمية' },
            description: {
              fr: 'Gardez votre adresse personnelle hors du registre public.',
              en: 'Keep your personal address off the public record.',
              ar: 'احتفظ بعنوانك الشخصي بعيداً عن السجل العام.',
            },
          },
        ],
        cta: { fr: 'Obtenir un siège social', en: 'Get a Registered Office', ar: 'احصل على مقر مسجّل' },
      },
      {
        id: 'mail-handling',
        path: '/virtual-offices/mail-handling',
        menuLabel: { fr: 'Gestion et réexpédition du courrier', en: 'Mail Handling & Forwarding', ar: 'معالجة وإعادة توجيه البريد' },
        heroTitle: {
          fr: 'Ne manquez plus aucun courrier important',
          en: 'Never Miss Important Post',
          ar: 'لا تفوّت أي بريد مهم',
        },
        intro: {
          fr: "Numérisation et réexpédition fiables de votre courrier professionnel tchadien vers n'importe où dans le monde.",
          en: 'Reliable scanning and forwarding of your Chad business mail to anywhere in the world.',
          ar: 'مسح وإعادة توجيه موثوقان لبريد عملك في تشاد إلى أي مكان في العالم.',
        },
        sections: [
          {
            title: { fr: 'Numérisation le jour même', en: 'Same-Day Scanning', ar: 'مسح في اليوم نفسه' },
            description: {
              fr: 'Votre courrier numérisé et envoyé dans votre boîte de réception le jour même.',
              en: 'Your post scanned and sent to your inbox the same day.',
              ar: 'يُمسح بريدك ويُرسل إلى صندوق الوارد في اليوم نفسه.',
            },
          },
          {
            title: { fr: 'Réexpédition mondiale', en: 'Worldwide Forwarding', ar: 'إعادة توجيه عالمية' },
            description: {
              fr: 'Courrier physique réexpédié là où vous vous trouvez.',
              en: 'Physical mail forwarded to wherever you are based.',
              ar: 'يُعاد توجيه البريد الورقي إلى أينما كنت.',
            },
          },
          {
            title: { fr: 'Sécurisé et confidentiel', en: 'Secure & Confidential', ar: 'آمن وسري' },
            description: {
              fr: 'Traitement confidentiel et sécurisé de chaque envoi.',
              en: 'Confidential, secure handling of every item.',
              ar: 'معالجة سرية وآمنة لكل عنصر.',
            },
          },
        ],
        cta: { fr: 'Configurer la gestion du courrier', en: 'Set Up Mail Handling', ar: 'إعداد معالجة البريد' },
      },
      {
        id: 'shared-meeting-spaces',
        path: '/virtual-offices/shared-spaces',
        menuLabel: { fr: 'Espaces partagés et de réunion', en: 'Shared & Meeting Spaces', ar: 'مساحات مشتركة وقاعات اجتماعات' },
        heroTitle: {
          fr: 'Des espaces professionnels quand vous en avez besoin',
          en: 'Professional Spaces When You Need Them',
          ar: 'مساحات مهنية عندما تحتاج إليها',
        },
        intro: {
          fr: 'Accédez à des bureaux partagés et à des salles de réunion au Tchad à des conditions flexibles, en complément de votre bureau virtuel.',
          en: 'Access shared offices and meeting rooms in Chad on flexible terms to complement your virtual office.',
          ar: 'احصل على مكاتب مشتركة وقاعات اجتماعات في تشاد بشروط مرنة لتكملة مكتبك الافتراضي.',
        },
        sections: [
          {
            title: { fr: 'Postes de travail flexibles', en: 'Hot Desks', ar: 'مكاتب مرنة' },
            description: {
              fr: 'Un poste de travail flexible chaque fois que vous avez besoin d\'un endroit où travailler.',
              en: 'Flexible desk space whenever you need a place to work.',
              ar: 'مساحة مكتبية مرنة كلما احتجت إلى مكان للعمل.',
            },
          },
          {
            title: { fr: 'Salles de réunion', en: 'Meeting Rooms', ar: 'قاعات اجتماعات' },
            description: {
              fr: 'Des salles de réunion professionnelles réservées à l\'heure ou à la journée.',
              en: 'Professional meeting rooms booked by the hour or day.',
              ar: 'قاعات اجتماعات مهنية تُحجز بالساعة أو باليوم.',
            },
          },
          {
            title: { fr: 'Bureaux à la journée', en: 'Day Offices', ar: 'مكاتب يومية' },
            description: {
              fr: 'Des bureaux privés à la journée pour un travail concentré ou des rendez-vous clients.',
              en: 'Private day offices for focused work or client meetings.',
              ar: 'مكاتب خاصة يومية للعمل المركّز أو لقاءات العملاء.',
            },
          },
        ],
        cta: { fr: 'Se renseigner sur les espaces', en: 'Enquire About Spaces', ar: 'استفسر عن المساحات' },
      },
    ],
  },
  {
    id: 'company-incorporation',
    label: { fr: "Création d'entreprise", en: 'Company Formation', ar: 'تأسيس الشركات' },
    overviewPath: '/incorporation',
    blurb: {
      fr: 'Créez votre entreprise au Tchad — résidents et non-résidents bienvenus.',
      en: 'Form your company in Chad — residents and non-residents welcome.',
      ar: 'أسّس شركتك في تشاد — المقيمون وغير المقيمين مرحب بهم.',
    },
    pages: [
      {
        id: 'chad-company-formation',
        path: '/incorporation/chad-company',
        menuLabel: { fr: "Création d'entreprise au Tchad", en: 'Chad Company Formation', ar: 'تأسيس شركة في تشاد' },
        heroTitle: {
          fr: 'Créez votre entreprise au Tchad — entièrement gérée',
          en: 'Form Your Chad Company — Fully Managed',
          ar: 'أسّس شركتك في تشاد — بإدارة كاملة',
        },
        intro: {
          fr: "Création d'entreprise entièrement gérée au Tchad, avec tous les documents pris en charge pour vous. Tarification identique pour les résidents et les non-résidents, sans frais cachés.",
          en: 'Fully managed company formation in Chad with all documents handled for you. Same pricing for residents and non-residents, no hidden costs.',
          ar: 'تأسيس شركة بإدارة كاملة في تشاد مع تولّي جميع المستندات نيابةً عنك. تسعير موحّد للمقيمين وغير المقيمين، دون تكاليف خفية.',
        },
        sections: [
          {
            title: { fr: 'Ce que vous recevez', en: 'What You Receive', ar: 'ما تحصل عليه' },
            description: {
              fr: "Certificat d'immatriculation, statuts de la société et documentation relative aux actions.",
              en: 'Certificate of Incorporation, company statutes, and share documentation.',
              ar: 'شهادة التأسيس والنظام الأساسي للشركة ووثائق الأسهم.',
            },
          },
          {
            title: { fr: 'Déposé auprès des autorités tchadiennes', en: 'Filed With the Chad Authorities', ar: 'مُودَع لدى السلطات التشادية' },
            description: {
              fr: 'Nous préparons et déposons votre immatriculation directement auprès des autorités tchadiennes.',
              en: 'We prepare and file your registration directly with the Chad authorities.',
              ar: 'نحن نُعدّ ونودع تسجيلك مباشرةً لدى السلطات التشادية.',
            },
          },
          {
            title: { fr: 'Adapté aux non-résidents', en: 'Non-Resident Friendly', ar: 'مناسب لغير المقيمين' },
            description: {
              fr: 'Processus et tarification identiques pour les résidents et les non-résidents.',
              en: 'Identical process and pricing for residents and non-residents.',
              ar: 'إجراءات وتسعير متطابقان للمقيمين وغير المقيمين.',
            },
          },
        ],
        cta: { fr: 'Lancez votre entreprise au Tchad', en: 'Start Your Chad Company', ar: 'ابدأ شركتك في تشاد' },
      },
      {
        id: 'chad-free-zone-company',
        path: '/incorporation/free-zone-company',
        menuLabel: { fr: 'Société en Zone Franche', en: 'Free Zone Company', ar: 'شركة في المنطقة الحرة' },
        heroTitle: {
          fr: 'Constituez votre société dans la Zone Franche Internationale du Tchad',
          en: 'Incorporate in the Chad International Free Zone',
          ar: 'أسّس شركتك في المنطقة الحرة الدولية في تشاد',
        },
        intro: {
          fr: 'Créez une société en zone franche au Tchad avec une propriété étrangère à 100 %, des avantages fiscaux et un processus entièrement à distance.',
          en: 'Set up a free-zone company in Chad with 100% foreign ownership, tax advantages, and a fully remote process.',
          ar: 'أسّس شركة في المنطقة الحرة في تشاد بملكية أجنبية بنسبة 100٪، ومزايا ضريبية، وإجراءات تتم بالكامل عن بُعد.',
        },
        sections: [
          {
            title: { fr: 'Propriété étrangère à 100 %', en: '100% Foreign Ownership', ar: 'ملكية أجنبية بنسبة 100٪' },
            description: {
              fr: "Détenez votre société à part entière, sans obligation d'actionnaire local.",
              en: 'Own your company outright with no local shareholder requirement.',
              ar: 'تملّك شركتك بالكامل دون اشتراط وجود مساهم محلي.',
            },
          },
          {
            title: { fr: 'Structure fiscalement avantageuse', en: 'Tax-Efficient Structure', ar: 'هيكل فعّال ضريبياً' },
            description: {
              fr: 'Profitez du cadre fiscal attractif de la zone franche.',
              en: 'Benefit from the free zone’s attractive tax framework.',
              ar: 'استفد من الإطار الضريبي الجذّاب للمنطقة الحرة.',
            },
          },
          {
            title: { fr: 'Création entièrement à distance', en: 'Fully Remote Setup', ar: 'تأسيس عن بُعد بالكامل' },
            description: {
              fr: "Constituez votre société entièrement en ligne, depuis n'importe où dans le monde.",
              en: 'Incorporate entirely online from anywhere in the world.',
              ar: 'أسّس شركتك بالكامل عبر الإنترنت من أي مكان في العالم.',
            },
          },
        ],
        cta: { fr: 'Créer une société en Zone Franche', en: 'Set Up a Free Zone Company', ar: 'أسّس شركة في المنطقة الحرة' },
      },
      {
        id: 'company-name-reservation',
        path: '/incorporation/name-reservation',
        menuLabel: { fr: 'Réservation de nom de société', en: 'Company Name Reservation', ar: 'حجز اسم الشركة' },
        heroTitle: {
          fr: 'Réservez le nom de votre société au Tchad',
          en: 'Reserve Your Chad Company Name',
          ar: 'احجز اسم شركتك في تشاد',
        },
        intro: {
          fr: 'Sécurisez le nom de société de votre choix au Tchad avant de vous constituer, avec une vérification de disponibilité prise en charge pour vous.',
          en: 'Secure your preferred company name in Chad before you incorporate, with an availability check handled for you.',
          ar: 'احجز اسم الشركة المفضّل لديك في تشاد قبل التأسيس، مع تولّي التحقق من توفّره نيابةً عنك.',
        },
        sections: [
          {
            title: { fr: 'Vérification de disponibilité', en: 'Availability Check', ar: 'التحقق من التوفّر' },
            description: {
              fr: 'Nous confirmons que le nom choisi est disponible à l\'immatriculation au Tchad.',
              en: 'We confirm your chosen name is available to register in Chad.',
              ar: 'نؤكّد أن الاسم الذي اخترته متاح للتسجيل في تشاد.',
            },
          },
          {
            title: { fr: 'Réservation du nom', en: 'Name Reservation', ar: 'حجز الاسم' },
            description: {
              fr: 'Réservez votre nom afin qu\'il soit prêt au moment de votre constitution.',
              en: 'Reserve your name so it’s ready when you incorporate.',
              ar: 'احجز اسمك ليكون جاهزاً عند التأسيس.',
            },
          },
          {
            title: { fr: 'Accompagnement inclus', en: 'Guidance Included', ar: 'إرشاد مشمول' },
            description: {
              fr: 'Conseils sur les règles et exigences de dénomination au Tchad.',
              en: 'Advice on naming rules and requirements in Chad.',
              ar: 'نصائح حول قواعد ومتطلبات التسمية في تشاد.',
            },
          },
        ],
        cta: { fr: 'Réserver mon nom', en: 'Reserve My Name', ar: 'احجز اسمي' },
      },
      {
        id: 'non-resident-incorporation',
        path: '/incorporation/non-resident',
        menuLabel: { fr: 'Constitution pour non-résidents', en: 'Non-Resident Incorporation', ar: 'التأسيس لغير المقيمين' },
        heroTitle: {
          fr: "Immatriculez votre entreprise au Tchad depuis n'importe où dans le monde",
          en: 'Register Your Chad Company From Anywhere in the World',
          ar: 'سجّل شركتك في تشاد من أي مكان في العالم',
        },
        intro: {
          fr: "Nous prenons en charge les formalités, les exigences d'adresse et les dépôts afin que vous puissiez vous constituer au Tchad à distance, en toute confiance.",
          en: 'We handle the paperwork, address requirements, and filings so you can incorporate in Chad remotely with confidence.',
          ar: 'نتولّى الأوراق ومتطلبات العنوان والإيداعات لتتمكّن من التأسيس في تشاد عن بُعد بثقة تامة.',
        },
        sections: [
          {
            title: { fr: 'Documents requis', en: 'Required Documents', ar: 'المستندات المطلوبة' },
            description: {
              fr: "Nous vous indiquons précisément ce qui est nécessaire et vous guidons à chaque étape.",
              en: "We tell you exactly what's needed and guide you through every step.",
              ar: 'نخبرك بالضبط بما هو مطلوب ونرشدك في كل خطوة.',
            },
          },
          {
            title: { fr: "Solutions d'adresse", en: 'Address Solutions', ar: 'حلول العنوان' },
            description: {
              fr: 'Solutions de siège social et d\'adresse professionnelle au Tchad incluses.',
              en: 'Registered office and service-address solutions in Chad included.',
              ar: 'حلول المقر المسجّل وعنوان الخدمة في تشاد مشمولة.',
            },
          },
          {
            title: { fr: 'Mêmes processus et tarifs que pour les résidents', en: 'Same Process & Pricing as Residents', ar: 'نفس الإجراءات والتسعير كالمقيمين' },
            description: {
              fr: 'Processus et tarification identiques à ceux des demandeurs résidents.',
              en: 'Identical process and pricing as resident applicants.',
              ar: 'إجراءات وتسعير متطابقان مع مقدّمي الطلبات المقيمين.',
            },
          },
        ],
        cta: { fr: 'Commencer à distance', en: 'Get Started Remotely', ar: 'ابدأ عن بُعد' },
      },
    ],
  },
  {
    id: 'company-services',
    label: { fr: 'Services aux entreprises', en: 'Corporate Services', ar: 'الخدمات المؤسسية' },
    overviewPath: '/company-services',
    blurb: {
      fr: 'Conformité, secrétariat, image de marque et services bancaires — tout pour faire fonctionner votre entreprise.',
      en: 'Compliance, secretarial, branding and banking — everything to run your company.',
      ar: 'الامتثال والسكرتارية والعلامة التجارية والخدمات المصرفية — كل ما يلزم لإدارة شركتك.',
    },
    columns: 2,
    pages: [
      {
        id: 'confirmation-statement',
        path: '/company-services/annual-compliance',
        menuLabel: { fr: 'Déclaration annuelle de conformité', en: 'Annual Compliance Filing', ar: 'إيداع الامتثال السنوي' },
        heroTitle: {
          fr: 'Maintenez votre entreprise tchadienne en conformité',
          en: 'Keep Your Chad Company Compliant',
          ar: 'حافظ على امتثال شركتك في تشاد',
        },
        intro: {
          fr: 'Des déclarations annuelles exactes et déposées dans les délais pour tenir vos dossiers à jour auprès du registre des sociétés du Tchad.',
          en: 'Accurate, on-time annual filings to keep your records current with the Chad company registry.',
          ar: 'إيداعات سنوية دقيقة وفي الوقت المحدد للحفاظ على تحديث سجلاتك لدى سجل الشركات في تشاد.',
        },
        sections: [
          {
            title: { fr: 'Ce qui est inclus', en: "What's Included", ar: 'ما هو مشمول' },
            description: {
              fr: 'Préparation et dépôt complets de vos déclarations annuelles de conformité.',
              en: 'Full preparation and filing of your annual compliance returns.',
              ar: 'إعداد وإيداع كاملان لإقراراتك السنوية للامتثال.',
            },
          },
          {
            title: { fr: 'Pourquoi c\'est important', en: 'Why It Matters', ar: 'لماذا هذا مهم' },
            description: {
              fr: 'Évitez les pénalités et maintenez votre entreprise en règle.',
              en: 'Avoid penalties and keep your company in good standing.',
              ar: 'تجنّب الغرامات وحافظ على وضع شركتك القانوني السليم.',
            },
          },
          {
            title: { fr: 'Forfait fixe et abordable', en: 'Low Fixed Fee', ar: 'رسوم ثابتة منخفضة' },
            description: {
              fr: 'Un tarif simple et transparent, sans surprises.',
              en: 'A simple, transparent price with no surprises.',
              ar: 'سعر بسيط وشفّاف دون مفاجآت.',
            },
          },
        ],
        cta: { fr: 'Déposer ma déclaration annuelle', en: 'File My Annual Return', ar: 'إيداع إقراري السنوي' },
      },
      {
        id: 'company-secretarial',
        path: '/company-services/secretarial',
        menuLabel: { fr: 'Services de secrétariat juridique', en: 'Company Secretarial Services', ar: 'خدمات سكرتارية الشركة' },
        heroTitle: {
          fr: 'Une conformité continue, prise en charge pour vous',
          en: 'Ongoing Compliance, Handled for You',
          ar: 'امتثال مستمر، نتولّاه نيابةً عنك',
        },
        intro: {
          fr: "En tant qu'agent agréé de création d'entreprise au Tchad, nous gérons vos obligations légales et de secrétariat tout au long de l'année.",
          en: 'As a registered company-formation agent in Chad, we manage your statutory and secretarial requirements year-round.',
          ar: 'بصفتنا وكيلاً معتمداً لتأسيس الشركات في تشاد، نتولّى متطلباتك القانونية والسكرتارية على مدار العام.',
        },
        sections: [
          {
            title: { fr: 'Dépôts légaux', en: 'Statutory Filings', ar: 'الإيداعات القانونية' },
            description: {
              fr: 'Nous préparons et soumettons vos dépôts légaux dans les délais.',
              en: 'We prepare and submit your statutory filings on time.',
              ar: 'نُعدّ ونقدّم إيداعاتك القانونية في الوقت المحدد.',
            },
          },
          {
            title: { fr: 'Tenue des registres', en: 'Record Maintenance', ar: 'صيانة السجلات' },
            description: {
              fr: 'Vos registres et documents légaux tenus exacts et à jour.',
              en: 'Your statutory registers and records kept accurate and current.',
              ar: 'تُحفظ سجلاتك ووثائقك القانونية دقيقة ومحدّثة.',
            },
          },
          {
            title: { fr: 'Soutien à la mise en conformité', en: 'Good-Standing Support', ar: 'دعم الوضع القانوني السليم' },
            description: {
              fr: 'Un accompagnement continu pour maintenir votre entreprise en conformité.',
              en: 'Ongoing support to keep your company compliant.',
              ar: 'دعم مستمر للحفاظ على امتثال شركتك.',
            },
          },
        ],
        cta: { fr: 'Obtenir un soutien en secrétariat', en: 'Get Secretarial Support', ar: 'احصل على دعم السكرتارية' },
      },
      {
        id: 'company-dissolution',
        path: '/company-services/dissolution',
        menuLabel: { fr: "Dissolution d'entreprise", en: 'Company Dissolution', ar: 'حلّ الشركة' },
        heroTitle: {
          fr: 'Fermez votre entreprise — sans tracas',
          en: 'Close Your Company — Hassle-Free',
          ar: 'أغلق شركتك — دون عناء',
        },
        intro: {
          fr: "Un service à faible coût pour dissoudre votre entreprise immatriculée au Tchad, de la demande à la communication avec le registre.",
          en: 'A low-cost service to dissolve your Chad-registered company, from application to registry communication.',
          ar: 'خدمة منخفضة التكلفة لحلّ شركتك المسجّلة في تشاد، من تقديم الطلب إلى التواصل مع السجل.',
        },
        sections: [
          {
            title: { fr: 'Demande de dissolution', en: 'Dissolution Application', ar: 'طلب الحلّ' },
            description: {
              fr: 'Nous préparons et soumettons votre demande de dissolution.',
              en: 'We prepare and submit your dissolution application.',
              ar: 'نُعدّ ونقدّم طلب حلّ شركتك.',
            },
          },
          {
            title: { fr: 'Gestion du registre', en: 'Registry Handling', ar: 'التعامل مع السجل' },
            description: {
              fr: 'Nous gérons toute la communication avec le registre des sociétés du Tchad.',
              en: 'We manage all communication with the Chad company registry.',
              ar: 'نتولّى جميع المراسلات مع سجل الشركات في تشاد.',
            },
          },
          {
            title: { fr: 'À quoi s\'attendre', en: 'What to Expect', ar: 'ما يمكن توقّعه' },
            description: {
              fr: 'Des indications claires sur les délais et le processus de dissolution.',
              en: 'Clear guidance on timelines and the dissolution process.',
              ar: 'إرشادات واضحة حول المواعيد وإجراءات الحلّ.',
            },
          },
        ],
        cta: { fr: 'Dissoudre mon entreprise', en: 'Dissolve My Company', ar: 'حلّ شركتي' },
      },
      {
        id: 'trademark-registration',
        path: '/company-services/trademark',
        menuLabel: { fr: 'Enregistrement de marque', en: 'Trademark Registration', ar: 'تسجيل العلامة التجارية' },
        heroTitle: {
          fr: 'Protégez votre marque',
          en: 'Protect Your Brand',
          ar: 'احمِ علامتك التجارية',
        },
        intro: {
          fr: "Sécurisez l'identité de votre entreprise grâce à un accompagnement professionnel pour l'enregistrement de votre marque.",
          en: 'Secure your business identity with professional trademark registration support.',
          ar: 'احمِ هوية عملك من خلال دعم مهني لتسجيل العلامة التجارية.',
        },
        sections: [
          {
            title: { fr: 'Recherche de marque', en: 'Trademark Search', ar: 'البحث عن العلامة التجارية' },
            description: {
              fr: 'Nous vérifions la disponibilité avant le dépôt.',
              en: 'We check availability before you file.',
              ar: 'نتحقق من التوفّر قبل الإيداع.',
            },
          },
          {
            title: { fr: 'Dépôt de la demande', en: 'Application Filing', ar: 'إيداع الطلب' },
            description: {
              fr: 'Préparation et dépôt professionnels de votre demande.',
              en: 'Professional preparation and filing of your application.',
              ar: 'إعداد وإيداع مهنيان لطلبك.',
            },
          },
          {
            title: { fr: 'Protection continue', en: 'Ongoing Protection', ar: 'حماية مستمرة' },
            description: {
              fr: 'Conseils sur le maintien et la défense de votre marque.',
              en: 'Guidance on maintaining and enforcing your trademark.',
              ar: 'إرشادات حول الحفاظ على علامتك التجارية وإنفاذها.',
            },
          },
        ],
        cta: { fr: 'Enregistrer ma marque', en: 'Register My Trademark', ar: 'سجّل علامتي التجارية' },
      },
      {
        id: 'logo-brand-design',
        path: '/company-services/logo-brand-design',
        menuLabel: { fr: 'Conception de logo et de marque', en: 'Logo & Brand Design', ar: 'تصميم الشعار والعلامة التجارية' },
        heroTitle: {
          fr: 'Une identité professionnelle dès le premier jour',
          en: 'A Professional Identity From Day One',
          ar: 'هوية مهنية منذ اليوم الأول',
        },
        intro: {
          fr: "Renforcez votre marque grâce à une conception de logo et d'identité sur mesure.",
          en: 'Strengthen your brand with custom logo and identity design.',
          ar: 'عزّز علامتك التجارية بتصميم مخصّص للشعار والهوية.',
        },
        sections: [
          {
            title: { fr: 'Concepts de logo', en: 'Logo Concepts', ar: 'مفاهيم الشعار' },
            description: {
              fr: 'Plusieurs concepts originaux conçus pour votre marque.',
              en: 'Multiple original concepts crafted for your brand.',
              ar: 'عدة مفاهيم أصلية مصمّمة لعلامتك التجارية.',
            },
          },
          {
            title: { fr: 'Fichiers de marque', en: 'Brand Files', ar: 'ملفات العلامة التجارية' },
            description: {
              fr: 'Un jeu complet de fichiers de logo dans tous les formats dont vous avez besoin.',
              en: 'A full set of logo files in every format you need.',
              ar: 'مجموعة كاملة من ملفات الشعار بكل صيغة تحتاجها.',
            },
          },
          {
            title: { fr: 'Révisions incluses', en: 'Revisions Included', ar: 'المراجعات مشمولة' },
            description: {
              fr: "Affinez le concept choisi jusqu'à ce qu'il soit parfait.",
              en: "Refine your chosen concept until it's right.",
              ar: 'حسّن المفهوم الذي اخترته حتى يصبح مثالياً.',
            },
          },
        ],
        cta: { fr: 'Concevoir mon logo', en: 'Design My Logo', ar: 'صمّم شعاري' },
      },
      {
        id: 'business-bank-account',
        path: '/company-services/bank-account',
        menuLabel: { fr: 'Compte bancaire professionnel', en: 'Business Bank Account', ar: 'حساب مصرفي تجاري' },
        heroTitle: {
          fr: 'Ouvrez un compte bancaire professionnel avec des partenaires de confiance',
          en: 'Open a Business Bank Account With Trusted Partners',
          ar: 'افتح حساباً مصرفياً تجارياً مع شركاء موثوقين',
        },
        intro: {
          fr: "Nous vous mettons en relation avec des partenaires bancaires de confiance et des offres exclusives, y compris des primes en espèces à l'ouverture du compte.",
          en: 'We connect you with trusted banking partners and exclusive offers, including cash rewards on account opening.',
          ar: 'نوصلك بشركاء مصرفيين موثوقين وعروض حصرية، بما في ذلك مكافآت نقدية عند فتح الحساب.',
        },
        sections: [
          {
            title: { fr: 'Recommandations bancaires de confiance', en: 'Trusted Bank Referrals', ar: 'إحالات مصرفية موثوقة' },
            description: {
              fr: 'Présentations à des partenaires bancaires sélectionnés.',
              en: 'Introductions to vetted banking partners.',
              ar: 'تعريفات بشركاء مصرفيين تم التحقق منهم.',
            },
          },
          {
            title: { fr: 'Offres exclusives', en: 'Exclusive Offers', ar: 'عروض حصرية' },
            description: {
              fr: 'Accédez aux offres partenaires, y compris des primes en espèces.',
              en: 'Access partner offers, including cash rewards.',
              ar: 'احصل على عروض الشركاء، بما في ذلك المكافآت النقدية.',
            },
          },
          {
            title: { fr: 'Accompagnement tout au long du processus', en: 'Support Through the Process', ar: 'دعم خلال العملية' },
            description: {
              fr: "Un accompagnement de la demande à l'approbation.",
              en: 'Guidance from application to approval.',
              ar: 'إرشاد من تقديم الطلب حتى الموافقة.',
            },
          },
        ],
        cta: { fr: 'Ouvrir un compte', en: 'Open an Account', ar: 'افتح حساباً' },
      },
    ],
  },
  {
    id: 'communication',
    label: { fr: 'Télécoms', en: 'Telecoms', ar: 'الاتصالات' },
    overviewPath: '/communication',
    blurb: {
      fr: 'Permanence téléphonique, lignes fixes et numéros mobiles virtuels pour une image professionnelle.',
      en: 'Call answering, landline and virtual mobile numbers for a professional image.',
      ar: 'الرد على المكالمات والخطوط الأرضية والأرقام المحمولة الافتراضية من أجل صورة مهنية.',
    },
    pages: [
      {
        id: 'virtual-receptionist',
        path: '/communication/virtual-receptionist',
        menuLabel: { fr: 'Réceptionniste virtuel', en: 'Virtual Receptionist', ar: 'موظف استقبال افتراضي' },
        heroTitle: {
          fr: 'Ne manquez plus aucun appel important',
          en: 'Never Miss an Important Call',
          ar: 'لا تفوّت أي مكالمة مهمة',
        },
        intro: {
          fr: "Des appels pris au nom de votre entreprise, avec les messages et les coordonnées transmis instantanément.",
          en: "Calls answered in your company's name, with messages and details forwarded to you instantly.",
          ar: 'يُردّ على المكالمات باسم شركتك، مع إرسال الرسائل والتفاصيل إليك على الفور.',
        },
        sections: [
          {
            title: { fr: 'Appels pris en votre nom', en: 'Calls Answered in Your Name', ar: 'الرد على المكالمات باسمك' },
            description: {
              fr: 'Un réceptionniste professionnel répond au nom de votre entreprise.',
              en: 'A professional receptionist answers as your company.',
              ar: 'يردّ موظف استقبال محترف باسم شركتك.',
            },
          },
          {
            title: { fr: 'Transmission des messages', en: 'Message Forwarding', ar: 'إعادة توجيه الرسائل' },
            description: {
              fr: 'Messages et coordonnées des appelants envoyés instantanément.',
              en: 'Messages and caller details sent to you instantly.',
              ar: 'تُرسل الرسائل وتفاصيل المتصلين إليك على الفور.',
            },
          },
          {
            title: { fr: 'Image professionnelle', en: 'Professional Image', ar: 'صورة مهنية' },
            description: {
              fr: 'Projetez une présence soignée et bien établie.',
              en: 'Project a polished, established presence.',
              ar: 'اعرض حضوراً راقياً وراسخاً.',
            },
          },
        ],
        cta: { fr: 'Configurer la permanence téléphonique', en: 'Set Up Call Answering', ar: 'إعداد الرد على المكالمات' },
      },
      {
        id: 'business-voip',
        path: '/communication/voip-numbers',
        menuLabel: { fr: 'Numéros de téléphone professionnels', en: 'Business Phone Numbers', ar: 'أرقام هاتف تجارية' },
        heroTitle: {
          fr: 'Des numéros de téléphone professionnels',
          en: 'Professional Business Phone Numbers',
          ar: 'أرقام هاتف تجارية احترافية',
        },
        intro: {
          fr: "Obtenez un numéro de téléphone professionnel que vous pouvez utiliser pour passer et recevoir des appels depuis n'importe où dans le monde.",
          en: 'Get a professional business phone number you can use to make and receive calls from anywhere in the world.',
          ar: 'احصل على رقم هاتف تجاري احترافي يمكنك استخدامه لإجراء المكالمات واستقبالها من أي مكان في العالم.',
        },
        sections: [
          {
            title: { fr: 'Numéros locaux et internationaux', en: 'Local & International Numbers', ar: 'أرقام محلية ودولية' },
            description: {
              fr: 'Choisissez un numéro professionnel adapté à votre marché.',
              en: 'Choose a professional number that suits your market.',
              ar: 'اختر رقماً احترافياً يناسب سوقك.',
            },
          },
          {
            title: { fr: 'Utilisable partout', en: 'Use Anywhere', ar: 'استخدمه في أي مكان' },
            description: {
              fr: "Passez et recevez des appels depuis n'importe où dans le monde.",
              en: 'Make and receive calls from anywhere in the world.',
              ar: 'أجرِ المكالمات واستقبلها من أي مكان في العالم.',
            },
          },
          {
            title: { fr: 'Accès par application mobile', en: 'Mobile App Access', ar: 'الوصول عبر تطبيق الهاتف' },
            description: {
              fr: 'Gérez vos appels depuis une application mobile simple.',
              en: 'Manage your calls from a simple mobile app.',
              ar: 'أدِر مكالماتك من تطبيق هاتف بسيط.',
            },
          },
        ],
        cta: { fr: 'Obtenir un numéro professionnel', en: 'Get a Business Number', ar: 'احصل على رقم تجاري' },
      },
      {
        id: 'virtual-mobile',
        path: '/communication/virtual-mobile-numbers',
        menuLabel: { fr: 'Numéros mobiles virtuels', en: 'Virtual Mobile Numbers', ar: 'أرقام محمولة افتراضية' },
        heroTitle: {
          fr: 'Recevez SMS, codes OTP et appels partout',
          en: 'Receive SMS, OTPs & Calls Anywhere',
          ar: 'استقبل الرسائل النصية ورموز التحقق والمكالمات في أي مكان',
        },
        intro: {
          fr: "Des numéros mobiles virtuels flexibles avec SMS vers e-mail, messagerie vocale vers e-mail, enregistrement et renvoi d'appels.",
          en: 'Flexible virtual mobile numbers with SMS-to-email, voicemail-to-email, call recording, and diverting.',
          ar: 'أرقام محمولة افتراضية مرنة مع تحويل الرسائل النصية إلى البريد الإلكتروني، والبريد الصوتي إلى البريد الإلكتروني، وتسجيل المكالمات وتحويلها.',
        },
        sections: [
          {
            title: { fr: 'Réception de SMS et de codes OTP', en: 'SMS & OTP Reception', ar: 'استقبال الرسائل النصية ورموز التحقق' },
            description: {
              fr: 'Recevez de manière fiable les SMS et les codes à usage unique.',
              en: 'Receive text messages and one-time passcodes reliably.',
              ar: 'استقبل الرسائل النصية ورموز المرور لمرة واحدة بموثوقية.',
            },
          },
          {
            title: { fr: 'Messagerie vocale vers e-mail', en: 'Voicemail-to-Email', ar: 'البريد الصوتي إلى البريد الإلكتروني' },
            description: {
              fr: 'Messages vocaux livrés directement dans votre boîte de réception.',
              en: 'Voicemails delivered straight to your inbox.',
              ar: 'تُسلَّم الرسائل الصوتية مباشرةً إلى صندوق الوارد لديك.',
            },
          },
          {
            title: { fr: "Enregistrement et renvoi d'appels", en: 'Call Recording & Diverting', ar: 'تسجيل المكالمات وتحويلها' },
            description: {
              fr: 'Enregistrez les appels et renvoyez-les où vous le souhaitez.',
              en: 'Record calls and divert them wherever you need.',
              ar: 'سجّل المكالمات وحوّلها إلى حيثما تحتاج.',
            },
          },
        ],
        cta: { fr: 'Obtenir un numéro mobile virtuel', en: 'Get a Virtual Mobile Number', ar: 'احصل على رقم محمول افتراضي' },
      },
    ],
  },
  {
    id: 'back-office',
    label: { fr: 'Support administratif', en: 'Back Office Support', ar: 'الدعم الإداري' },
    overviewPath: '/back-office',
    blurb: {
      fr: 'Données, documents, transcription et assurance qualité — traités avec précision.',
      en: 'Data, documents, transcription and quality assurance — handled with precision.',
      ar: 'البيانات والمستندات والنسخ وضمان الجودة — تُعالَج بدقة.',
    },
    columns: 2,
    pages: [
      {
        id: 'data-input-management',
        path: '/back-office/data-input',
        menuLabel: { fr: 'Saisie et gestion de données', en: 'Data Input & Management', ar: 'إدخال البيانات وإدارتها' },
        heroTitle: {
          fr: 'Des données exactes, gérées de manière fiable',
          en: 'Accurate Data, Reliably Managed',
          ar: 'بيانات دقيقة تُدار بموثوقية',
        },
        intro: {
          fr: 'Saisie de données, vérification et mises à jour de bases de données professionnelles, réalisées avec précision.',
          en: 'Professional data entry, verification, and database updates with precision.',
          ar: 'إدخال بيانات احترافي وتحقّق وتحديثات لقواعد البيانات بدقة.',
        },
        note: { fr: 'À partir de 0,25 $ par page', en: 'From $0.25 per page', ar: 'ابتداءً من 0.25 $ للصفحة' },
        sections: [
          {
            title: { fr: 'Saisie et vérification manuelles', en: 'Manual Data Entry & Verification', ar: 'إدخال البيانات والتحقق منها يدوياً' },
            description: {
              fr: 'Saisie et vérification minutieuses de vos données.',
              en: 'Careful entry and verification of your data.',
              ar: 'إدخال وتحقق دقيقان لبياناتك.',
            },
          },
          {
            title: { fr: 'Alimentation et mise à jour des bases de données', en: 'Database Population & Updates', ar: 'تعبئة قواعد البيانات وتحديثها' },
            description: {
              fr: 'Alimentez et maintenez vos bases de données à jour.',
              en: 'Populate and keep your databases up to date.',
              ar: 'عبّئ قواعد بياناتك وحافظ على تحديثها.',
            },
          },
          {
            title: { fr: 'Validation et contrôle qualité', en: 'Validation & Quality Control', ar: 'التحقق ومراقبة الجودة' },
            description: {
              fr: "Des contrôles rigoureux d'exactitude et de cohérence.",
              en: 'Rigorous checks for accuracy and consistency.',
              ar: 'فحوصات صارمة للدقة والاتساق.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'data-conversion',
        path: '/back-office/data-conversion',
        menuLabel: { fr: 'Services de conversion de données', en: 'Data Conversion Services', ar: 'خدمات تحويل البيانات' },
        heroTitle: {
          fr: 'Conversion et migration de données sans heurts',
          en: 'Seamless Data Conversion & Migration',
          ar: 'تحويل البيانات وترحيلها بسلاسة',
        },
        intro: {
          fr: 'Transférez vos données en toute sécurité entre systèmes et formats avec un temps d\'arrêt minimal.',
          en: 'Securely transfer data between systems and formats with minimal downtime.',
          ar: 'انقل بياناتك بأمان بين الأنظمة والصيغ مع أدنى حدّ من التوقف.',
        },
        sections: [
          {
            title: { fr: 'Migration et import/export', en: 'Migration & Import/Export', ar: 'الترحيل والاستيراد/التصدير' },
            description: {
              fr: 'Déplacez vos données entre systèmes en toute sécurité et avec exactitude.',
              en: 'Move data between systems safely and accurately.',
              ar: 'انقل البيانات بين الأنظمة بأمان ودقة.',
            },
          },
          {
            title: { fr: 'Traitement de données par lots', en: 'Batch Data Processing', ar: 'معالجة البيانات بالدُفعات' },
            description: {
              fr: 'Traitez efficacement de grands volumes de données.',
              en: 'Process large data sets efficiently.',
              ar: 'عالج مجموعات البيانات الكبيرة بكفاءة.',
            },
          },
          {
            title: { fr: 'Conversion de format', en: 'Format Conversion', ar: 'تحويل الصيغة' },
            description: {
              fr: 'Convertissez entre formats sans perte d\'intégrité.',
              en: 'Convert between formats without losing integrity.',
              ar: 'حوّل بين الصيغ دون فقدان السلامة.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'data-extraction',
        path: '/back-office/data-extraction',
        menuLabel: { fr: 'Extraction et collecte de données', en: 'Data Extraction & Collection', ar: 'استخراج البيانات وجمعها' },
        heroTitle: {
          fr: 'Une extraction de données fiable',
          en: 'Reliable Data Extraction',
          ar: 'استخراج موثوق للبيانات',
        },
        intro: {
          fr: 'Extraction et collecte exactes de données, prêtes à être utilisées dans vos bases de données ou vos rapports.',
          en: 'Accurate extraction and collection of data, ready for use in your databases or reports.',
          ar: 'استخراج وجمع دقيقان للبيانات، جاهزان للاستخدام في قواعد بياناتك أو تقاريرك.',
        },
        sections: [
          {
            title: { fr: 'Extraction automatisée', en: 'Automated Extraction', ar: 'استخراج آلي' },
            description: {
              fr: 'Une extraction efficace à partir des sources de votre choix.',
              en: 'Efficient extraction from your chosen sources.',
              ar: 'استخراج فعّال من المصادر التي تختارها.',
            },
          },
          {
            title: { fr: 'Collecte de données', en: 'Data Collection', ar: 'جمع البيانات' },
            description: {
              fr: 'Une collecte structurée adaptée à vos besoins.',
              en: 'Structured collection tailored to your needs.',
              ar: 'جمع منظّم مصمّم وفقاً لاحتياجاتك.',
            },
          },
          {
            title: { fr: 'Résultat propre', en: 'Clean Output', ar: 'مخرجات نظيفة' },
            description: {
              fr: 'Livré prêt à l\'emploi dans vos bases de données ou vos rapports.',
              en: 'Delivered ready to use in databases or reports.',
              ar: 'يُسلَّم جاهزاً للاستخدام في قواعد البيانات أو التقارير.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'document-processing',
        path: '/back-office/document-processing',
        menuLabel: { fr: 'Traitement et mise en forme de documents', en: 'Document Processing & Formatting', ar: 'معالجة المستندات وتنسيقها' },
        heroTitle: {
          fr: 'Des documents soignés et professionnels',
          en: 'Polished, Professional Documents',
          ar: 'مستندات أنيقة واحترافية',
        },
        intro: {
          fr: 'Mise en forme et préparation de rapports, de propositions et de manuels selon un standard professionnel.',
          en: 'Formatting and preparation of reports, proposals, and manuals to a professional standard.',
          ar: 'تنسيق وإعداد التقارير والعروض والأدلة وفق معيار احترافي.',
        },
        note: { fr: 'À partir de 0,25 $ par page', en: 'From $0.25 per page', ar: 'ابتداءً من 0.25 $ للصفحة' },
        sections: [
          {
            title: { fr: 'Mise en forme', en: 'Formatting', ar: 'التنسيق' },
            description: {
              fr: 'Une mise en forme cohérente et professionnelle pour tout document.',
              en: 'Consistent, professional formatting for any document.',
              ar: 'تنسيق متسق واحترافي لأي مستند.',
            },
          },
          {
            title: { fr: 'Fusion et fractionnement', en: 'Merging & Splitting', ar: 'الدمج والتقسيم' },
            description: {
              fr: 'Combinez ou séparez les documents selon vos besoins.',
              en: 'Combine or separate documents as required.',
              ar: 'ادمج المستندات أو افصلها حسب الحاجة.',
            },
          },
          {
            title: { fr: 'Impression et reliure', en: 'Printing & Binding', ar: 'الطباعة والتجليد' },
            description: {
              fr: 'Le résultat final imprimé et relié selon les standards.',
              en: 'Final output printed and bound to standard.',
              ar: 'تُطبع المخرجات النهائية وتُجلَّد وفق المعايير.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'content-knowledge',
        path: '/back-office/content-knowledge',
        menuLabel: { fr: 'Gestion du contenu et des connaissances', en: 'Content & Knowledge Management', ar: 'إدارة المحتوى والمعرفة' },
        heroTitle: {
          fr: 'Organisez et valorisez votre base de connaissances',
          en: 'Organise and Empower Your Knowledge Base',
          ar: 'نظّم قاعدة معارفك وعزّزها',
        },
        intro: {
          fr: 'Des solutions sur mesure pour créer, organiser et gérer votre contenu et vos actifs de connaissances.',
          en: 'Tailored solutions to create, organise, and manage your content and knowledge assets.',
          ar: 'حلول مصمّمة خصيصاً لإنشاء محتواك وأصولك المعرفية وتنظيمها وإدارتها.',
        },
        sections: [
          {
            title: { fr: 'Mise en place de la base de connaissances', en: 'Knowledge Base Setup', ar: 'إعداد قاعدة المعرفة' },
            description: {
              fr: 'Construisez une base de connaissances structurée et interrogeable.',
              en: 'Build a structured, searchable knowledge base.',
              ar: 'ابنِ قاعدة معرفة منظّمة وقابلة للبحث.',
            },
          },
          {
            title: { fr: 'CMS (WordPress, Drupal, Joomla)', en: 'CMS (WordPress, Drupal, Joomla)', ar: 'نظام إدارة المحتوى (WordPress، Drupal، Joomla)' },
            description: {
              fr: 'Installation et configuration du CMS de votre choix.',
              en: 'Setup and configuration of your chosen CMS.',
              ar: 'تثبيت وتهيئة نظام إدارة المحتوى الذي تختاره.',
            },
          },
          {
            title: { fr: "Supports de formation et d'intégration", en: 'Training & Onboarding Materials', ar: 'مواد التدريب والإلحاق' },
            description: {
              fr: 'Des supports pour intégrer votre équipe et développer ses compétences.',
              en: 'Materials to onboard and upskill your team.',
              ar: 'مواد لإلحاق فريقك ورفع مهاراته.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'quality-assurance',
        path: '/back-office/quality-assurance',
        menuLabel: { fr: 'Assurance qualité et conformité', en: 'Quality Assurance & Compliance', ar: 'ضمان الجودة والامتثال' },
        heroTitle: {
          fr: 'Des données fiables et conformes',
          en: 'Reliable, Compliant Data',
          ar: 'بيانات موثوقة ومتوافقة',
        },
        intro: {
          fr: 'Une validation rigoureuse et un contrôle qualité pour garantir des données exactes et conformes.',
          en: 'Rigorous validation and quality control to keep your data accurate and compliant.',
          ar: 'تحقّق صارم ومراقبة جودة للحفاظ على دقة بياناتك وامتثالها.',
        },
        sections: [
          {
            title: { fr: 'Validation des données', en: 'Data Validation', ar: 'التحقق من البيانات' },
            description: {
              fr: "Des contrôles systématiques d'exactitude et d'exhaustivité.",
              en: 'Systematic checks for accuracy and completeness.',
              ar: 'فحوصات منهجية للدقة والاكتمال.',
            },
          },
          {
            title: { fr: 'Détection des erreurs et des doublons', en: 'Error & Duplicate Detection', ar: 'كشف الأخطاء والتكرارات' },
            description: {
              fr: 'Repérez et corrigez les erreurs et les enregistrements en double.',
              en: 'Find and resolve errors and duplicate records.',
              ar: 'اعثر على الأخطاء والسجلات المكرّرة وعالجها.',
            },
          },
          {
            title: { fr: 'Normes de conformité', en: 'Compliance Standards', ar: 'معايير الامتثال' },
            description: {
              fr: 'Alignées sur les exigences de conformité applicables.',
              en: 'Aligned to relevant compliance requirements.',
              ar: 'متوافقة مع متطلبات الامتثال ذات الصلة.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'document-security',
        path: '/back-office/document-security',
        menuLabel: { fr: 'Sécurité des documents et des données', en: 'Document & Data Security', ar: 'أمن المستندات والبيانات' },
        heroTitle: {
          fr: 'Protégez vos informations sensibles',
          en: 'Keep Sensitive Information Protected',
          ar: 'حافظ على حماية المعلومات الحساسة',
        },
        intro: {
          fr: 'Caviardage sécurisé et marquage de confidentialité pour protéger les données personnelles et propriétaires.',
          en: 'Secure redaction and confidentiality marking to protect personal and proprietary data.',
          ar: 'تنقيح آمن ووسم سرّية لحماية البيانات الشخصية والمملوكة.',
        },
        sections: [
          {
            title: { fr: 'Caviardage', en: 'Redaction', ar: 'التنقيح' },
            description: {
              fr: 'Supprimez en toute sécurité le contenu sensible de vos documents.',
              en: 'Securely remove sensitive content from documents.',
              ar: 'أزل المحتوى الحساس من المستندات بأمان.',
            },
          },
          {
            title: { fr: 'Marquage de confidentialité', en: 'Confidentiality Marking', ar: 'وسم السرّية' },
            description: {
              fr: 'Marquez et classez clairement les éléments confidentiels.',
              en: 'Clearly mark and classify confidential material.',
              ar: 'ضع علامة على المواد السرّية وصنّفها بوضوح.',
            },
          },
          {
            title: { fr: 'Processus conforme aux normes', en: 'Compliance-Aligned Process', ar: 'عملية متوافقة مع المعايير' },
            description: {
              fr: 'Traité selon des normes de conformité reconnues.',
              en: 'Handled to recognised compliance standards.',
              ar: 'يُعالَج وفق معايير امتثال معترف بها.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
      {
        id: 'transcription',
        path: '/back-office/transcription',
        menuLabel: { fr: 'Services de transcription', en: 'Transcription Services', ar: 'خدمات النسخ' },
        heroTitle: {
          fr: 'Transcription audio-texte précise',
          en: 'Accurate Audio-to-Text Transcription',
          ar: 'نسخ دقيق من الصوت إلى النص',
        },
        intro: {
          fr: 'Une transcription précise pour réunions, entretiens et webinaires, correctement mise en forme.',
          en: 'Precise transcription for meetings, interviews, and webinars, properly formatted.',
          ar: 'نسخ دقيق للاجتماعات والمقابلات والندوات عبر الإنترنت، منسّق بشكل صحيح.',
        },
        note: { fr: 'À partir de 0,01 $ par mot', en: 'From $0.01 per word', ar: 'ابتداءً من 0.01 $ للكلمة' },
        sections: [
          {
            title: { fr: 'Réunions et entretiens', en: 'Meetings & Interviews', ar: 'الاجتماعات والمقابلات' },
            description: {
              fr: 'Des transcriptions claires et exactes de vos conversations.',
              en: 'Clear, accurate transcripts of conversations.',
              ar: 'نسخ واضحة ودقيقة للمحادثات.',
            },
          },
          {
            title: { fr: 'Webinaires', en: 'Webinars', ar: 'الندوات عبر الإنترنت' },
            description: {
              fr: 'Transcription complète de webinaires et de présentations.',
              en: 'Full transcription of webinars and presentations.',
              ar: 'نسخ كامل للندوات عبر الإنترنت والعروض التقديمية.',
            },
          },
          {
            title: { fr: 'Résultat mis en forme', en: 'Formatted Output', ar: 'مخرجات منسّقة' },
            description: {
              fr: 'Livré correctement mis en forme et prêt à l\'emploi.',
              en: 'Delivered properly formatted and ready to use.',
              ar: 'يُسلَّم منسّقاً بشكل صحيح وجاهزاً للاستخدام.',
            },
          },
        ],
        cta: { fr: 'Obtenez un devis dès aujourd\'hui', en: 'Get a Quote Today', ar: 'احصل على عرض سعر اليوم' },
      },
    ],
  },
  {
    id: 'more',
    label: { fr: 'Ressources', en: 'Resources', ar: 'الموارد' },
    blurb: {
      fr: 'Analyses, partenariats et notre Zone Franche Internationale du Tchad, notre offre phare.',
      en: 'Insights, partnerships and our flagship Chad International Free Zone.',
      ar: 'رؤى وشراكات ومنطقتنا الحرة الدولية الرائدة في تشاد.',
    },
    custom: true,
    pages: [
      {
        id: 'insights',
        path: '/insights',
        menuLabel: { fr: 'Dernières analyses', en: 'Latest Insights', ar: 'أحدث الرؤى' },
        heroTitle: {
          fr: "Guides et analyses d'experts",
          en: 'Expert Guides & Insights',
          ar: 'أدلة ورؤى الخبراء',
        },
        intro: {
          fr: "Des conseils pratiques sur la création d'entreprise, la conformité et l'entrepreneuriat.",
          en: 'Practical guidance on business formation, compliance, and entrepreneurship.',
          ar: 'إرشادات عملية حول تأسيس الشركات والامتثال وريادة الأعمال.',
        },
        sections: [],
        cta: { fr: 'Lire les dernières analyses', en: 'Read the Latest', ar: 'اقرأ الأحدث' },
        ctaTo: '/insights',
      },
      {
        id: 'affiliate',
        path: '/affiliate',
        menuLabel: { fr: "Programme d'affiliation", en: 'Affiliate Programme', ar: 'برنامج الإحالة' },
        heroTitle: {
          fr: 'Devenez partenaire de GATE',
          en: 'Partner With GATE',
          ar: 'كن شريكاً مع GATE',
        },
        intro: {
          fr: 'Gagnez de l\'argent en recommandant des entreprises à nos services. Inscription simple, commissions transparentes.',
          en: 'Earn by referring businesses to our services. Simple sign-up, transparent commissions.',
          ar: 'اكسب من خلال إحالة الشركات إلى خدماتنا. تسجيل بسيط وعمولات شفّافة.',
        },
        sections: [],
        cta: { fr: 'Rejoindre le programme', en: 'Join the Programme', ar: 'انضم إلى البرنامج' },
        ctaTo: CONTACT,
      },
      {
        id: 'chad-free-zone',
        path: '/chad-free-zone',
        menuLabel: { fr: 'Zone Franche Internationale du Tchad', en: 'Chad International Free Zone', ar: 'المنطقة الحرة الدولية في تشاد' },
        heroTitle: {
          fr: 'Zone Franche Internationale du Tchad',
          en: 'Chad International Free Zone',
          ar: 'المنطقة الحرة الدولية في تشاد',
        },
        intro: {
          fr: 'Constituez votre société dans une zone franche africaine en plein essor, avec des avantages fiscaux et une mise en place entièrement à distance.',
          en: 'Incorporate in a fast-growing African free zone with tax advantages and full remote setup.',
          ar: 'أسّس شركتك في منطقة حرة أفريقية سريعة النمو، مع مزايا ضريبية وإعداد كامل عن بُعد.',
        },
        sections: [],
        cta: { fr: 'Découvrir la Zone Franche', en: 'Explore the Free Zone', ar: 'اكتشف المنطقة الحرة' },
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
