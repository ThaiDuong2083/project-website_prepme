import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes.constants';
import { GrammarModal, VocabMenuModal } from './DashboardModals';
import { vocabularyApi, type VocabularyWordDTO } from '@api/vocabulary.api.ts';

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
  const [results, setResults] = useState<VocabularyWordDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const streak = 3;

  const handleCard = (id: string) => {
    if (id === 'vocab') setShowVocabMenu(true);
    if (id === 'grammar') setShowGrammarMenu(true);
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
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>PrepMe</h1>
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
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>{streak}</span>
          <Flame size={18} color="#f97316" fill="#f97316" />
        </div>
      </div>

      {/* ── Announcement ticker ── */}
      <div
        onClick={() => setAnnIdx((i) => (i + 1) % announcements.length)}
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: `1.5px solid ${BRAND[100]}`,
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
            style={{ fontSize: '13px', color: '#475569', flex: 1 }}
          >
            {announcements[annIdx]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative w-full" style={{ marginBottom: '30px' }}>
        <div className="flex items-center overflow-hidden rounded-2xl border-2 border-pink-200 bg-pink-50 shadow-md">
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
            className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
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
          <div className="absolute z-50 mt-3 max-h-[520px] w-full overflow-y-auto rounded-2xl border border-pink-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dashed border-pink-200 px-5 py-4 text-sm font-semibold text-pink-500">
              <div>
                Kết quả cho "<span className="font-medium text-slate-800">{search}</span>"
              </div>
              <span
                className="cursor-pointer text-2xl leading-none hover:text-pink-600"
                onClick={() => {
                  setSearch('');
                  setResults([]); // Đảm bảo xóa kết quả
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
                  className="mx-2 cursor-pointer rounded-2xl border border-pink-100 bg-[#fff9f0] p-5 transition-all hover:border-pink-200"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <div className="text-xl font-bold text-slate-800">{item.word}</div>
                    {item.pronunciation && (
                      <div className="text-sm font-medium text-pink-600">{item.pronunciation}</div>
                    )}
                    <div className="text-sm font-normal text-pink-500">
                      ({item.wordType || 'noun'})
                    </div>
                  </div>

                  <div className="mt-2 text-slate-700">
                    Nghĩa: <span className="font-medium">{item.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className="absolute z-50 mt-3 w-full rounded-2xl border border-pink-200 bg-white p-12 text-center text-slate-400 shadow-xl">
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
          />
        </motion.div>

        {/* Đã lưu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <ModuleCard emoji="💛" title="Đã lưu" subtitle="0 từ, 0 câu, 0 note" />
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
                background: 'rgba(255,255,255,0.85)',
                border: `1.5px solid ${BRAND[100]}`,
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
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Luyện Thi
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Trải nghiệm giao diện thi thật với các bộ đề mới nhất
              </p>
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: `1.5px solid ${BRAND[100]}`,
          borderRadius: '18px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        <span style={{ fontSize: '22px' }}>🎵</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: BRAND[500] }}>
              Act My Age – One Direction
            </span>
            <span
              style={{
                background: BRAND[400],
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '20px',
              }}
            >
              User Rec
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.7 }}>
            "When I'm fat and old and my kids think I'm a joke
            <br />
            ~ 'Cause I move a little slow when I dance
            <br />
            ~ I can count on you after all that we've been through
            <br />~ 'Cause I know that you'll always understand"
          </p>
        </div>
        <button
          style={{
            background: BRAND[50],
            border: `1.5px solid ${BRAND[200]}`,
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '18px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      </motion.div>

      <AnimatePresence>
        {showVocabMenu && <VocabMenuModal onClose={() => setShowVocabMenu(false)} />}
        {showGrammarMenu && <GrammarModal onClose={() => setShowGrammarMenu(false)} />}
      </AnimatePresence>
    </div>
  );
};

const ModuleCard = ({
  emoji,
  title,
  subtitle,
  onClick,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.85)',
      border: '1.5px solid #ffe4e6',
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
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(244,63,94,0.12)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'none';
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    }}
  >
    <span style={{ fontSize: '34px' }}>{emoji}</span>
    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</p>
    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{subtitle}</p>
  </button>
);