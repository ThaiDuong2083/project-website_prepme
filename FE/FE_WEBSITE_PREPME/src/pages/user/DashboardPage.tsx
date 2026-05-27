import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes.constants';
import { GrammarModal, VocabMenuModal, FavoriteWordsModal } from './DashboardModals';
import { ToastContainer, type ToastState } from './modals/shared';
import { vocabularyApi, type VocabularyWordDTO } from '@api/vocabulary.api.ts';
import { useAppStore } from '@store/app.store';


const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const announcements = [
  '🎉 Tuần này có thêm 5 bộ đề Cambridge mới!',
  '🔥 Streak của bạn đang tốt, tiếp tục nhé!',
];

export const DashboardPage = () => {
  const [search, setSearch] = useState('');
  const [annIdx, setAnnIdx] = useState(0);
  const [showVocabMenu, setShowVocabMenu] = useState(false);
  const [showGrammarMenu, setShowGrammarMenu] = useState(false);
  const [showSavedWords, setShowSavedWords] = useState(false);
  const [results, setResults] = useState<VocabularyWordDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const streak = 3;

  const { theme, favCount, setFavCount, incrementFavCount, decrementFavCount } = useAppStore();

  const showToast = (msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#1e293b' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? '#334155' : BRAND[100];
  const textColorTitle = isDark ? '#f8fafc' : '#1e293b';
  useEffect(() => {
    vocabularyApi
      .countFavorites()
      .then((res) => setFavCount(res.data?.count ?? 0))
      .catch(() => {});
    vocabularyApi
      .getFavoriteWordIds()
      .then((res) => setSavedIds(new Set(res.data ?? [])))
      .catch(() => {});
  }, []);

  const handleCloseSaved = () => {
    setShowSavedWords(false);
  };

  const handleCard = (id: string) => {
    if (id === 'vocab') setShowVocabMenu(true);
    if (id === 'grammar') setShowGrammarMenu(true);
    if (id === 'saved') setShowSavedWords(true);
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      setLoading(true);
      const res = await vocabularyApi.searchByKeyword(search);
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, wordId: number) => {
    e.stopPropagation();
    const isSaved = savedIds.has(wordId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(wordId);
      else next.add(wordId);
      return next;
    });

    try {
      if (isSaved) {
        await vocabularyApi.removeFavorite(wordId);
        decrementFavCount();
        showToast('Đã xóa khỏi yêu thích 💔', 'info');
      } else {
        await vocabularyApi.addFavorite(wordId);
        incrementFavCount();
        showToast('Đã thêm vào yêu thích ❤️', 'success');
      }
    } catch {
      // rollback
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(wordId);
        else next.delete(wordId);
        return next;
      });
      showToast('Có lỗi xảy ra, thử lại nhé!', 'error');
    }
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '28px 24px',
        minHeight: '100vh',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🧡</span>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: textColorTitle, margin: 0 }}>PrepMe</h1>
          <span style={{ fontSize: '22px' }}>🌙</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: BRAND[50],
            border: `1.5px solid ${BRAND[100]}`,
            borderRadius: '20px',
            padding: '6px 14px',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#f43f5e' }}>{streak}</span>
          <Flame size={18} color="#f97316" fill="#f97316" />
        </div>
      </div>

      {/* ── Announcement ticker ── */}
      <div
        onClick={() => setAnnIdx((i) => (i + 1) % announcements.length)}
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255,255,255,0.85)',
          border: `1.5px solid ${cardBorder}`,
          borderRadius: '14px',
          padding: '10px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '18px' }}>📢</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={annIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#475569', flex: 1 }}
          >
            {announcements[annIdx]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative w-full" style={{ marginBottom: '30px' }}>
        <div className={`flex items-center overflow-hidden rounded-2xl border-2 shadow-md ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-pink-50 border-pink-200'}`}>
          <input
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              if (!value.trim()) {
                setResults([]);
              }
            }}
            placeholder="Nhập từ cần tra cứu..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={`flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
          />
          <button
            onClick={handleSearch}
            className="bg-pink-500 px-8 py-3 text-sm font-bold text-white transition hover:bg-pink-600"
          >
            Tìm
          </button>
        </div>

        {/* SEARCH RESULTS */}
        {results.length > 0 && (
          <div className={`absolute z-50 mt-3 max-h-[520px] w-full overflow-y-auto rounded-2xl border shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-200'}`}>
            <div className={`flex items-center justify-between border-b border-dashed px-5 py-4 text-sm font-semibold text-pink-500 ${isDark ? 'border-slate-600' : 'border-pink-200'}`}>
              <div>
                Kết quả cho "<span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{search}</span>"
              </div>
              <span
                className="cursor-pointer text-2xl leading-none hover:text-pink-600"
                onClick={() => {
                  setSearch('');
                  setResults([]);
                }}
              >
                ×
              </span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider text-pink-500">
              📚 TỪ VỰNG ({results.length})
            </div>
            <div className="space-y-3 px-3 pb-6">
              {results.map((item, index: number) => (
                <div
                  key={index}
                  className={`mx-2 cursor-pointer rounded-2xl border p-5 transition-all hover:border-pink-200 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-[#fff9f0] border-pink-100'}`}
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-baseline gap-2">
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.word}</div>
                        {item.pronunciation && (
                          <div className="text-sm font-medium text-pink-600">{item.pronunciation}</div>
                        )}
                        <div className="text-sm font-normal text-pink-500">
                          ({item.wordType || 'noun'})
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleToggleSave(e, item.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                          savedIds.has(item.id)
                            ? 'border-pink-500 bg-pink-50'
                            : isDark
                              ? 'border-slate-600 bg-slate-700 hover:border-pink-300 hover:bg-slate-600'
                              : 'border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                        }`}
                      >
                        <Heart
                          size={16}
                          color={savedIds.has(item.id) ? '#f43f5e' : isDark ? '#94a3b8' : '#cbd5e1'}
                          fill={savedIds.has(item.id) ? '#f43f5e' : 'transparent'}
                        />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nghĩa: <span className="font-medium">{item.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className={`absolute z-50 mt-3 w-full rounded-2xl border p-12 text-center shadow-xl ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-pink-200 text-slate-400'}`}>
            Đang tìm kiếm...
          </div>
        )}
      </div>

      {/* ── Module Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* Vocab */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <ModuleCard
            emoji="📚"
            title="Từ vựng IELTS"
            subtitle="Mở khóa chủ đề"
            onClick={() => handleCard('vocab')}
            isDark={isDark}
          />
        </motion.div>

        {/* Ngữ Pháp */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <ModuleCard
            emoji="📝"
            title="Ngữ Pháp"
            subtitle="Lý thuyết & Bài tập"
            onClick={() => handleCard('grammar')}
            isDark={isDark}
          />
        </motion.div>

        {/* Đã lưu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <ModuleCard
            emoji="💛"
            title="Đã lưu"
            subtitle={`${favCount} từ đã lưu`}
            onClick={() => handleCard('saved')}
            isDark={isDark}
          />
        </motion.div>

        {/* Luyện Thi – link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Link
            to={ROUTES.USER.EXAMS}
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <div
              style={{
                background: cardBg,
                border: `1.5px solid ${cardBorder}`,
                borderRadius: '18px',
                padding: '26px 20px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 10px 28px rgba(244,63,94,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '34px' }}>📄</span>
              <p style={{ fontSize: '15px', fontWeight: 700, color: textColorTitle, margin: 0 }}>
                Luyện Thi
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Trải nghiệm giao diện thi thật với các bộ đề mới nhất
              </p>
            </div>
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {showVocabMenu && <VocabMenuModal onClose={() => setShowVocabMenu(false)} />}
        {showGrammarMenu && <GrammarModal onClose={() => setShowGrammarMenu(false)} />}
        {showSavedWords && <FavoriteWordsModal onClose={handleCloseSaved} />}
      </AnimatePresence>
      <ToastContainer toast={toast} />
    </div>
  );
};

const ModuleCard = ({
  emoji,
  title,
  subtitle,
  accent = false,
  onClick,
  isDark,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  accent?: boolean;
  onClick?: () => void;
  isDark?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      height: '100%',
      background: accent
        ? 'linear-gradient(135deg, #fb7185 0%, #fda4af 100%)'
        : (isDark ? '#1e293b' : 'rgba(255,255,255,0.85)'),
      border: accent ? 'none' : `1.5px solid ${isDark ? '#334155' : '#ffe4e6'}`,
      borderRadius: '18px',
      padding: '26px 20px',
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.15s ease',
      fontFamily: 'inherit',
      boxShadow: accent ? '0 6px 20px rgba(251,113,133,0.30)' : 'none',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      (e.currentTarget as HTMLElement).style.boxShadow = accent
        ? '0 14px 32px rgba(251,113,133,0.40)'
        : '0 10px 28px rgba(244,63,94,0.12)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'none';
      (e.currentTarget as HTMLElement).style.boxShadow = accent
        ? '0 6px 20px rgba(251,113,133,0.30)'
        : 'none';
    }}
  >
    <span style={{ fontSize: '34px' }}>{emoji}</span>
    <p
      style={{
        fontSize: '15px',
        fontWeight: 700,
        color: accent ? '#fff' : (isDark ? '#f8fafc' : '#1e293b'),
        margin: 0,
      }}
    >
      {title}
    </p>
    <p style={{ fontSize: '12px', color: accent ? 'rgba(255,255,255,0.85)' : '#94a3b8', margin: 0 }}>
      {subtitle}
    </p>
  </button>
);