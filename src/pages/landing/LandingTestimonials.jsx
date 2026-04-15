import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Lars Bergmann',
    role: 'Hobbyangler, Hamburg',
    avatar: '🧔',
    stars: 5,
    text: 'Seit ich StrikeAhead nutze, hat sich meine Fangquote verdoppelt. Die KI-Vorhersagen sind erschreckend präzise – mein bester Hecht kam genau in dem Fenster, das die App empfohlen hatte.',
  },
  {
    name: 'Maria Hoffmann',
    role: 'Meeresanglerin, Kiel',
    avatar: '👩‍🦱',
    stars: 5,
    text: 'Der Lizenz-Manager allein ist das Abo wert. Ich angle in 5 verschiedenen Ländern und hab endlich alle Scheine im Blick. Dazu noch die Community – absolute Empfehlung!',
  },
  {
    name: 'Stefan Kowalczyk',
    role: 'Turnierangler, München',
    avatar: '👨‍🦲',
    stars: 5,
    text: 'Der Trust-Score hat Turniere fairer gemacht. Keine gefakten Fänge mehr – jeder sieht sofort ob ein Fang GPS-verifiziert ist. Endlich eine App, die Sportangler ernst nimmt.',
  },
];

const tideEase = [0.2, 0.8, 0.2, 1];

export default function LandingTestimonials() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((a) => (a + 1) % testimonials.length);

  const t = testimonials[active];

  return (
    <section className="py-24 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-tide-400 text-sm font-bold uppercase tracking-widest">Stimmen</span>
        <h2 className="font-display font-extrabold text-4xl text-foam mt-3 mb-12">
          Was Angler sagen
        </h2>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: tideEase }}
              className="glass-card rounded-3xl p-8 lg:p-12 mb-8"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-sun-400 fill-sun-400" />
                ))}
              </div>

              <blockquote className="text-foam text-lg lg:text-xl leading-relaxed font-medium mb-8">
                "{t.text}"
              </blockquote>

              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(31,167,184,0.12)', border: '1px solid rgba(31,167,184,0.25)' }}
                >
                  {t.avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-foam">{t.name}</p>
                  <p className="text-foam/40 text-sm">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-foam/60 hover:text-foam transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-tide-400 w-6' : 'bg-foam/20 w-2'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-foam/60 hover:text-foam transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}