import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Fish, MapPin, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const FILTERS = ['feed_all','feed_followed','feed_region','feed_my_species'];

export default function Feed() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('feed_all');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.TcPost.list('-created_date', 20)])
      .then(([u, ps]) => { setUser(u); setPosts(ps); })
      .finally(() => setLoading(false));
  }, []);

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
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
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
                      <p className="text-foam/30 text-xs">{post.created_date ? new Date(post.created_date).toLocaleDateString('de-DE') : ''}</p>
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
    </PageTransition>
  );
}