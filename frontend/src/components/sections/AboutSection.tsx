import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr } from '@/lib/i18n'

/**
 * Intro / about block — mirrors the reference "International Business Support
 * Solutions" copy, localised to company formation and virtual offices in Chad.
 */
export function AboutSection() {
  const tr = useTr()

  return (
    <section id="about" className="relative overflow-hidden py-16 sm:py-20">
      {/* Blurred background image — kept vivid (no fade), only blurred */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
        style={{ backgroundImage: "url('/blurbg.png')" }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 text-center sm:px-8">
        <SectionLabel>
          {tr({ fr: 'Qui nous sommes', en: 'Who we are', ar: 'من نحن' })}
        </SectionLabel>
        <h2 className="max-w-2xl font-display text-display-md font-bold text-white sm:text-display-lg sm:text-frost">
          {tr({
            fr: 'Solutions de soutien aux entreprises à l’international, pour les PME et les grandes entreprises',
            en: 'International business support solutions for SMEs and large enterprises',
            ar: 'حلول دعم الأعمال الدولية للشركات الصغيرة والمتوسطة والكبيرة',
          })}
        </h2>

        <div className="flex flex-col gap-5 text-left">
          <p className="font-body text-base leading-relaxed text-frost/65">
            {tr({
              fr: 'GATE est un prestataire officiellement agréé de services de création d’entreprise et de services aux sociétés pour la République du Tchad. En coordination étroite avec les autorités nationales compétentes, nous aidons les entrepreneurs, les start-up, les PME et les grandes entreprises à établir, développer et gérer leurs activités au Tchad en toute confiance réglementaire.',
              en: 'GATE is an officially accredited business-formation and corporate-services provider for the Republic of Chad. Working in close coordination with the relevant national authorities, we help entrepreneurs, start-ups, SMEs and large enterprises establish, grow and manage their operations in Chad with full regulatory confidence.',
              ar: 'GATE هي جهة معتمدة رسميًا لتقديم خدمات تأسيس الأعمال والخدمات المؤسسية لجمهورية تشاد. وبالتنسيق الوثيق مع السلطات الوطنية المعنية، نساعد رواد الأعمال والشركات الناشئة والشركات الصغيرة والمتوسطة والكبيرة على تأسيس أعمالهم وتنميتها وإدارتها في تشاد بثقة تنظيمية كاملة.',
            })}
          </p>
          <p className="font-body text-base leading-relaxed text-frost/65">
            {tr({
              fr: 'En tant qu’agent enregistré agréé, notre mission principale couvre la constitution de sociétés et les adresses professionnelles officielles au Tchad. Nous gérons l’intégralité du processus — de la réservation du nom de votre société et la préparation de vos documents de constitution à leur dépôt auprès des autorités et à la mise à jour de vos registres légaux — afin que votre société demeure toujours en règle.',
              en: 'As an authorised registered agent, our core mandate covers company incorporation and official business addresses in Chad. We manage the entire process — from reserving your company name and preparing your incorporation documents to filing them with the authorities and keeping your statutory records current — so your company always remains in good standing.',
              ar: 'بصفتنا وكيلًا مسجَّلًا معتمدًا، تشمل مهمتنا الأساسية تأسيس الشركات والعناوين التجارية الرسمية في تشاد. نحن ندير العملية بأكملها — من حجز اسم شركتك وإعداد مستندات التأسيس إلى تقديمها للسلطات والحفاظ على سجلاتك القانونية محدّثة — لتظل شركتك دائمًا في وضع نظامي سليم.',
            })}
          </p>
          <p className="font-body text-base leading-relaxed text-frost/65">
            {tr({
              fr: 'Notre service de bureau virtuel agréé offre à votre entreprise une présence professionnelle reconnue et immédiate, sans le coût d’un bureau physique. Nous fournissons une adresse professionnelle conforme avec gestion et réexpédition sécurisées du courrier, afin que vous ne manquiez jamais une correspondance officielle — où que vous soyez dans le monde.',
              en: 'Our accredited virtual office service gives your business an instant, recognised professional presence without the cost of a physical office. We provide a compliant business address with secure mail handling and forwarding, so you never miss official correspondence — wherever in the world you happen to be.',
              ar: 'تمنح خدمة المكتب الافتراضي المعتمدة لدينا أعمالك حضورًا مهنيًا فوريًا ومعترفًا به دون تكلفة مكتب فعلي. نوفر عنوانًا تجاريًا متوافقًا مع معالجة وإعادة توجيه آمنة للبريد، حتى لا تفوتك أي مراسلة رسمية — أينما كنت في العالم.',
            })}
          </p>
        </div>
      </div>
    </section>
  )
}
