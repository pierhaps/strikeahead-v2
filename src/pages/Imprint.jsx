import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const ANCHORS = [
  { id: 'company', label: 'Angaben' },
  { id: 'contact', label: 'Kontakt' },
  { id: 'liability', label: 'Haftung' },
  { id: 'copyright', label: 'Urheberrecht' },
];

export default function Imprint() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-12 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('legal.imprint')}</h1>
          <p className="text-foam/40 text-xs mt-1">Angaben gemäß § 5 TMG</p>
        </div>

        {/* TOC */}
        <div className="glass-card rounded-2xl p-4 flex gap-3 flex-wrap">
          {ANCHORS.map(a => (
            <a key={a.id} href={`#${a.id}`} className="text-tide-400 text-xs underline">{a.label}</a>
          ))}
        </div>

        {/* Company */}
        <section id="company" className="glass-card rounded-2xl p-5 space-y-1 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-3">Unternehmensangaben</h2>
          <p className="text-foam/80 text-sm font-bold">NOMDAD LLC</p>
          <p className="text-foam/60 text-sm">8 The Green, Suite A</p>
          <p className="text-foam/60 text-sm">Dover, DE 19901</p>
          <p className="text-foam/60 text-sm">USA</p>
          <p className="text-foam/40 text-sm mt-2">Vertreten durch:</p>
          <p className="text-foam/70 text-sm">André Kremmer (Geschäftsführer)</p>
          <p className="text-foam/40 text-sm mt-2">Registerart: Delaware LLC</p>
          <p className="text-foam/70 text-sm">Registernummer: [Delaware File Number — wird nachgetragen]</p>
          <p className="text-foam/40 text-sm mt-2">USt-IdNr.: [wird nachgetragen]</p>
        </section>

        {/* Contact */}
        <section id="contact" className="glass-card rounded-2xl p-5 space-y-2 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-3">Kontakt</h2>
          <p className="text-foam/60 text-sm">E-Mail: <a href="mailto:info@nomdad.com" className="text-tide-400 underline">info@nomdad.com</a></p>
          <p className="text-foam/60 text-sm">Website: <a href="https://nomdad.com" className="text-tide-400 underline">nomdad.com</a></p>
        </section>

        {/* Liability */}
        <section id="liability" className="glass-card rounded-2xl p-5 space-y-3 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-1">Haftungshinweise</h2>
          <div>
            <h3 className="text-foam/70 text-sm font-semibold mb-1">Haftung für Inhalte</h3>
            <p className="text-foam/50 text-sm leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>
          <div>
            <h3 className="text-foam/70 text-sm font-semibold mb-1">Haftung für Links</h3>
            <p className="text-foam/50 text-sm leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </div>
        </section>

        {/* Copyright */}
        <section id="copyright" className="glass-card rounded-2xl p-5 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-3">Urheberrecht</h2>
          <p className="text-foam/50 text-sm leading-relaxed">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
          </p>
        </section>

        <p className="text-center text-foam/20 text-xs">© 2026 NOMDAD LLC · StrikeAhead</p>
      </div>
    </PageTransition>
  );
}