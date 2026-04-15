import React from 'react';

const columns = [
  {
    title: 'Produkt',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Preise', href: '#pricing' },
      { label: "So funktioniert's", href: '#how-it-works' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Rechtliches',
    links: [
      { label: 'Datenschutz', href: '/privacypolicy' },
      { label: 'AGB', href: '/termsofservice' },
      { label: 'Impressum', href: '/imprint' },
      { label: 'Cookie-Richtlinie', href: '#' },
    ],
  },
  {
    title: 'Kontakt',
    links: [
      { label: 'Support', href: 'mailto:support@strikeahead.app' },
      { label: 'Presse', href: 'mailto:press@strikeahead.app' },
      { label: 'Partnerships', href: 'mailto:partner@strikeahead.app' },
      { label: 'Coach werden', href: '/coaches' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: '📱 Instagram', href: '#' },
      { label: '🐦 X / Twitter', href: '#' },
      { label: '💬 Discord', href: '#' },
      { label: '▶️ YouTube', href: '#' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer
      className="border-t border-tide-300/10 pt-16 pb-10 px-6 lg:px-10"
      style={{ background: 'rgba(2,21,33,0.8)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display font-bold text-foam text-sm mb-4 uppercase tracking-widest">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-foam/45 hover:text-foam text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-tide-300/10 mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-tide flex items-center justify-center text-base glow-tide">
              🎣
            </div>
            <span className="font-display font-extrabold text-lg text-foam">
              Strike<span className="text-gradient-tide">Ahead</span>
            </span>
          </div>

          <p className="text-foam/30 text-xs text-center">
            © {new Date().getFullYear()} NOMDAD LLC · Dover, Delaware, USA · All rights reserved
          </p>

          <div className="flex items-center gap-4 text-foam/30 text-xs">
            <a href="/privacypolicy" className="hover:text-foam transition-colors">Privacy</a>
            <span>·</span>
            <a href="/termsofservice" className="hover:text-foam transition-colors">Terms</a>
            <span>·</span>
            <a href="/imprint" className="hover:text-foam transition-colors">Impressum</a>
          </div>
        </div>
      </div>
    </footer>
  );
}