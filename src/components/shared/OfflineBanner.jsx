import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfflineBanner({ onBackOnline }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'de';
  const [offline, setOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  const LABELS = {
    de: { offline: 'Offline-Modus — gespeicherte Daten werden angezeigt', syncing: 'Wird synchronisiert…' },
    en: { offline: 'Offline mode — showing cached data', syncing: 'Syncing…' },
  };
  const label = (LABELS[lang] || LABELS.de)[syncing ? 'syncing' : 'offline'];

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = async () => {
      setSyncing(true);
      if (onBackOnline) await onBackOnline();
      setSyncing(false);
      setOffline(false);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [onBackOnline]);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -32 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold"
          style={{
            background: 'linear-gradient(90deg, rgba(245,168,0,0.18), rgba(245,168,0,0.10))',
            borderBottom: '1px solid rgba(245,168,0,0.25)',
            backdropFilter: 'blur(12px)',
            paddingTop: 'calc(env(safe-area-inset-top) + 0.4rem)',
          }}
        >
          {syncing
            ? <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
          <span style={{ color: '#F5A800' }}>{label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}