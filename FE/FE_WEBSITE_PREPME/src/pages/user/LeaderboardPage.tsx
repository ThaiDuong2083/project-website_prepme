import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Crown } from 'lucide-react';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const GOLD = '#f59e0b';
const SILVER = '#94a3b8';
const BRONZE = '#d97706';

const tabs = [
  { id: 'xp', label: '⚡ Đại Gia XP', emoji: '⚡' },
  { id: 'vocab', label: '📖 Vua Từ Vựng', emoji: '📖' },
  { id: 'grammar', label: '✏️ Chiến Thần Ngữ Pháp', emoji: '✏️' },
  { id: 'streak', label: '🔥 Chiến binh kiên định', emoji: '🔥' },
  { id: 'ielts', label: '🎓 Đỉnh Cao IELTS', emoji: '🎓' },
];

const mockLeaderboard = [
  { rank: 1, name: 'Hoàng Ngân', level: 10, title: 'IELTS Master', xp: 267172, isMe: false },
  { rank: 2, name: 'Hiền Anh Đặng', level: 10, title: 'IELTS Master', xp: 174497, isMe: false },
  { rank: 3, name: 'Linh Trần', level: 10, title: 'IELTS Master', xp: 129040, isMe: true },
  { rank: 4, name: 'Mai Tran', level: 9, title: 'Huyền Thoại', xp: 118285, isMe: false },
  { rank: 5, name: 'chari chari', level: 9, title: 'Huyền Thoại', xp: 110295, isMe: false },
  { rank: 6, name: 'Lan Anh', level: 9, title: 'Huyền Thoại', xp: 102190, isMe: false },
  { rank: 7, name: 'hehe', level: 9, title: 'Huyền Thoại', xp: 95145, isMe: false },
  { rank: 8, name: 'Minh Tú', level: 8, title: 'Cao Thủ', xp: 88320, isMe: false },
];

const getRankColor = (rank: number) => {
  if (rank === 1) return GOLD;
  if (rank === 2) return SILVER;
  if (rank === 3) return BRONZE;
  return '#64748b';
};

const getRankBg = (rank: number, isMe: boolean) => {
  if (isMe) return BRAND[50];
  if (rank === 1) return '#fffbeb';
  if (rank === 2) return '#f8fafc';
  if (rank === 3) return '#fff1f2';
  return '#fff';
};

const RankMedal = ({ rank }: { rank: number }) => {
  if (rank > 3)
    return <span style={{ color: '#64748b', fontWeight: 700, fontSize: '14px' }}>#{rank}</span>;
  const icons = ['🥇', '🥈', '🥉'];
  return <span style={{ fontSize: '20px' }}>{icons[rank - 1]}</span>;
};

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '28px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '24px',
          border: `1.5px solid ${BRAND[100]}`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(244,63,94,0.10)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: `1.5px solid ${BRAND[50]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown size={22} color={GOLD} fill={GOLD} />
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#1e293b',
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              BẢNG VÀNG
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: `1.5px solid ${BRAND[50]}`,
            padding: '0 16px',
          }}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                fontSize: '12px',
                fontWeight: activeTab === i ? 800 : 500,
                color: activeTab === i ? BRAND[500] : '#64748b',
                borderBottom:
                  activeTab === i ? `2.5px solid ${BRAND[500]}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                marginBottom: '-1.5px',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {mockLeaderboard.map((entry, i) => (
            <motion.div
              key={entry.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '13px 24px',
                background: getRankBg(entry.rank, entry.isMe),
                borderBottom: `1px solid ${BRAND[50]}`,
                borderLeft: entry.isMe ? `3px solid ${BRAND[400]}` : '3px solid transparent',
              }}
            >
              {/* Rank */}
              <div
                style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}
              >
                <RankMedal rank={entry.rank} />
              </div>

              {/* Avatar */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background:
                    entry.rank === 1
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : entry.rank === 2
                        ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                        : entry.rank === 3
                          ? 'linear-gradient(135deg, #fb7185, #f43f5e)'
                          : 'linear-gradient(135deg, #818cf8, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                  border: entry.rank <= 3 ? `2px solid ${getRankColor(entry.rank)}` : 'none',
                }}
              >
                {entry.name.charAt(0)}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: '0 0 2px 0',
                  }}
                >
                  {entry.name}
                  {entry.isMe && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: BRAND[400],
                        marginLeft: '6px',
                      }}
                    >
                      (PrepMe)
                    </span>
                  )}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                  Lv.{entry.level} — {entry.title}
                </p>
              </div>

              {/* XP */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: BRAND[500] }}>
                  {entry.xp.toLocaleString('vi-VN')} XP
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px',
            color: BRAND[300],
          }}
        >
          <ChevronDown size={20} />
        </div>
      </motion.div>
    </div>
  );
};
