import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Heart, Pencil, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes.constants';
import { GrammarModal, VocabMenuModal, FavoriteWordsModal } from './DashboardModals';
import { ToastContainer, type ToastState } from './modals/shared';
import { vocabularyApi, type VocabularyWordDTO } from '@api/vocabulary.api.ts';
import { useAppStore } from '@store/app.store';
import { useAuthStore } from '@store/auth.store';
import { SurveyModal } from './SurveyModal';
import { EditGoalsModal } from './EditGoalsModal';


const BRAND = {
  50: '#eff6ff',
  100: '#dbeafe',
  400: '#60a5fa',
  500: '#3b82f6',
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
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [results, setResults] = useState<VocabularyWordDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const streak = 3;

  const { theme, favCount, setFavCount, incrementFavCount, decrementFavCount } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const showSurvey = user !== null && user.surveyCompleted === false;

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
  }, [setFavCount]);

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
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#3b82f6' }}>{streak}</span>
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
        <div className={`flex items-center overflow-hidden rounded-2xl border-2 shadow-md ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
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
            className="bg-blue-500 px-8 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            Tìm
          </button>
        </div>

        {/* SEARCH RESULTS */}
        {results.length > 0 && (
          <div className={`absolute z-50 mt-3 max-h-[520px] w-full overflow-y-auto rounded-2xl border shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-200'}`}>
            <div className={`flex items-center justify-between border-b border-dashed px-5 py-4 text-sm font-semibold text-blue-500 ${isDark ? 'border-slate-600' : 'border-blue-200'}`}>
              <div>
                Kết quả cho "<span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{search}</span>"
              </div>
              <span
                className="cursor-pointer text-2xl leading-none hover:text-blue-600"
                onClick={() => {
                  setSearch('');
                  setResults([]);
                }}
              >
                ×
              </span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider text-blue-500">
              📚 TỪ VỰNG ({results.length})
            </div>
            <div className="space-y-3 px-3 pb-6">
              {results.map((item, index: number) => (
                <div
                  key={index}
                  className={`mx-2 cursor-pointer rounded-2xl border p-5 transition-all hover:border-blue-200 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-[#f0f9ff] border-blue-100'}`}
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-baseline gap-2">
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.word}</div>
                        {item.pronunciation && (
                          <div className="text-sm font-medium text-blue-600">{item.pronunciation}</div>
                        )}
                        <div className="text-sm font-normal text-blue-500">
                          ({item.wordType || 'noun'})
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleToggleSave(e, item.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                          savedIds.has(item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : isDark
                              ? 'border-slate-600 bg-slate-700 hover:border-blue-300 hover:bg-slate-600'
                              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <Heart
                          size={16}
                          color={savedIds.has(item.id) ? '#3b82f6' : isDark ? '#94a3b8' : '#cbd5e1'}
                          fill={savedIds.has(item.id) ? '#3b82f6' : 'transparent'}
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
          <div className={`absolute z-50 mt-3 w-full rounded-2xl border p-12 text-center shadow-xl ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-blue-200 text-slate-400'}`}>
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
                  '0 10px 28px rgba(59,130,246,0.12)';
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

      {/* ── Floating Goals Widget ── */}
      {user?.surveyCompleted && (
        <GoalsFloatingWidget
          ieltsTarget={user.ieltsTarget}
          currentLevel={user.currentLevel}
          weakSkills={user.weakSkills}
          isDark={isDark}
          onEdit={() => setShowEditGoals(true)}
        />
      )}

      <AnimatePresence>
        {showVocabMenu && <VocabMenuModal onClose={() => setShowVocabMenu(false)} />}
        {showGrammarMenu && <GrammarModal onClose={() => setShowGrammarMenu(false)} />}
        {showSavedWords && <FavoriteWordsModal onClose={handleCloseSaved} />}
        {showEditGoals && (
          <EditGoalsModal
            currentTarget={user?.ieltsTarget}
            currentLevel={user?.currentLevel}
            currentSkills={(user?.weakSkills ?? []) as 'LISTENING'[] | 'READING'[] | 'WRITING'[] | 'SPEAKING'[] | []}
            isDark={isDark}
            onClose={() => setShowEditGoals(false)}
            onSaved={async () => { setShowEditGoals(false); await fetchProfile(); }}
          />
        )}
      </AnimatePresence>

      {/* SurveyModal – chỉ hiện 1 lần khi user chưa làm khảo sát */}
      {showSurvey && (
        <SurveyModal onComplete={() => fetchProfile()} />
      )}

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
        ? 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)'
        : (isDark ? '#1e293b' : 'rgba(255,255,255,0.85)'),
      border: accent ? 'none' : `1.5px solid ${isDark ? '#334155' : '#dbeafe'}`,
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
      boxShadow: accent ? '0 6px 20px rgba(96,165,250,0.30)' : 'none',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      (e.currentTarget as HTMLElement).style.boxShadow = accent
        ? '0 14px 32px rgba(96,165,250,0.40)'
        : '0 10px 28px rgba(59,130,246,0.12)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'none';
      (e.currentTarget as HTMLElement).style.boxShadow = accent
        ? '0 6px 20px rgba(96,165,250,0.30)'
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

// ── Floating Goals Widget ─────────────────────────────────────────────────────
const GoalsFloatingWidget = ({
  ieltsTarget, currentLevel, weakSkills, isDark, onEdit,
}: {
  ieltsTarget?: number;
  currentLevel?: number;
  weakSkills?: string[];
  isDark: boolean;
  onEdit: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  const panelBg     = isDark ? '#1e293b' : '#ffffff';
  const panelBorder = isDark ? '#334155' : '#dbeafe';
  const textMain    = isDark ? '#f1f5f9' : '#1e293b';
  const textSub     = '#94a3b8';

  const SKILL_LABELS: Record<string, string> = {
    LISTENING: '🎧 Nghe', READING: '📖 Đọc',
    WRITING:   '✍️ Viết', SPEAKING: '🗣️ Nói',
  };

  return (
    <div
      style={{ position: 'fixed', top: '14px', right: '28px', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Floating circle – luôn hiện trên cùng ── */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#60a5fa,#3b82f6)',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: hovered
            ? '0 8px 32px rgba(59,130,246,0.6), 0 0 0 5px rgba(59,130,246,0.15)'
            : '0 8px 24px rgba(59,130,246,0.4)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          gap: '1px',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <Target size={13} color="rgba(255,255,255,0.85)" />
        <span style={{ color: '#fff', fontWeight: 900, fontSize: '17px', lineHeight: 1 }}>
          {ieltsTarget?.toFixed(1) ?? '–'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: '9px', letterSpacing: '0.05em' }}>
          BAND
        </span>
      </motion.div>

      {/* ── Expanded info panel – hiện phía dưới ── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: panelBg,
              border: `1.5px solid ${panelBorder}`,
              borderRadius: '18px',
              padding: '16px 18px',
              minWidth: '220px',
              boxShadow: '0 12px 40px rgba(59,130,246,0.18)',
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: textSub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Mục tiêu của bạn
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, color: '#3b82f6' }}>
              IELTS Band {ieltsTarget?.toFixed(1) ?? '–'}
            </p>
            {currentLevel !== undefined && currentLevel !== null && (
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: textSub }}>
                Hiện tại:{' '}
                <b style={{ color: textMain }}>
                  {currentLevel === 0 ? 'Chưa thi' : `Band ${currentLevel.toFixed(1)}`}
                </b>
              </p>
            )}
            {weakSkills && weakSkills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                {weakSkills.map((sk) => (
                  <span key={sk} style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                    background: '#eff6ff', color: '#3b82f6',
                    border: '1px solid #dbeafe', borderRadius: '8px',
                  }}>
                    {SKILL_LABELS[sk] ?? sk}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={onEdit}
              style={{
                width: '100%', height: '36px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg,#60a5fa,#3b82f6)',
                color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)', fontFamily: 'inherit',
              }}
            >
              <Pencil size={13} /> Chỉnh sửa mục tiêu
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

