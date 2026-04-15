import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingFAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);

  const faqs = [1,2,3,4,5,6].map(n => ({
    q: t(`landing.faq.q${n}`),
    a: t(`landing.faq.a${n}`),
  }));

  return (
    <section id="faq" className="py-24 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-tide-400 text-sm font-bold uppercase tracking-widest">FAQ</span>
          <h2 className="font-display font-extrabold text-4xl text-foam mt-3">{t('landing.faq.title')}</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden"
              style={{ border: open === i ? '1px solid rgba(31,167,184,0.3)' : undefined }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="font-semibold text-foam text-sm lg:text-base">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                  <ChevronDown className={`w-5 h-5 transition-colors ${open === i ? 'text-tide-400' : 'text-foam/30'}`} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <div className="px-6 pb-5 text-foam/60 text-sm leading-relaxed border-t border-tide-300/10 pt-4">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}