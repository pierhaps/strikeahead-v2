import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Ist StrikeAhead wirklich kostenlos nutzbar?',
    a: 'Ja! Der Free-Plan ist dauerhaft kostenlos. Du kannst bis zu 10 Fänge pro Monat loggen, die KI-Arterkennung nutzen und den Community Feed lesen. Ein Upgrade ist jederzeit möglich und monatlich kündbar.',
  },
  {
    q: 'Auf welchen Plattformen ist die App verfügbar?',
    a: 'StrikeAhead läuft als Web-App im Browser (Desktop & Mobile), als native iOS App im Apple App Store sowie als Android App im Google Play Store. Alle Plattformen sind vollständig synchronisiert.',
  },
  {
    q: 'Wie genau sind die KI-Fangvorhersagen?',
    a: 'Die Vorhersagegenauigkeit steigt mit jedem geloggten Fang. Unser Modell kombiniert deine persönliche Fanghistorie mit Wetterdaten, Solunar-Phasen, Gezeitenkalendern und Community-Daten. Nach ca. 20 Fängen sind Vorhersagen signifikant personalisiert.',
  },
  {
    q: 'In welchen Ländern funktioniert der Lizenz-Manager?',
    a: 'Aktuell werden Angellizenzen aus Deutschland, Österreich, Schweiz, Niederlande, Belgien, Frankreich, Spanien, Portugal, Italien, Kroatien, Polen, Dänemark, Schweden und Norwegen unterstützt. Weitere Länder folgen.',
  },
  {
    q: 'Werden meine GPS-Daten und Fangspots geteilt?',
    a: 'Niemals ohne deine Erlaubnis. Jeder Fang ist standardmäßig nur für dich sichtbar. Du entscheidest selbst, was du mit der Community teilst. GPS-Koordinaten werden verschlüsselt gespeichert und nie an Dritte weitergegeben.',
  },
  {
    q: 'Kann ich StrikeAhead auch als Angel-Coach nutzen?',
    a: 'Ja! Mit dem Legend-Plan kannst du dein Coaching-Profil erstellen, Schüler annehmen, Buchungen verwalten und sogar eigene Turniere ausrichten. Viele Profi-Angler nutzen StrikeAhead als digitale Visitenkarte.',
  },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-24 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-tide-400 text-sm font-bold uppercase tracking-widest">FAQ</span>
          <h2 className="font-display font-extrabold text-4xl text-foam mt-3">
            Häufige Fragen
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl overflow-hidden"
              style={{ border: open === i ? '1px solid rgba(31,167,184,0.3)' : undefined }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold text-foam text-sm lg:text-base">{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${open === i ? 'text-tide-400' : 'text-foam/30'}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 text-foam/60 text-sm leading-relaxed border-t border-tide-300/10 pt-4">
                      {faq.a}
                    </div>
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