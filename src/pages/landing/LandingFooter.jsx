import React from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../lib/i18n';

export default function LandingFooter() {
  const { t, i18n } = useTranslation();

  const columns = [
    {
      titleKey: 'landing.footer.product',
      links: [
        { label: t('landing.nav.features'), href: '#features' },
        { label: t('landing.nav.pricing'), href: '#pricing' },
        { label: t('landing.nav.how'), href: '#how-it-works' },
        { label: 'Roadmap', href: '/roadmap' },
        { label: 'Changelog', href: '#' },
      ],
    },
    {
      titleKey: 'landing.footer.legal',
      links: [
        { label: t('legal.privacy'), href: '/privacypolicy' },
        { label: t('legal.terms'), href: '/termsofservice' },
        { label: t('legal.imprint'), href: '/imprint' },
        { label: t('landing.footer.cookies'), href: '#' },
      ],
    },
    {
      titleKey: 'landing.footer.contact',
      links: [
        { label: 'Support', href: 'mailto:support@strikeahead.app' },
        { label: t('landing.footer.press'), href: 'mailto:press@strikeahead.app' },
        { label: t('landing.footer.partnerships'), href: 'mailto:partner@strikeahead.app' },
        { label: t('landing.footer.become_coach'), href: '/coaches' },
      ],
    },
    {
      titleKey: 'landing.footer.social',
      links: [
        { label: '📱 Instagram', href: '#' },
        { label: '🐦 X / Twitter', href: '#' },
        { label: '💬 Discord', href: '#' },
        { label: '▶️ YouTube', href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-tide-300/10 pt-16 pb-10 px-6 lg:px-10" style={{ background: 'rgba(2,21,33,0.8)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {columns.map((col) => (
            <div key={col.titleKey}>
              <p className="font-display font-bold text-foam text-sm mb-4 uppercase tracking-widest">{t(col.titleKey)}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-foam/45 hover:text-foam text-sm transition-colors duration-200">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-tide-300/10 mb-8" />

        {/* Language switcher */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {LANGUAGES.map((lang) => (
            <button key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${i18n.language?.startsWith(lang.code) ? 'gradient-tide text-white' : 'glass-card text-foam/50 hover:text-foam'}`}>
              <span>{lang.flag}</span>{lang.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-tide flex items-center justify-center text-base glow-tide">🎣</div>
            <span className="font-display font-extrabold text-lg text-foam">Strike<span className="text-gradient-tide">Ahead</span></span>
          </div>
          <p className="text-foam/30 text-xs text-center">{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4 text-foam/30 text-xs">
            <a href="/privacypolicy" className="hover:text-foam transition-colors">Privacy</a>
            <span>·</span>
            <a href="/termsofservice" className="hover:text-foam transition-colors">Terms</a>
            <span>·</span>
            <a href="/imprint" className="hover:text-foam transition-colors">Imprint</a>
          </div>
        </div>
      </div>
    </footer>
  );
}