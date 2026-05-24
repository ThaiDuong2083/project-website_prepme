import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Flame, Bookmark, Rocket, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes.constants';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const moduleCards = [
  {
    id: 'vocab',
    emoji: '📚',
    title: 'Từ vựng IELTS',
    subtitle: 'Mở khóa chủ đề',
    color: '#fb7185',
    bg: '#fff1f2',
  },
  {
    id: 'grammar',
    emoji: '📝',
    title: 'Ngữ Pháp',
    subtitle: 'Lý thuyết & Bài tập',
    color: '#60a5fa',
    bg: '#eff6ff',
  },
  {
    id: 'saved',
    emoji: '💛',
    title: 'Đã lưu',
    subtitle: '0 từ, 0 câu, 0 note',
    color: '#fbbf24',
    bg: '#fffbeb',
  },
  {
    id: 'profile',
    emoji: '🏆',
    title: 'Hồ Sơ',
    subtitle: 'Thành tích & Lịch sử',
    color: '#a78bfa',
    bg: '#f5f3ff',
  },
  {
    id: 'writing',
    emoji: '✍️',
    title: 'Writing AI',
    subtitle: 'Sửa bài bằng AI',
    color: '#34d399',
    bg: '#ecfdf5',
  },
  {
    id: 'exams',
    emoji: '📄',
    title: 'Luyện Thi',
    subtitle: 'Đề Cambridge thật',
    color: '#f97316',
    bg: '#fff7ed',
  },
];

const announcements = [
  { id: 1, text: '🎉 Tuần này có thêm 5 bộ đề Cambridge mới!', color: '#fda4af' },
  { id: 2, text: '🔥 Streak của bạn đang tốt, tiếp tục nhé!', color: '#fbbf24' },
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const [vocabSearch, setVocabSearch] = useState('');
  const [annIdx, setAnnIdx] = useState(0);

  const firstName = user?.fullName?.split(' ').pop() ?? 'bạn';
  const streak = 1; // TODO: from API

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🧡</span>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Charnishere
          </h1>
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

      {/* ── Priority Task Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #fda4af 0%, #fb7185 60%, #f43f5e 100%)',
          borderRadius: '20px',
          padding: '20px 24px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
            NHIỆM VỤ ƯU TIÊN
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: '0 0 8px 0' }}>
            Ôn tập ngay
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            🎉 Tuyệt vời! Đã ôn xong hết.
          </p>
        </div>
        <div style={{ fontSize: '52px', opacity: 0.9 }}>🚀</div>
      </motion.div>

      {/* ── Announcement ticker ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.8)',
          border: `1.5px solid ${BRAND[100]}`,
          borderRadius: '14px',
          padding: '10px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
        onClick={() => setAnnIdx((i) => (i + 1) % announcements.length)}
      >
        <span style={{ fontSize: '18px' }}>📢</span>
        <span style={{ fontSize: '13px', color: '#475569', flex: 1 }}>
          {announcements[annIdx].text}
        </span>
        <span style={{ fontSize: '11px', color: BRAND[400], fontWeight: 700 }}>quang ngu</span>
      </div>

      {/* ── Vocab Search ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: `1.5px solid ${BRAND[100]}`,
          borderRadius: '14px',
          padding: '0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '12px 16px' }}>
          <Search size={16} color={BRAND[300]} />
          <input
            value={vocabSearch}
            onChange={(e) => setVocabSearch(e.target.value)}
            placeholder="🔍 Nhập từ vựng cần tra cứu..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: '#334155',
              flex: 1,
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button
          style={{
            background: BRAND[400],
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Tìm
        </button>
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
        {/* First 4 in 2x2, last 2 (writing + exams) special */}
        {moduleCards.slice(0, 4).map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={card.id === 'exams' ? ROUTES.USER.EXAMS : card.id === 'profile' ? ROUTES.USER.PROFILE : '#'}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: `1.5px solid ${BRAND[100]}`,
                  borderRadius: '18px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(244,63,94,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{card.emoji}</div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{card.title}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{card.subtitle}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Exams + Writing large card ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Writing AI */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: `1.5px solid ${BRAND[100]}`,
            borderRadius: '18px',
            padding: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(244,63,94,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'none';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>✍️</div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Writing AI</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>AI chấm & sửa bài Writing</p>
        </motion.div>

        {/* Luyện thi full */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to={ROUTES.USER.EXAMS} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: `1.5px solid ${BRAND[100]}`,
                borderRadius: '18px',
                padding: '20px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(244,63,94,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Luyện Thi</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Trải nghiệm giao diện thi thật với các bộ đề mới nhất</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* ── Tải App CTA ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
        }}
      >
        <button
          style={{
            background: `linear-gradient(135deg, ${BRAND[400]}, ${BRAND[500]})`,
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            padding: '12px 22px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(244,63,94,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          📱 Tải App ngay
        </button>
      </motion.div>
    </div>
  );
};
