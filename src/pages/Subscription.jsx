import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Shield, Star, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguageContext } from '../hooks/useLanguage';
import { usePremiumCheck } from '../hooks/usePremiumCheck';
import PageTransition from '../components/ui/PageTransition';

const LABELS = {
  de: {
    hero_title: 'Dein volles Angel-Potenzial',
    hero_sub: 'Schalte alle Premium-Features frei',
    toggle_monthly: 'Monatlich',
    toggle_yearly: 'Jährlich',
    save_badge: '33% sparen',
    trial_badge: '7 Tage kostenlos testen',
    monthly_price: '€9,99',
    monthly_period: '/ Monat',
    yearly_price: '€79,99',
    yearly_period: '/ Jahr',
    yearly_monthly_equiv: '≈ €6,67 / Mo',
    cta: '7 Tage gratis starten',
    cta_loading: 'Wird geladen…',
    guarantee: 'Jederzeit kündbar · Keine versteckten Kosten',
    hp_cta: 'Oder 500 HookPoints für 1 Tag Premium',
    already_premium: 'Du bist bereits Premium!',
    already_sub: 'Dein Abo ist aktiv',
    expires: 'Läuft ab am',
    manage: 'Abo verwalten',
    features_title: 'Was du bekommst',
    features: [
      '📊 KI-Angleranalyse & Strike Score',
      '🗺️ Hotspot-Heatmap & Live-Wetter',
      '🎣 Unbegrenztes Fangtagebuch',
      '🐟 Vollständige Fischarten-Datenbank',
      '📅 Saisonale Fang-Vorhersagen (12 Monate)',
      '🌊 Gezeiten & Marine Intelligence',
      '💬 Angler-Chat & Private Gruppen',
      '🏆 Turniere & Competitions',
      '👨‍🏫 Coach-Buchungen & Beratung',
      '⚡ Alle zukünftigen Premium-Features',
    ],
    success: '🎉 Willkommen bei Premium! Dein Abo ist jetzt aktiv.',
    cancelled: 'Checkout abgebrochen. Kein Problem!',
  },
  en: {
    hero_title: 'Unlock Your Full Angling Potential',
    hero_sub: 'Access all premium features',
    toggle_monthly: 'Monthly',
    toggle_yearly: 'Yearly',
    save_badge: 'Save 33%',
    trial_badge: '7-day free trial',
    monthly_price: '€9.99',
    monthly_period: '/ month',
    yearly_price: '€79.99',
    yearly_period: '/ year',
    yearly_monthly_equiv: '≈ €6.67 / mo',
    cta: 'Start 7 Days Free',
    cta_loading: 'Loading…',
    guarantee: 'Cancel anytime · No hidden fees',
    hp_cta: 'Or 500 HookPoints for 1 Day Premium',
    already_premium: 'You are already Premium!',
    already_sub: 'Your subscription is active',
    expires: 'Expires on',
    manage: 'Manage subscription',
    features_title: 'What you get',
    features: [
      '📊 AI Angler Analysis & Strike Score',
      '🗺️ Hotspot Heatmap & Live Weather',
      '🎣 Unlimited Catch Diary',
      '🐟 Full Fish Species Database',
      '📅 Seasonal Catch Forecasts (12 months)',
      '🌊 Tide & Marine Intelligence',
      '💬 Angler Chat & Private Groups',
      '🏆 Tournaments & Competitions',
      '👨‍🏫 Coach Bookings & Consultation',
      '⚡ All Future Premium Features',
    ],
    success: '🎉 Welcome to Premium! Your subscription is now active.',
    cancelled: 'Checkout cancelled. No worries!',
  },
  es: {
    hero_title: 'Desbloquea tu Potencial de Pesca',
    hero_sub: 'Accede a todas las funciones premium',
    toggle_monthly: 'Mensual',
    toggle_yearly: 'Anual',
    save_badge: 'Ahorra 33%',
    trial_badge: '7 días gratis',
    monthly_price: '€9,99',
    monthly_period: '/ mes',
    yearly_price: '€79,99',
    yearly_period: '/ año',
    yearly_monthly_equiv: '≈ €6,67 / mes',
    cta: 'Comenzar 7 días gratis',
    cta_loading: 'Cargando…',
    guarantee: 'Cancela cuando quieras · Sin cargos ocultos',
    hp_cta: 'O 500 HookPoints por 1 día Premium',
    already_premium: '¡Ya eres Premium!',
    already_sub: 'Tu suscripción está activa',
    expires: 'Expira el',
    manage: 'Gestionar suscripción',
    features_title: 'Lo que obtienes',
    features: ['📊 Análisis IA', '🗺️ Mapa de Hotspots', '🎣 Diario ilimitado', '🐟 Base de datos completa', '📅 Previsiones estacionales', '🌊 Inteligencia marina', '💬 Chat de pescadores', '🏆 Torneos', '👨‍🏫 Reservas de entrenador', '⚡ Funciones futuras'],
    success: '🎉 ¡Bienvenido a Premium!',
    cancelled: 'Pago cancelado.',
  },
  fr: {
    hero_title: 'Libérez votre Potentiel de Pêche',
    hero_sub: 'Accédez à toutes les fonctionnalités premium',
    toggle_monthly: 'Mensuel',
    toggle_yearly: 'Annuel',
    save_badge: 'Économisez 33%',
    trial_badge: '7 jours gratuits',
    monthly_price: '9,99 €',
    monthly_period: '/ mois',
    yearly_price: '79,99 €',
    yearly_period: '/ an',
    yearly_monthly_equiv: '≈ 6,67 € / mois',
    cta: 'Commencer 7 jours gratuits',
    cta_loading: 'Chargement…',
    guarantee: 'Annulez quand vous voulez · Sans frais cachés',
    hp_cta: 'Ou 500 HookPoints pour 1 jour Premium',
    already_premium: 'Vous êtes déjà Premium !',
    already_sub: 'Votre abonnement est actif',
    expires: 'Expire le',
    manage: "Gérer l'abonnement",
    features_title: 'Ce que vous obtenez',
    features: ['📊 Analyse IA', '🗺️ Carte des hotspots', '🎣 Journal illimité', '🐟 Base de données complète', '📅 Prévisions saisonnières', '🌊 Intelligence marine', '💬 Chat pêcheurs', '🏆 Tournois', '👨‍🏫 Réservation de coach', '⚡ Futures fonctionnalités'],
    success: '🎉 Bienvenue dans Premium !',
    cancelled: 'Paiement annulé.',
  },
  it: {
    hero_title: 'Sblocca il tuo Potenziale di Pesca',
    hero_sub: 'Accedi a tutte le funzionalità premium',
    toggle_monthly: 'Mensile',
    toggle_yearly: 'Annuale',
    save_badge: 'Risparmia 33%',
    trial_badge: '7 giorni gratis',
    monthly_price: '€9,99',
    monthly_period: '/ mese',
    yearly_price: '€79,99',
    yearly_period: '/ anno',
    yearly_monthly_equiv: '≈ €6,67 / mese',
    cta: 'Inizia 7 giorni gratis',
    cta_loading: 'Caricamento…',
    guarantee: 'Cancella quando vuoi · Nessun costo nascosto',
    hp_cta: 'O 500 HookPoints per 1 giorno Premium',
    already_premium: 'Sei già Premium!',
    already_sub: 'Il tuo abbonamento è attivo',
    expires: 'Scade il',
    manage: 'Gestisci abbonamento',
    features_title: 'Cosa ottieni',
    features: ['📊 Analisi IA', '🗺️ Mappa hotspot', '🎣 Diario illimitato', '🐟 Database completo', '📅 Previsioni stagionali', '🌊 Intelligence marina', '💬 Chat pescatori', '🏆 Tornei', '👨‍🏫 Prenotazione coach', '⚡ Future funzionalità'],
    success: '🎉 Benvenuto in Premium!',
    cancelled: 'Pagamento annullato.',
  },
  nl: {
    hero_title: 'Ontketen je Volledige Vispotentieel',
    hero_sub: 'Toegang tot alle premium functies',
    toggle_monthly: 'Maandelijks',
    toggle_yearly: 'Jaarlijks',
    save_badge: 'Bespaar 33%',
    trial_badge: '7 dagen gratis',
    monthly_price: '€9,99',
    monthly_period: '/ maand',
    yearly_price: '€79,99',
    yearly_period: '/ jaar',
    yearly_monthly_equiv: '≈ €6,67 / maand',
    cta: '7 Dagen Gratis Starten',
    cta_loading: 'Laden…',
    guarantee: 'Op elk moment opzeggen · Geen verborgen kosten',
    hp_cta: 'Of 500 HookPoints voor 1 dag Premium',
    already_premium: 'Je bent al Premium!',
    already_sub: 'Je abonnement is actief',
    expires: 'Verloopt op',
    manage: 'Abonnement beheren',
    features_title: 'Wat je krijgt',
    features: ['📊 AI Analyse', '🗺️ Hotspot Kaart', '🎣 Onbeperkt Dagboek', '🐟 Volledige Database', '📅 Seizoensvoorspellingen', '🌊 Marine Intelligentie', '💬 Visser Chat', '🏆 Toernooien', '👨‍🏫 Coach Reserveringen', '⚡ Toekomstige functies'],
    success: '🎉 Welkom bij Premium!',
    cancelled: 'Betaling geannuleerd.',
  },
  tr: {
    hero_title: 'Tam Balıkçılık Potansiyelini Aç',
    hero_sub: 'Tüm premium özelliklere erişin',
    toggle_monthly: 'Aylık',
    toggle_yearly: 'Yıllık',
    save_badge: '%33 Tasarruf',
    trial_badge: '7 gün ücretsiz dene',
    monthly_price: '€9,99',
    monthly_period: '/ ay',
    yearly_price: '€79,99',
    yearly_period: '/ yıl',
    yearly_monthly_equiv: '≈ €6,67 / ay',
    cta: '7 Gün Ücretsiz Başla',
    cta_loading: 'Yükleniyor…',
    guarantee: 'İstediğinde iptal et · Gizli ücret yok',
    hp_cta: 'Veya 500 HookPoints ile 1 Gün Premium',
    already_premium: 'Zaten Premium\'sun!',
    already_sub: 'Aboneliğin aktif',
    expires: 'Bitiş tarihi',
    manage: 'Aboneliği yönet',
    features_title: 'Ne elde edersin',
    features: ['📊 AI Analiz', '🗺️ Hotspot Harita', '🎣 Sınırsız Günlük', '🐟 Tam Veritabanı', '📅 Mevsimsel Tahminler', '🌊 Deniz İstihbaratı', '💬 Balıkçı Sohbeti', '🏆 Turnuvalar', '👨‍🏫 Koç Rezervasyonu', '⚡ Gelecek özellikler'],
    success: '🎉 Premium\'a Hoş Geldiniz!',
    cancelled: 'Ödeme iptal edildi.',
  },
  hr: {
    hero_title: 'Otključaj Puni Potencijal Ribolova',
    hero_sub: 'Pristupite svim premium značajkama',
    toggle_monthly: 'Mjesečno',
    toggle_yearly: 'Godišnje',
    save_badge: 'Uštedi 33%',
    trial_badge: '7 dana besplatno',
    monthly_price: '€9,99',
    monthly_period: '/ mjesec',
    yearly_price: '€79,99',
    yearly_period: '/ godinu',
    yearly_monthly_equiv: '≈ €6,67 / mj',
    cta: 'Počni 7 dana besplatno',
    cta_loading: 'Učitavanje…',
    guarantee: 'Otkaži kad god · Bez skrivenih troškova',
    hp_cta: 'Ili 500 HookPoints za 1 dan Premium',
    already_premium: 'Već si Premium!',
    already_sub: 'Tvoja pretplata je aktivna',
    expires: 'Istječe',
    manage: 'Upravljaj pretplatom',
    features_title: 'Što dobivaš',
    features: ['📊 AI Analiza', '🗺️ Hotspot Karta', '🎣 Neograničeni Dnevnik', '🐟 Potpuna Baza', '📅 Sezonske Prognoze', '🌊 Morska Inteligencija', '💬 Chat Ribolovaca', '🏆 Turniri', '👨‍🏫 Rezervacija Trenera', '⚡ Buduće značajke'],
    success: '🎉 Dobrodošli u Premium!',
    cancelled: 'Plaćanje otkazano.',
  },
  pt: {
    hero_title: 'Desbloqueie seu Potencial de Pesca',
    hero_sub: 'Acesse todos os recursos premium',
    toggle_monthly: 'Mensal',
    toggle_yearly: 'Anual',
    save_badge: 'Economize 33%',
    trial_badge: '7 dias grátis',
    monthly_price: '€9,99',
    monthly_period: '/ mês',
    yearly_price: '€79,99',
    yearly_period: '/ ano',
    yearly_monthly_equiv: '≈ €6,67 / mês',
    cta: 'Começar 7 Dias Grátis',
    cta_loading: 'Carregando…',
    guarantee: 'Cancele quando quiser · Sem taxas ocultas',
    hp_cta: 'Ou 500 HookPoints por 1 dia Premium',
    already_premium: 'Você já é Premium!',
    already_sub: 'Sua assinatura está ativa',
    expires: 'Expira em',
    manage: 'Gerenciar assinatura',
    features_title: 'O que você obtém',
    features: ['📊 Análise IA', '🗺️ Mapa de Hotspots', '🎣 Diário Ilimitado', '🐟 Base de Dados Completa', '📅 Previsões Sazonais', '🌊 Inteligência Marinha', '💬 Chat de Pescadores', '🏆 Torneios', '👨‍🏫 Reserva de Treinador', '⚡ Recursos futuros'],
    success: '🎉 Bem-vindo ao Premium!',
    cancelled: 'Pagamento cancelado.',
  },
  el: {
    hero_title: 'Ξεκλειδώστε το Πλήρες Δυναμικό σας',
    hero_sub: 'Πρόσβαση σε όλα τα premium χαρακτηριστικά',
    toggle_monthly: 'Μηνιαίο',
    toggle_yearly: 'Ετήσιο',
    save_badge: 'Εξοικονομήστε 33%',
    trial_badge: '7 ημέρες δωρεάν',
    monthly_price: '€9,99',
    monthly_period: '/ μήνα',
    yearly_price: '€79,99',
    yearly_period: '/ έτος',
    yearly_monthly_equiv: '≈ €6,67 / μήνα',
    cta: 'Ξεκινήστε 7 Ημέρες Δωρεάν',
    cta_loading: 'Φόρτωση…',
    guarantee: 'Ακύρωση ανά πάσα στιγμή · Χωρίς κρυφές χρεώσεις',
    hp_cta: 'Ή 500 HookPoints για 1 ημέρα Premium',
    already_premium: 'Είστε ήδη Premium!',
    already_sub: 'Η συνδρομή σας είναι ενεργή',
    expires: 'Λήγει στις',
    manage: 'Διαχείριση συνδρομής',
    features_title: 'Τι αποκτάτε',
    features: ['📊 Ανάλυση ΑΙ', '🗺️ Χάρτης Hotspot', '🎣 Απεριόριστο Ημερολόγιο', '🐟 Πλήρης Βάση Δεδομένων', '📅 Εποχιακές Προβλέψεις', '🌊 Θαλάσσια Πληροφορία', '💬 Chat Ψαράδων', '🏆 Τουρνουά', '👨‍🏫 Κράτηση Προπονητή', '⚡ Μελλοντικά χαρακτηριστικά'],
    success: '🎉 Καλώς ήλθατε στο Premium!',
    cancelled: 'Η πληρωμή ακυρώθηκε.',
  },
  ru: {
    hero_title: 'Раскройте Полный Потенциал Рыбалки',
    hero_sub: 'Доступ ко всем премиум-функциям',
    toggle_monthly: 'Ежемесячно',
    toggle_yearly: 'Ежегодно',
    save_badge: 'Сэкономьте 33%',
    trial_badge: '7 дней бесплатно',
    monthly_price: '€9,99',
    monthly_period: '/ месяц',
    yearly_price: '€79,99',
    yearly_period: '/ год',
    yearly_monthly_equiv: '≈ €6,67 / мес',
    cta: 'Начать 7 Дней Бесплатно',
    cta_loading: 'Загрузка…',
    guarantee: 'Отмена в любое время · Без скрытых платежей',
    hp_cta: 'Или 500 HookPoints за 1 день Premium',
    already_premium: 'Вы уже Premium!',
    already_sub: 'Ваша подписка активна',
    expires: 'Истекает',
    manage: 'Управление подпиской',
    features_title: 'Что вы получаете',
    features: ['📊 ИИ Анализ', '🗺️ Карта Hotspot', '🎣 Неограниченный Дневник', '🐟 Полная База Данных', '📅 Сезонные Прогнозы', '🌊 Морская Разведка', '💬 Чат Рыбаков', '🏆 Турниры', '👨‍🏫 Бронирование Тренера', '⚡ Будущие функции'],
    success: '🎉 Добро пожаловать в Premium!',
    cancelled: 'Платёж отменён.',
  },
};

export default function Subscription() {
  const { lang } = useLanguageContext();
  const { isPremium, isAdmin, loading: premiumLoading } = usePremiumCheck();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const L = LABELS[lang] || LABELS.de;

  const [user, setUser] = useState(null);
  const [billing, setBilling] = useState('yearly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [manualEmail, setManualEmail] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('success') === '1') setToast({ msg: L.success, ok: true });
    if (searchParams.get('cancelled') === '1') setToast({ msg: L.cancelled, ok: false });
  }, [searchParams]);

  const hookPoints = user?.hook_points ?? 0;
  const canUseHp = hookPoints >= 500;
  const isPremiumUser = isPremium || isAdmin;
  const expiresDate = user?.premium_expires
    ? new Date(user.premium_expires).toLocaleDateString()
    : null;

  const handleCheckout = async () => {
    if (window.self !== window.top) {
      alert('Checkout is only available in the published app, not in preview mode.');
      return;
    }
    if (!user?.email && !manualEmail) {
      setToast({ msg: 'Bitte gib deine E-Mail-Adresse ein', ok: false });
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        priceKey: billing,
        lang,
        email: user?.email || manualEmail,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setToast({ msg: 'Checkout fehlgeschlagen. Bitte erneut versuchen.', ok: false });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleHpUnlock = async () => {
    if (!user || hookPoints < 500) return;
    try {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await base44.auth.updateMe({
        hook_points: hookPoints - 500,
        premium_expires: expires,
        premium_plan: 'pro',
      });
      setToast({ msg: '⚡ 1 Tag Premium freigeschaltet!', ok: true });
      const u = await base44.auth.me();
      setUser(u);
    } catch (err) {
      console.error(err);
    }
  };

  if (premiumLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-12 space-y-6 max-w-lg mx-auto">

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 text-center text-sm font-semibold"
            style={{
              background: toast.ok ? 'rgba(46,224,201,0.12)' : 'rgba(239,92,106,0.12)',
              border: `1px solid ${toast.ok ? 'rgba(46,224,201,0.35)' : 'rgba(239,92,106,0.35)'}`,
              color: toast.ok ? '#2EE0C9' : '#FF6B5B',
            }}
          >
            {toast.msg}
          </motion.div>
        )}

        {/* ── Already Premium ── */}
        {isPremiumUser ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 text-center space-y-4"
            style={{
              background: 'linear-gradient(135deg, rgba(182,255,0,0.08) 0%, rgba(0,224,255,0.07) 100%)',
              border: '1.5px solid rgba(182,255,0,0.3)',
              boxShadow: '0 0 40px rgba(182,255,0,0.08)',
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'linear-gradient(135deg, #B6FF00 0%, #00E0FF 100%)' }}>
              <Crown className="w-8 h-8 text-navy-900" />
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl text-foam">{L.already_premium}</p>
              <p className="text-foam/60 text-sm mt-1">{L.already_sub}</p>
              {expiresDate && (
                <p className="text-foam/40 text-xs mt-1">{L.expires}: {expiresDate}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(LABELS.de.features.slice(0, 4)).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-foam/70">
                  <Check className="w-3.5 h-3.5 text-lime2 flex-shrink-0" />
                  <span className="text-xs">{(LABELS[lang] || LABELS.de).features[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {/* ── Hero ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
                style={{ background: 'linear-gradient(135deg, #B6FF00 0%, #00E0FF 100%)', boxShadow: '0 0 40px rgba(182,255,0,0.25)' }}>
                <Crown className="w-10 h-10 text-navy-900" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-foam leading-tight">{L.hero_title}</h1>
              <p className="text-foam/60 text-sm">{L.hero_sub}</p>
            </motion.div>

            {/* ── Billing Toggle ── */}
            <div className="flex items-center justify-center gap-1 p-1 rounded-2xl glass-card w-fit mx-auto">
              {['monthly', 'yearly'].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBilling(cycle)}
                  className="relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                  style={{
                    background: billing === cycle ? 'linear-gradient(135deg, #B6FF00 0%, #00E0FF 100%)' : 'transparent',
                    color: billing === cycle ? '#0A1828' : 'rgba(232,240,245,0.5)',
                  }}
                >
                  {cycle === 'monthly' ? L.toggle_monthly : L.toggle_yearly}
                  {cycle === 'yearly' && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: billing === 'yearly' ? 'rgba(10,24,40,0.25)' : 'rgba(182,255,0,0.15)',
                        color: billing === 'yearly' ? '#0A1828' : '#B6FF00',
                      }}>
                      {L.save_badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Price Card ── */}
            <motion.div
              key={billing}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl p-6 space-y-5"
              style={{
                background: 'linear-gradient(160deg, rgba(14,30,48,0.9) 0%, rgba(10,24,40,0.95) 100%)',
                border: '1.5px solid rgba(182,255,0,0.25)',
                boxShadow: '0 8px 40px rgba(182,255,0,0.08)',
              }}
            >
              {/* Trial badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(182,255,0,0.12)', color: '#B6FF00', border: '1px solid rgba(182,255,0,0.3)' }}>
                  ✨ {L.trial_badge}
                </span>
                {billing === 'yearly' && (
                  <span className="text-xs text-foam/50">{L.yearly_monthly_equiv}</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-2">
                <span className="font-display font-extrabold text-5xl text-foam">
                  {billing === 'monthly' ? L.monthly_price : L.yearly_price}
                </span>
                <span className="text-foam/50 text-base pb-1">
                  {billing === 'monthly' ? L.monthly_period : L.yearly_period}
                </span>
              </div>

              {/* Email fallback */}
              {!user?.email && (
                <div className="mb-3">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Deine E-Mail-Adresse"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 rounded-2xl font-display font-extrabold text-base text-navy-900 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #B6FF00 0%, #00E0FF 100%)',
                  boxShadow: '0 8px 32px rgba(182,255,0,0.28)',
                  opacity: checkoutLoading ? 0.7 : 1,
                }}
              >
                {checkoutLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{L.cta_loading}</>
                ) : (
                  <><Zap className="w-5 h-5" />{L.cta}</>
                )}
              </button>

              {/* Guarantee */}
              <p className="text-center text-foam/40 text-xs flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {L.guarantee}
              </p>

              {/* HookPoints CTA */}
              {canUseHp && (
                <button
                  onClick={handleHpUnlock}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: 'rgba(245,195,75,0.08)',
                    border: '1px solid rgba(245,195,75,0.25)',
                    color: '#F5C34B',
                  }}
                >
                  ⚡ {L.hp_cta}
                </button>
              )}
            </motion.div>

            {/* ── Features list ── */}
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <p className="font-display font-bold text-foam text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime2" />
                {L.features_title}
              </p>
              <div className="space-y-2.5">
                {L.features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(182,255,0,0.12)', border: '1px solid rgba(182,255,0,0.3)' }}>
                      <Check className="w-3 h-3 text-lime2" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-foam/85">{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}