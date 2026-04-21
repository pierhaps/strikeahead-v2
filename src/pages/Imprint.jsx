import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const ANCHOR_IDS = ['company', 'contact', 'liability', 'copyright'];

export default function Imprint() {
  const { t } = useTranslation();

  const anchors = ANCHOR_IDS.map(id => ({
    id,
    label: t(`imprint.anchor_${id}`),
  }));

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-12 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('legal.imprint')}</h1>
          <p className="text-foam/40 text-xs mt-1">{t('imprint.subtitle')}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 flex gap-3 flex-wrap">
          {anchors.map(a => (
            <a key={a.id} href={`#${a.id}`} className="text-tide-400 text-xs underline">{a.label}</a>
          ))}
        </div>

        {/* Company */}
        <section id="company" className="glass-card rounded-2xl p-5 space-y-1 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-3">{t('imprint.company_title')}</h2>
          <p className="text-foam/80 text-sm font-bold">NOMDAD LLC</p>
          <p className="text-foam/60 text-sm">8 The Green, Suite A</p>
          <p className="text-foam/60 text-sm">Dover, DE 19901</p>
          <p className="text-foam/60 text-sm">USA</p>
          <p className="text-foam/40 text-sm mt-2">{t('imprint.register_type')}</p>
          <p className="text-foam/70 text-sm">{t('imprint.register_number')}</p>

        </section>

        {/* Contact */}
        <section id="contact" className="glass-card rounded-2xl p-5 space-y-2 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-3">{t('imprint.contact_title')}</h2>
          <p className="text-foam/60 text-sm">{t('imprint.email_label')}: <a href="mailto:info@nomdad.com" className="text-tide-400 underline">info@nomdad.com</a></p>
          <p className="text-foam/60 text-sm">{t('imprint.website_label')}: <a href="https://nomdad.com" className="text-tide-400 underline">nomdad.com</a></p>
        </section>

        {/* Liability */}
        <section id="liability" className="glass-card rounded-2xl p-5 space-y-3 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-1">{t('imprint.liability_title')}</h2>
          <div>
            <h3 className="text-foam/70 text-sm font-semibold mb-1">{t('imprint.liability_content_title')}</h3>
            <p className="text-foam/50 text-sm leading-relaxed">{t('imprint.liability_content_text')}</p>
          </div>
          <div>
            <h3 className="text-foam/70 text-sm font-semibold mb-1">{t('imprint.liability_links_title')}</h3>
            <p className="text-foam/50 text-sm leading-relaxed">{t('imprint.liability_links_text')}</p>
          </div>
        </section>

        {/* Copyright */}
        <section id="copyright" className="glass-card rounded-2xl p-5 scroll-mt-4">
          <h2 className="font-display font-bold text-foam mb-3">{t('imprint.copyright_title')}</h2>
          <p className="text-foam/50 text-sm leading-relaxed">{t('imprint.copyright_text')}</p>
        </section>

        <p className="text-center text-foam/20 text-xs">© 2026 NOMDAD LLC · StrikeAhead</p>
      </div>
    </PageTransition>
  );
}