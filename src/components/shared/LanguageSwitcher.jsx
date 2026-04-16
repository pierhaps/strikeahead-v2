import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import i18n, { LANGUAGES } from '@/lib/i18n';

/**
 * LanguageSwitcher — Brand v3
 *
 * Variants:
 *   compact  → 44x44 icon button (for nav bars)
 *   inline   → full-width dropdown button (for drawer/settings)
 *   chips    → horizontal pill row (for onboarding)
 */
export default function LanguageSwitcher({ variant = 'inline', align = 'left' }) {
  const { i18n: i18nInstance } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === i18nInstance.language) || LANGUAGES[0];
  const wrapRef = useRef(null);

  // click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const change = (code) => {
    i18n.changeLanguage(code);
    try { localStorage.setItem('strikeahead_lang', code); } catch {}
    setOpen(false);
  };

  if (variant === 'chips') {
    return (
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {LANGUAGES.map((l) => {
          const active = l.code === current.code;
          return (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-tide-500/20 to-mint-400/15 text-foam border border-tide-400/30'
                  : 'bg-foam/5 text-foam/60 border border-foam/10 hover:text-foam hover:bg-foam/10'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div ref={wrapRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          aria-label="Language"
          className="w-11 h-11 rounded-full flex items-center justify-center text-foam/70 hover:text-foam bg-foam/5 hover:bg-foam/10 border border-foam/10 transition-all"
        >
          <span className="text-lg leading-none">{current.flag}</span>
        </button>
        <LangMenu open={open} align={align} current={current} onPick={change} />
      </div>
    );
  }

  // inline (default)
  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-foam/5 hover:bg-foam/10 border border-foam/10 transition-all text-sm"
      >
        <Globe className="w-4 h-4 text-tide-400 flex-shrink-0" />
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="flex-1 text-left font-medium text-foam">{current.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-foam/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <LangMenu open={open} align={align} current={current} onPick={change} />
    </div>
  );
}

function LangMenu({ open, align, current, onPick }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          className={`absolute z-[62] mt-2 w-56 rounded-2xl overflow-hidden glass-strong border border-foam/10 shadow-2xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            background: 'linear-gradient(180deg, #0A1828 0%, #02152B 100%)',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {LANGUAGES.map((l) => {
            const active = l.code === current.code;
            return (
              <button
                key={l.code}
                onClick={() => onPick(l.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  active ? 'bg-tide-500/10 text-foam' : 'text-foam/70 hover:bg-foam/5 hover:text-foam'
                }`}
              >
                <span className="text-lg leading-none">{l.flag}</span>
                <span className="flex-1 text-left font-medium">{l.label}</span>
                {active && <Check className="w-4 h-4 text-tide-400" />}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
