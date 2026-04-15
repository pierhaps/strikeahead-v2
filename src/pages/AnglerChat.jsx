import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const CHANNELS = [
  { key: 'general', label: '🌊 Allgemein' },
  { key: 'freshwater', label: '🏞 Süßwasser' },
  { key: 'saltwater', label: '🌊 Salzwasser' },
  { key: 'de', label: '🇩🇪 Deutschland' },
  { key: 'at', label: '🇦🇹 Österreich' },
  { key: 'ch', label: '🇨🇭 Schweiz' },
  { key: 'it', label: '🇮🇹 Italien' },
  { key: 'gr', label: '🇬🇷 Griechenland' },
  { key: 'hr', label: '🇭🇷 Kroatien' },
  { key: 'al', label: '🇦🇱 Albanien' },
];

const CONTACT_REGEX = /(\+\d{6,}|@\w+|www\.|\.com|\.de|email|whatsapp|telegram|phone|tel:|mailto:)/i;

export default function AnglerChat() {
  const { t } = useTranslation();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [moderations, setModerations] = useState({});
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.ChatModeration.list()])
      .then(([u, mods]) => {
        setUser(u);
        const modMap = {};
        mods.forEach(m => { modMap[m.user_email] = m; });
        setModerations(modMap);
      });
  }, []);

  useEffect(() => {
    if (!channel) return;
    setLoading(true);
    base44.entities.Message.filter({ to_email: channel }, '-created_date', 50)
      .then(msgs => setMessages(msgs.reverse()))
      .finally(() => setLoading(false));
  }, [channel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const isFlagged = CONTACT_REGEX.test(input);
    const msg = await base44.entities.Message.create({
      from_email: user.email,
      to_email: channel,
      content: input,
      is_flagged: isFlagged,
    });
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const myMod = moderations[user?.email];
  const isBanned = myMod?.warning_level === 3;

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100dvh-80px)]">
        {!channel ? (
          /* Channel list */
          <div className="px-4 pt-6 pb-4 space-y-4">
            <div>
              <p className="text-foam/50 text-sm">{t('community.chat')}</p>
              <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.chat')}</h1>
            </div>
            <div className="space-y-2">
              {CHANNELS.map((ch, i) => (
                <motion.button key={ch.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setChannel(ch.key)}
                  className="w-full glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left">
                  <span className="text-xl w-8">{ch.label.split(' ')[0]}</span>
                  <span className="text-foam font-semibold text-sm">{ch.label.split(' ').slice(1).join(' ')}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat view */
          <>
            <div className="px-4 pt-5 pb-3 flex items-center gap-3 border-b border-tide-400/10">
              <button onClick={() => setChannel(null)}>
                <ChevronLeft className="w-5 h-5 text-tide-400" />
              </button>
              <h2 className="font-display font-bold text-foam">{CHANNELS.find(c => c.key === channel)?.label}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {loading ? (
                <div className="text-center py-8"><div className="w-6 h-6 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.from_email === user?.email;
                  const mod = moderations[msg.from_email];
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-xl gradient-tide flex items-center justify-center text-xs text-white font-bold flex-shrink-0 mt-1">
                        {msg.from_email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-1">
                          <span className="text-foam/40 text-[10px]">{msg.from_email?.split('@')[0]}</span>
                          {mod?.warning_level > 0 && (
                            <span className={`px-1 py-0 rounded text-[9px] font-bold ${mod.warning_level === 3 ? 'bg-red-500/20 text-red-400' : 'bg-sun-500/20 text-sun-400'}`}>
                              {mod.warning_level === 3 ? t('community.chat_banned') : '⚠'}
                            </span>
                          )}
                        </div>
                        <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? 'gradient-tide text-white' : 'glass-card text-foam'} ${msg.is_flagged ? 'border border-red-500/40' : ''}`}>
                          {msg.content}
                          {msg.is_flagged && <p className="text-red-400 text-[10px] mt-1">⚠ {t('community.chat_warning')}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 pb-4 pt-2">
              {isBanned ? (
                <div className="glass-card rounded-2xl px-4 py-3 text-center text-foam/40 text-sm">{t('community.chat_banned')}</div>
              ) : (
                <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={t('community.chat_placeholder')}
                    className="flex-1 bg-transparent text-foam placeholder-foam/30 text-sm outline-none" />
                  <button onClick={sendMessage}
                    className="w-9 h-9 rounded-xl gradient-tide flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}