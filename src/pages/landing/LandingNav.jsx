import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingNav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t('landing.nav.features'), href: '#features' },
    { label: t('landing.nav.how'), href: '#how-it-works' },
    { label: t('landing.nav.pricing'), href: '#pricing' },
    { label: t('landing.nav.faq'), href: '#faq' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-strong border-b border-tide-300/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-tide flex items-center justify-center glow-tide">
            <span className="text-lg">🎣</span>
          </div>
          <span className="font-display font-extrabold text-xl text-foam">Strike<span className="text-gradient-tide">Ahead</span></span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-foam/60 hover:text-foam text-sm font-medium transition-colors duration-200">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="#pricing" className="px-5 py-2.5 rounded-xl gradient-tide font-display font-bold text-white text-sm glow-tide hover:opacity-90 transition-opacity">
            {t('landing.nav.cta')}
          </a>
        </div>

        <button className="md:hidden text-foam/70 hover:text-foam" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-strong border-t border-tide-300/10 px-6 py-5 space-y-4">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-foam/70 hover:text-foam font-medium">{l.label}</a>
          ))}
          <a href="#pricing" className="block text-center py-3 rounded-xl gradient-tide font-display font-bold text-white glow-tide">
            {t('landing.nav.cta')}
          </a>
        </motion.div>
      )}
    </header>
  );
}