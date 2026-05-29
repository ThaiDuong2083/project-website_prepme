import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { B } from '../colors';
import { Overlay, ModalBox } from '../shared';
import { useAppStore } from '@store/app.store';
import { useAuthStore } from '@store/auth.store';
import { grammarApi, type TopicProgressDetailsResponse } from '@api/grammar.api';

export const ProgressModal = ({ onClose }: { onClose: () => void }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<TopicProgressDetailsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useAppStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const userId = Number(user?.id);

  useEffect(() => {
    if (!userId) return;
    grammarApi.getGrammarProgress(userId).then(res => {
      setProgressData(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [userId]);

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={680} height="78vh" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: B[400], display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 TIẾN ĐỘ NGỮ PHÁP
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', margin: '0 0 16px', fontStyle: 'italic' }}>
          💡 Nhấn vào từng chủ đề bên dưới để xem lịch sử đáp án bạn đã chọn.
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', marginBottom: '16px' }} />

        {/* Added proper horizontal padding to avoid clipping when scaling */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 6px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: B[400], marginTop: '20px' }}>Đang tải...</div>
          ) : progressData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>Chưa có tiến độ nào.</div>
          ) : progressData.map((topic) => {
            const isExp = expanded === topic.id;
            return (
              <div key={topic.id}>
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  onClick={() => setExpanded(isExp ? null : topic.id)}
                  style={{
                    border: `1.5px solid ${isExp ? B[300] : isDark ? '#334155' : '#fecdd3'}`,
                    borderRadius: isExp ? '16px 16px 0 0' : '16px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: isExp ? (isDark ? 'rgba(244,63,94,0.08)' : '#fff8f8') : (isDark ? '#1e293b' : '#fffbf7'),
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isExp ? <ChevronUp size={16} color={B[400]} /> : <ChevronDown size={16} color={B[300]} />}
                    <span style={{ fontWeight: 800, fontSize: '15px', color: isDark ? B[300] : B[400] }}>{topic.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>Đã làm: {topic.done}/{topic.total}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: B[400] }}>Tổng chính xác: {topic.accuracy}%</div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      key="exp"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{
                        overflow: 'hidden',
                        border: `1.5px solid ${B[300]}`,
                        borderTop: 'none',
                        borderRadius: '0 0 16px 16px',
                        background: isDark ? '#1e293b' : '#fffbf7',
                        padding: topic.questions.length > 0 ? '12px 16px' : '16px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        textAlign: topic.questions.length === 0 ? 'center' : 'left',
                        color: topic.questions.length === 0 ? '#94a3b8' : undefined,
                        fontSize: topic.questions.length === 0 ? '13px' : undefined,
                      }}
                    >
                      {topic.questions.length === 0
                        ? 'Chưa có câu hỏi nào được làm trong chủ đề này.'
                        : topic.questions.map((q) => (
                          <div key={q.id} style={{
                            border: '1.5px solid #fde68a', borderRadius: '12px',
                            padding: '12px 14px', background: isDark ? '#243044' : '#fffbeb',
                          }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: '6px' }}>{q.questionText}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>Đã làm: {q.done} | Đúng: {q.correct}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: B[400] }}>Chính xác: {q.accuracy}%</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Lịch sử chọn (5 lần gần nhất):</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {q.recentChoices.map((c, i) => (
                                <span key={i} style={{
                                  background: isDark ? '#334155' : '#fff', border: `1px solid ${B[200]}`,
                                  borderRadius: '20px', padding: '3px 12px',
                                  fontSize: '12px', color: B[400], fontWeight: 600,
                                }}>{c}</span>
                              ))}
                            </div>
                          </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ModalBox>
    </Overlay>
  );
};
