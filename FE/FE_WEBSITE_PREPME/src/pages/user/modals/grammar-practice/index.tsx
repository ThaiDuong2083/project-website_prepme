import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BarChart2 } from 'lucide-react';
import { B } from '../colors';
import { Overlay, ModalBox, ToastContainer, type ToastState } from '../shared';
import { useAppStore } from '@store/app.store';
import { useAuthStore } from '@store/auth.store';
import { grammarApi, type GrammarTopic } from '@api/grammar.api';
import { ProgressModal } from './ProgressModal';
import { PracticeScreen } from './PracticeScreen';

export const GrammarPracticeModal = ({ onClose }: { onClose: () => void }) => {
  const [numQ, setNumQ] = useState(20);
  const [timePQ, setTimePQ] = useState(0);
  const [showProg, setShowProg] = useState(false);
  const [practice, setPractice] = useState<{ topicId: number, topicName: string } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();
  const userId = Number(user?.id);

  const showToast = useCallback((msg: string, type: ToastState['type'] = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    if (!userId) return;
    grammarApi.getTopics(userId).then(res => {
      setTopics(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      showToast('Lỗi tải chủ đề', 'error');
    });
  }, [userId, showToast, refreshKey]);

  if (showProg) return <><ProgressModal onClose={() => setShowProg(false)} /><ToastContainer toast={toast} /></>;

  if (practice) {
    return (
      <motion.div style={{ position: 'fixed', inset: 0, zIndex: 300, overflowY: 'auto', background: isDark ? '#0f172a' : '#fdf6f0' }}>
        <PracticeScreen
          topicId={practice.topicId}
          topicName={practice.topicName}
          totalQuestions={numQ}
          timePerQuestion={timePQ}
          onFinish={() => setRefreshKey(k => k + 1)}
          onClose={() => setPractice(null)}
        />
        <ToastContainer toast={toast} />
      </motion.div>
    );
  }

  const subText = isDark ? '#94a3b8' : '#64748b';

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={720} height="90vh" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: B[400], padding: '4px', flexShrink: 0 }}>
            <ChevronLeft size={28} strokeWidth={3} />
          </button>
          <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '22px', fontWeight: 900, color: B[400], letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            🎯 CHỌN CHỦ ĐỀ
          </h2>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: '14px', color: subText, margin: '0 0 16px', fontWeight: 500 }}>Lọc bài tập theo từng dạng ngữ pháp</p>

        <div style={{ background: isDark ? '#1e293b' : '#fffbeb', border: `1.5px solid ${isDark ? '#334155' : '#fde68a'}`, borderRadius: '14px', padding: '14px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 800, fontSize: '14px', color: isDark ? '#f1f5f9' : '#1e293b', whiteSpace: 'nowrap' }}>Số câu:</label>
            <input type="number" value={numQ} min={1} max={200} onChange={(e) => setNumQ(Number(e.target.value))}
              style={{ width: '64px', padding: '6px 10px', borderRadius: '8px', border: `1.5px solid ${isDark ? '#475569' : '#e2e8f0'}`, background: isDark ? '#0f172a' : '#fff', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 700, fontSize: '14px', outline: 'none', fontFamily: 'inherit', textAlign: 'center' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 800, fontSize: '14px', color: isDark ? '#f1f5f9' : '#1e293b', whiteSpace: 'nowrap' }}>TG/câu (s):</label>
            <input type="number" value={timePQ} min={0} onChange={(e) => setTimePQ(Number(e.target.value))}
              style={{ width: '64px', padding: '6px 10px', borderRadius: '8px', border: `1.5px solid ${isDark ? '#475569' : '#e2e8f0'}`, background: isDark ? '#0f172a' : '#fff', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 700, fontSize: '14px', outline: 'none', fontFamily: 'inherit', textAlign: 'center' }} />
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowProg(true)}
            style={{ background: isDark ? 'rgba(251,113,133,0.15)' : B[50], border: `1.5px solid ${B[200]}`, borderRadius: '10px', padding: '7px 16px', fontSize: '13px', fontWeight: 800, color: B[500], cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', marginLeft: 'auto' }}
          >
            <BarChart2 size={16} /> Tiến độ
          </motion.button>
        </div>
        <p style={{ fontSize: '12px', color: '#f59e0b', textAlign: 'center', margin: '0 0 16px', fontStyle: 'italic' }}>
          *Nhập 0 vào thời gian để học thoải mái không hẹn giờ
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', paddingRight: '4px', alignContent: 'start' }}>
          {topics.length === 0 && !loading && <div style={{ gridColumn: 'span 5', textAlign: 'center', paddingTop: '20px' }}>Chưa có chủ đề nào.</div>}
          {topics.map((topic, idx) => {
            const pct = topic.total > 0 ? Math.round((topic.done / topic.total) * 100) : 0;
            const hasProg = topic.done > 0;
            const ringColor = hasProg ? (pct >= 80 ? '#22c55e' : pct >= 40 ? '#f59e0b' : B[400]) : (isDark ? '#475569' : '#d1d5db');
            const nameColor = hasProg ? (pct >= 80 ? '#16a34a' : pct >= 40 ? '#f59e0b' : B[400]) : (isDark ? '#94a3b8' : '#64748b');

            return (
              <motion.div key={topic.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (topic.total === 0) { showToast('Chủ đề này chưa có câu hỏi.', 'info'); return; }
                  setPractice({ topicId: topic.id, topicName: topic.name });
                }}
                style={{ border: `1.5px solid ${isDark ? '#334155' : '#f1f5f9'}`, borderRadius: '16px', padding: '18px 8px 14px', cursor: 'pointer', textAlign: 'center', background: isDark ? '#1e293b' : '#fff', boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: 'box-shadow 0.15s' }}
              >
                <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '2px' }}>
                  <svg width="56" height="56" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="28" cy="28" r="23" fill="none" stroke={isDark ? '#334155' : '#f1f5f9'} strokeWidth="3" />
                    <circle cx="28" cy="28" r="23" fill="none" stroke={ringColor} strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 23}`} strokeDashoffset={`${2 * Math.PI * 23 * (1 - pct / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: '6px', background: isDark ? '#243044' : (hasProg ? '#fff1f2' : '#f8fafc'), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '20px' }}>🎯</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '12px', color: nameColor }}>{topic.name}</p>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8' }}>{topic.done}/{topic.total}</p>
              </motion.div>
            );
          })}
        </div>
        <ToastContainer toast={toast} />
      </ModalBox>
    </Overlay>
  );
};
