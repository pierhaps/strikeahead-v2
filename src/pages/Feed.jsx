import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Fish, MapPin, Scale, Plus, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';
import { SkeletonFeedPost, FadeIn } from '@/components/shared/Skeleton';
import { fetchWithCache } from '@/hooks/useOfflineCache';

const FILTERS = ['feed_all','feed_followed','feed_region','feed_my_species'];


const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

export default function Feed() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('feed_all');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Create-post modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [myCatches, setMyCatches] = useState([]);
  const [selectedCatch, setSelectedCatch] = useState(null);
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      fetchWithCache('feed_posts', () => base44.entities.TcPost.list('-created_date', 20)),
    ])
      .then(([u, ps]) => { setUser(u); setPosts(ps || []); })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = async () => {
    setCreateOpen(true);
    setCaption('');
    setSelectedCatch(null);
    if (user?.email) {
      try {
        const mine = await base44.entities.Catch.filter({ created_by: user.email }, '-caught_date', 10);
        setMyCatches(mine || []);
      } catch {
        setMyCatches([]);
      }
    }
  };

  const handlePublish = async () => {
    if (!caption.trim() && !selectedCatch) {
      toast.error(t('feed.need_caption_or_catch'));
      return;
    }
    setPublishing(true);
    try {
      const payload = {
        content: caption.trim() || (selectedCatch?.species ? `${selectedCatch.species} 🎣` : '🎣'),
        catch_id: selectedCatch?.id,
        photo_url: selectedCatch?.photo_urls?.[0] || null,
        species_name: selectedCatch?.species || null,
        weight_kg: selectedCatch?.weight_kg ?? null,
        length_cm: selectedCatch?.length_cm ?? null,
        technique: selectedCatch?.technique || null,
        manufacturer: selectedCatch?.manufacturer || null,
        model: selectedCatch?.model || null,
        lure_weight_g: selectedCatch?.lure_weight_g ?? null,
        location_name: selectedCatch?.waterbody || null,
        wind_speed_kmh: selectedCatch?.wind_speed_kmh ?? null,
        wind_direction: selectedCatch?.wind_direction || null,
        water_temp_c: selectedCatch?.water_temp_c ?? null,
        tide_phase: selectedCatch?.tide_phase || null,
        barometric_pressure_hpa: selectedCatch?.barometric_pressure_hpa ?? null,
        pressure_trend: selectedCatch?.pressure_trend || null,
      };
      const post = await base44.entities.TcPost.create(payload);
      setPosts((prev) => [post, ...prev]);

      // Award "first_post" achievement if not yet earned
      try {
        const existing = await base44.entities.UserAchievement.filter(
          { user_email: user?.email, achievement_code: 'first_post' }, '-unlocked_date', 1,
        );
        if (!existing?.length) {
          const [achs] = await Promise.all([
            base44.entities.Achievement.filter({ code: 'first_post' }, 'sort_order', 1),
          ]);
          const ach = achs?.[0];
          if (ach) {
            await base44.entities.UserAchievement.create({
              user_email: user?.email,
              achievement_code: 'first_post',
              unlocked_date: new Date().toISOString(),
              progress_value: 1,
              xp_awarded: ach.xp_reward || 0,
              hp_awarded: ach.hp_reward || 0,
            });
            await base44.auth.updateMe({
              fish_xp: (user?.fish_xp || 0) + (ach.xp_reward || 0),
              hook_points: (user?.hook_points || 0) + (ach.hp_reward || 0),
            });
            const nameKey = document?.documentElement?.lang === 'de' ? ach.name_de : ach.name_en;
            toast.success(`🏆 ${t('achievements.unlocked')}: ${nameKey || 'Community Voice'}`);
          }
        }
      } catch { /* best-effort */ }

      toast.success(t('feed.post_published'));
      setCreateOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('feed.post_failed'));
    } finally {
      setPublishing(false);
    }
  };

  const handleLike = async (post) => {
    const liked = (post.liked_by || []).includes(user?.email);
    const newLikedBy = liked
      ? post.liked_by.filter(e => e !== user?.email)
      : [...(post.liked_by || []), user?.email];
    const updated = { ...post, liked_by: newLikedBy, likes_count: newLikedBy.length };
    setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
    await base44.entities.TcPost.update(post.id, { liked_by: newLikedBy, likes_count: newLikedBy.length });
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.feed')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.feed')}</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'gradient-tide text-white' : 'glass-card text-foam/50'}`}>
              {t(`community.${f}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <FadeIn className="space-y-4">
            {[0,1,2].map(i => <SkeletonFeedPost key={i} />)}
          </FadeIn>
        ) : posts.length === 0 ? (
          <div className="text-center py-16"><p className="text-5xl mb-4">🐟</p><p className="text-foam/50">{t('community.feed_empty')}</p></div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => {
              const isLiked = (post.liked_by || []).includes(user?.email);
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `hsl(${(post.created_by?.charCodeAt(0) || 0) * 13 % 360}, 60%, 40%)` }}>
                      {post.created_by?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-foam font-semibold text-sm">{post.created_by || 'Angler'}</p>
                      <p className="text-foam/30 text-xs">{post.created_date ? new Date(post.created_date).toLocaleDateString(localeTag(i18n.language)) : ''}</p>
                    </div>
                  </div>

                  {/* Photo */}
                  {post.photo_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={post.photo_url} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}

                  {/* Info chips */}
                  <div className="px-4 py-2.5 flex gap-2 flex-wrap">
                    {post.species_name && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-tide-500/15 text-tide-300 text-xs">
                        <Fish className="w-3 h-3" />{post.species_name}
                      </span>
                    )}
                    {post.weight_kg && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sun-500/15 text-sun-300 text-xs">
                        <Scale className="w-3 h-3" />{post.weight_kg} kg
                      </span>
                    )}
                    {post.location_name && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-abyss-700/60 text-foam/50 text-xs">
                        <MapPin className="w-3 h-3" />•••
                      </span>
                    )}
                    {post.technique && (
                      <span className="px-2 py-1 rounded-lg bg-abyss-700/60 text-foam/40 text-xs">{post.technique}</span>
                    )}
                  </div>

                  {/* Content */}
                  {post.content && (
                    <p className="px-4 pb-2 text-foam/70 text-sm">{post.content}</p>
                  )}

                  {/* Actions */}
                  <div className="px-4 pb-3 flex items-center gap-4">
                    <button onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isLiked ? 'text-coral-500' : 'text-foam/40'}`}>
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-coral-500' : ''}`} />
                      {post.likes_count || 0}
                    </button>
                    <button className="flex items-center gap-1.5 text-foam/40 text-sm">
                      <MessageCircle className="w-5 h-5" />
                      {post.comments_count || 0}
                    </button>
                    <button className="flex items-center gap-1.5 text-foam/40 text-sm ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating create button */}
      <button
        onClick={openCreate}
        aria-label={t('feed.create_post')}
        className="fixed right-5 bottom-24 z-40 w-14 h-14 rounded-2xl gradient-tide flex items-center justify-center text-white shadow-lg"
        style={{ boxShadow: '0 8px 24px rgba(31,167,184,0.35)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create-post modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-abyss-900/70 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => !publishing && setCreateOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-md bg-abyss-800 rounded-t-3xl md:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
              style={{ border: '1px solid rgba(127,220,229,0.12)' }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-foam text-lg">{t('feed.create_post')}</h2>
                <button onClick={() => !publishing && setCreateOpen(false)}
                  className="w-8 h-8 rounded-full glass-card flex items-center justify-center">
                  <X className="w-4 h-4 text-foam/70" />
                </button>
              </div>

              {/* Catch picker */}
              <div>
                <p className="text-foam/40 text-xs uppercase tracking-widest mb-2">{t('feed.attach_catch')}</p>
                {myCatches.length === 0 ? (
                  <p className="text-foam/40 text-xs">{t('feed.no_catches_yet')}</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                      onClick={() => setSelectedCatch(null)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold ${!selectedCatch ? 'gradient-tide text-white' : 'glass-card text-foam/50'}`}
                    >
                      {t('feed.text_only')}
                    </button>
                    {myCatches.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCatch(c)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl w-24 ${selectedCatch?.id === c.id ? 'gradient-tide text-white' : 'glass-card text-foam/70'}`}
                      >
                        {c.photo_urls?.[0] ? (
                          <img src={c.photo_urls[0]} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-abyss-700 flex items-center justify-center">
                            <Fish className="w-6 h-6 text-foam/30" />
                          </div>
                        )}
                        <span className="text-[10px] font-semibold truncate w-full text-center">{c.species || '—'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <p className="text-foam/40 text-xs uppercase tracking-widest mb-2">{t('feed.caption')}</p>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder={t('feed.caption_placeholder')}
                  className="w-full rounded-xl px-3 py-2 text-sm text-foam outline-none bg-abyss-700/60 border border-tide-300/10 focus:border-tide-400/40 placeholder-foam/30 resize-none"
                />
                <p className="text-foam/30 text-[10px] text-right mt-1">{caption.length}/500</p>
              </div>

              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full gradient-tide text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {publishing ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('feed.publishing')}</>
                ) : (
                  <><Send className="w-4 h-4" /> {t('feed.publish')}</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}