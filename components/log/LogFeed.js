'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import LogCard from './LogCard';
import LogModal from './LogModal';
import { LayoutGrid, Image as ImageIcon, Video, Type, Music } from 'lucide-react';

const TYPES = [
  { id: 'all',   label: 'All',   Icon: LayoutGrid },
  { id: 'photo', label: 'Photo', Icon: ImageIcon },
  { id: 'video', label: 'Video', Icon: Video },
  { id: 'text',  label: 'Text',  Icon: Type },
  { id: 'audio', label: 'Audio', Icon: Music },
];

const BATCH = 12;

// Masonry column breakpoints — react-masonry-css expects a plain object
// keyed by breakpoint. The `default` key is the fallback for large screens.
const MASONRY_BREAKPOINTS = {
  default: 3, // ≥1024
  1023: 2,    // ≥640
  639: 2,     // mobile (tighter gutters via CSS below)
};

export default function LogFeed({ initialPosts = [] }) {
  const searchParams = useSearchParams();

  // URL → state
  const urlType = searchParams.get('type');
  const urlOpen = searchParams.get('open');
  const [activeType, setActiveType] = useState(() =>
    TYPES.some(t => t.id === urlType) ? urlType : 'all'
  );
  const [openId, setOpenId] = useState(urlOpen || null);
  const [visibleCount, setVisibleCount] = useState(BATCH);

  // Which type pills should show: always All, plus any type with ≥1 post
  const availableTypes = useMemo(() => {
    const present = new Set(initialPosts.map(p => p.type));
    return TYPES.filter(t => t.id === 'all' || present.has(t.id));
  }, [initialPosts]);

  // Filtered list
  const filtered = useMemo(() => {
    if (activeType === 'all') return initialPosts;
    return initialPosts.filter(p => p.type === activeType);
  }, [activeType, initialPosts]);

  // Reset pagination when filter changes
  useEffect(() => { setVisibleCount(BATCH); }, [activeType]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  // ─── URL sync for filter ──────────────────────────────────
  // Always write to /log (not pathname) — when the modal is open
  // the URL is /log/[id] via pushState, but filter pills should
  // always restore the /log base path.
  const updateUrlType = useCallback((typeId) => {
    const sp = new URLSearchParams();
    if (typeId !== 'all') sp.set('type', typeId);
    const qs = sp.toString();
    const url = qs ? `/log?${qs}` : '/log';
    window.history.replaceState({}, '', url);
  }, []);

  const handleTypeChange = (typeId) => {
    setActiveType(typeId);
    updateUrlType(typeId);
  };

  // ─── Modal open/close + URL sync ──────────────────────────
  // Opening a card pushes /log/[id] (pretty URL for sharing/bookmarks).
  // Closing restores /log (plus any active ?type= filter).
  const openPost = (post) => {
    setOpenId(post.id);
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('open');
    const qs = sp.toString();
    // Shallow URL change only — don't actually navigate.
    // We use history.pushState so we don't lose the modal state.
    const newUrl = qs ? `/log/${post.id}?${qs}` : `/log/${post.id}`;
    window.history.pushState({ logModal: post.id }, '', newUrl);
  };

  const closePost = useCallback(() => {
    setOpenId(null);
    const sp = new URLSearchParams();
    if (activeType !== 'all') sp.set('type', activeType);
    const qs = sp.toString();
    const newUrl = qs ? `/log?${qs}` : '/log';
    window.history.pushState({ logModal: null }, '', newUrl);
  }, [activeType]);

  // ─── Deep link auto-open on mount ─────────────────────────
  // The server route /log/[id] redirects client-side to /log?open=[id].
  // When we land here with ?open=[id], open the modal immediately
  // and then strip `open` from the URL so the URL becomes /log/[id].
  useEffect(() => {
    if (!urlOpen) return;
    const post = initialPosts.find(p => p.id === urlOpen);
    if (post) {
      setOpenId(urlOpen);
      // Rewrite URL to the pretty form
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete('open');
      const qs = sp.toString();
      const newUrl = qs ? `/log/${urlOpen}?${qs}` : `/log/${urlOpen}`;
      window.history.replaceState({ logModal: urlOpen }, '', newUrl);
    } else {
      // Stale id — clean up the URL
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete('open');
      const qs = sp.toString();
      window.history.replaceState({}, '', qs ? `/log?${qs}` : '/log');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Browser back/forward → sync modal state ──────────────
  useEffect(() => {
    const onPop = () => {
      // URL has just changed via back/forward button.
      // If we're on /log/[id] and that id exists → open modal.
      // If we're on /log → close modal.
      const match = window.location.pathname.match(/^\/log\/(.+)$/);
      if (match) {
        const id = match[1];
        if (initialPosts.some(p => p.id === id)) setOpenId(id);
      } else {
        setOpenId(null);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [initialPosts]);

  const activePost = openId ? initialPosts.find(p => p.id === openId) : null;

  return (
    <>
      {/* ─── Filter pills (only when posts exist) ──────── */}
      {initialPosts.length > 0 && (
        <div className="log-pills-wrap">
          <style>{`
            .log-pills-wrap {
              overflow-x: auto; overflow-y: hidden;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              margin-bottom: 32px;
            }
            .log-pills-wrap::-webkit-scrollbar { display: none; }
            .log-pills-row {
              display: flex; gap: 8px;
              white-space: nowrap; width: max-content;
            }
          `}</style>
          <div className="log-pills-row">
            {availableTypes.map(t => {
              const active = activeType === t.id;
              const Icon = t.Icon;
              return (
                <motion.button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px',
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.78rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--log-pill-active-text, #0a0a0a)' : 'var(--log-pill-text, rgba(232,232,234,0.72))',
                    background: active ? 'var(--log-pill-active-bg, #f4f4f5)' : 'var(--log-pill-bg, rgba(255,255,255,0.04))',
                    border: `1px solid ${active ? 'var(--log-pill-active-bg, #f4f4f5)' : 'var(--log-pill-border, rgba(255,255,255,0.08))'}`,
                    cursor: 'pointer',
                    transition: 'color 0.15s, background 0.15s, border-color 0.15s',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  <Icon size={13} strokeWidth={active ? 2.2 : 1.8}/>
                  {t.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Masonry grid ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'120px 24px',
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '1.8rem',
          fontStyle: 'italic',
          color: 'var(--log-empty-text, rgba(232,232,234,0.35))',
        }}>
          nothing here yet
        </div>
      ) : (
        <>
          <style>{`
            .log-masonry { display: flex; margin-left: -16px; width: auto; }
            .log-masonry-col { padding-left: 16px; background-clip: padding-box; }
            .log-masonry-col > * { margin-bottom: 16px; }
            @media (max-width: 639px) {
              .log-masonry { margin-left: -10px; }
              .log-masonry-col { padding-left: 10px; }
              .log-masonry-col > * { margin-bottom: 10px; }
            }
          `}</style>
          <Masonry
            breakpointCols={MASONRY_BREAKPOINTS}
            className="log-masonry"
            columnClassName="log-masonry-col"
          >
            {visible.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i * 0.05, 0.4),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <LogCard post={post} onOpen={() => openPost(post)}/>
              </motion.div>
            ))}
          </Masonry>

          {hasMore && (
            <div style={{ display:'flex', justifyContent:'center', marginTop:'40px' }}>
              <button
                onClick={() => setVisibleCount(c => c + BATCH)}
                style={{
                  padding: '12px 28px',
                  background: 'var(--log-pill-bg, rgba(255,255,255,0.04))',
                  border: '1px solid var(--log-pill-border, rgba(255,255,255,0.1))',
                  borderRadius: 999,
                  color: 'var(--log-pill-text, rgba(232,232,234,0.8))',
                  fontFamily: "'DM Sans', 'Outfit', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {activePost && (
          <LogModal
            post={activePost}
            onClose={closePost}
          />
        )}
      </AnimatePresence>
    </>
  );
}
