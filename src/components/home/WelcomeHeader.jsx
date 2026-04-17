import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function getGreetingKey(hour) {
  if (hour >= 5 && hour < 12)  return 'morning';   // Guten Morgen
  if (hour >= 12 && hour < 17) return 'day';        // Guten Tag
  if (hour >= 17 && hour < 22) return 'evening';    // Guten Abend
  return 'night';                                    // Gute Nacht
}

const GREETING = {
  de: { morning: 'Guten Morgen', day: 'Guten Tag', evening: 'Guten Abend', night: 'Gute Nacht' },
  en: { morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good night' },
  es: { morning: 'Buenos días', day: 'Buenas tardes', evening: 'Buenas tardes', night: 'Buenas noches' },
  fr: { morning: 'Bonjour', day: 'Bon après-midi', evening: 'Bonsoir', night: 'Bonne nuit' },
  it: { morning: 'Buongiorno', day: 'Buon pomeriggio', evening: 'Buonasera', night: 'Buonanotte' },
  nl: { morning: 'Goedemorgen', day: 'Goedemiddag', evening: 'Goedenavond', night: 'Goede nacht' },
  pt: { morning: 'Bom dia', day: 'Boa tarde', evening: 'Boa tarde', night: 'Boa noite' },
  hr: { morning: 'Dobro jutro', day: 'Dobar dan', evening: 'Dobra večer', night: 'Laku noć' },
  tr: { morning: 'Günaydın', day: 'İyi günler', evening: 'İyi akşamlar', night: 'İyi geceler' },
  el: { morning: 'Καλημέρα', day: 'Καλησπέρα', evening: 'Καλησπέρα', night: 'Καληνύχτα' },
  sq: { morning: 'Mirëmëngjes', day: 'Mirëdita', evening: 'Mirëmbrëma', night: 'Natën e mirë' },
};

const WELCOME_BACK = {
  de: 'Willkommen zurück',
  en: 'Welcome back',
  es: 'Bienvenido de nuevo',
  fr: 'Bon retour',
  it: 'Ben tornato',
  nl: 'Welkom terug',
  pt: 'Bem-vindo de volta',
  hr: 'Dobrodošao natrag',
  tr: 'Tekrar hoş geldiniz',
  el: 'Καλωσήρθες ξανά',
  sq: 'Mirë se u ktheve',
};

export default function WelcomeHeader({ user }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'de';
  const hour = new Date().getHours();
  const greetKey = getGreetingKey(hour);
  const greeting = (GREETING[lang] || GREETING.de)[greetKey];
  const welcomeBack = WELCOME_BACK[lang] || WELCOME_BACK.de;
  const firstName = user?.full_name?.split(' ')[0] || 'Angler';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '🎣';

  const now = new Date();
  const dateStr = now.toLocaleDateString(i18n.language || 'de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex items-center gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid rgba(45,168,255,0.3)', boxShadow: '0 0 16px rgba(45,168,255,0.2)' }}>
        {user?.profile_photo
          ? <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center gradient-tide text-white font-display font-bold text-base">
              {initials}
            </div>
          )
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-foam/50 text-xs truncate">{greeting}</p>
        <p className="font-display font-extrabold text-foam text-lg leading-tight truncate">
          {welcomeBack}, {firstName}!
        </p>
        <p className="text-foam/30 text-[11px] truncate">{dateStr}</p>
      </div>
    </motion.div>
  );
}