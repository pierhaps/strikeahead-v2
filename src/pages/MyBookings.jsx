import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Euro, MessageCircle, Send, X } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const STATUS_CONFIG = {
  pending: { label: 'Ausstehend', bg: 'rgba(245,195,75,0.12)', color: '#F5C34B', border: 'rgba(245,195,75,0.3)' },
  confirmed: { label: 'Bestätigt', bg: 'rgba(31,167,184,0.12)', color: '#4DC3D1', border: 'rgba(31,167,184,0.3)' },
  completed: { label: 'Abgeschlossen', bg: 'rgba(31,167,184,0.08)', color: '#1FA7B8', border: 'rgba(31,167,184,0.2)' },
  cancelled: { label: 'Storniert', bg: 'rgba(255,107,91,0.1)', color: '#FF6B5B', border: 'rgba(255,107,91,0.25)' },
};

function BookingDetail({ booking, onClose, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.entities.Message.filter({ booking_id: booking.id }, '-created_date', 50)
      .then(data => setMessages((data || []).reverse()))
      .catch(() => {});
  }, [booking.id]);

  const sendMsg = async () => {
    if (!msg.trim()) return;
    setSending(true);
    const newMsg = await base44.entities.Message.create({
      from_email: userEmail,
      to_email: booking.coach_email,
      content: msg,
      booking_id: booking.id,
    });
    setMessages(prev => [...prev, newMsg]);
    setMsg('');
    setSending(false);
  };

  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(2,21,33,0.85)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-strong border-b border-tide-300/10 px-4 py-4 flex items-center gap-3">
        <button onClick={onClose}><X className="w-5 h-5 text-foam/60" /></button>
        <div className="flex-1">
          <p className="font-display font-bold text-foam">Buchung</p>
          <p className="text-foam/40 text-xs">{booking.coach_email}</p>
        </div>
        <span className="px-2.5 py-1 rounded-xl text-xs font-bold"
          style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
      </div>

      <div className="p-4 space-y-3">
        <div className="glass-card rounded-2xl p-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <Calendar className="w-4 h-4 text-tide-400 mx-auto mb-1" />
            <p className="text-foam font-semibold text-xs">{booking.date}</p>
            <p className="text-foam/40 text-[10px]">Datum</p>
          </div>
          <div className="text-center">
            <Clock className="w-4 h-4 text-tide-400 mx-auto mb-1" />
            <p className="text-foam font-semibold text-xs">{booking.time || '—'}</p>
            <p className="text-foam/40 text-[10px]">{booking.duration_hours}h</p>
          </div>
          <div className="text-center">
            <Euro className="w-4 h-4 text-sun-400 mx-auto mb-1" />
            <p className="font-display font-bold text-sun-400 text-sm">{booking.total_amount}€</p>
            <p className="text-foam/40 text-[10px]">Gesamt</p>
          </div>
        </div>
        {booking.location && (
          <p className="text-foam/50 text-sm px-1">📍 {booking.location}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-foam/30 text-sm">Noch keine Nachrichten</div>
        ) : messages.map(m => (
          <div key={m.id} className={`flex ${m.from_email === userEmail ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3.5 py-2.5 rounded-2xl text-sm ${
              m.from_email === userEmail ? 'gradient-tide text-white' : 'glass-card text-foam'
            }`}>
              <p>{m.content}</p>
              <p className={`text-[10px] mt-1 ${m.from_email === userEmail ? 'text-white/50' : 'text-foam/30'}`}>
                {m.created_date?.split('T')[0]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 pb-safe flex items-center gap-3 border-t border-tide-300/10">
        <input value={msg} onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
          placeholder="Nachricht senden..."
          className="flex-1 glass-card rounded-2xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none" />
        <button onClick={sendMsg} disabled={sending || !msg.trim()}
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${msg.trim() ? 'gradient-tide glow-tide' : 'bg-abyss-700'}`}>
          <Send className={`w-4 h-4 ${msg.trim() ? 'text-white' : 'text-foam/30'}`} />
        </button>
      </div>
    </motion.div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.Booking.list('-date', 100),
    ]).then(([u, data]) => {
      setUser(u);
      const mine = (data || []).filter(b => b.student_email === u?.email || b.coach_email === u?.email);
      setBookings(mine);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled');
  const past = bookings.filter(b => b.date < today || b.status === 'completed' || b.status === 'cancelled');
  const shown = tab === 'upcoming' ? upcoming : past;

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">Deine Coach-Sessions</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Meine Buchungen</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[['upcoming', `Kommende (${upcoming.length})`], ['past', `Vergangene (${past.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === key ? 'gradient-tide text-white glow-tide' : 'glass-card text-foam/60'}`}>
              {label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-display font-bold text-foam text-lg">Keine Buchungen</p>
            <p className="text-foam/40 text-sm mt-2 mb-6">
              {tab === 'upcoming' ? 'Buche eine Session mit einem Coach' : 'Noch keine abgeschlossenen Sitzungen'}
            </p>
            {tab === 'upcoming' && (
              <a href="/coaches" className="inline-block px-6 py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
                Coach finden
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((b, i) => {
              const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <motion.button key={b.id} onClick={() => setSelected(b)}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: tideEase }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full glass-card rounded-2xl p-4 text-left">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl gradient-tide flex items-center justify-center text-xl">🎣</div>
                      <div>
                        <p className="text-foam font-semibold text-sm">
                          {b.coach_email === user?.email ? b.student_email : b.coach_email}
                        </p>
                        <p className="text-foam/40 text-xs">
                          {b.coach_email === user?.email ? 'Student' : 'Coach'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-foam/50">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.date}</span>
                    {b.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.time}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.duration_hours}h</span>
                    <span className="font-bold text-sun-400 ml-auto">{b.total_amount}€</span>
                  </div>
                  {b.notes && <p className="text-foam/40 text-xs mt-2 truncate">{b.notes}</p>}
                  <div className="flex items-center gap-1.5 mt-2">
                    <MessageCircle className="w-3.5 h-3.5 text-tide-400" />
                    <span className="text-tide-400 text-xs">Nachricht senden</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <BookingDetail booking={selected} onClose={() => setSelected(null)} userEmail={user?.email} />}
      </AnimatePresence>
    </PageTransition>
  );
}