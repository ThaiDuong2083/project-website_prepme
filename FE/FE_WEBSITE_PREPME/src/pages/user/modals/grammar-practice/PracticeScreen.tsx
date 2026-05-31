import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { B } from '../colors';
import { useAppStore } from '@store/app.store';
import { grammarApi } from '@api/grammar.api';
import type { PracticeQuestion } from '@api/grammar.api';
import { useAuthStore } from '@store/auth.store';

export const PracticeScreen = ({
  topicId, topicName, totalQuestions, timePerQuestion, onClose, onFinish,
}: {
  topicId: number; topicName: string; totalQuestions: number; timePerQuestion: number; onClose: () => void; onFinish?: () => void;
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(timePerQuestion > 0 ? timePerQuestion : null);
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  const { user } = useAuthStore();
  const userId = Number(user?.id);

  useEffect(() => {
    grammarApi.getPracticeQuestions(topicId, totalQuestions).then(res => {
      setQuestions(res.data);
      setAnswers(Array(res.data.length).fill(null));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [topicId, totalQuestions]);

  const q = questions[currentIndex];
  const isCorrect = q && selected === q.answer;

  const doSelect = async (opt: string) => {
    if (showResult) return;
    setSelected(opt); setShowResult(true); setTimeLeft(null);
    try {
      await grammarApi.submitPracticeResult(userId, { questionId: q.id, selectedAnswer: opt });
    } catch (e) {
      console.error('Lỗi khi lưu tiến độ:', e);
    }
  };

  const doNext = () => {
    const nxt = [...answers]; nxt[currentIndex] = selected; setAnswers(nxt);
    if (currentIndex >= questions.length - 1) { setFinished(true); return; }
    setSelected(null); setShowResult(false); setCurrentIndex((i) => i + 1);
    if (timePerQuestion > 0) setTimeLeft(timePerQuestion);
  };

  // Timer
  useEffect(() => {
    if (timePerQuestion <= 0 || showResult || finished) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t == null || t <= 1) { clearInterval(id); setSelected(''); setShowResult(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Keyboard nav
  useEffect(() => {
    if (!q) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowDown' || e.key === 'Enter') && showResult) { doNext(); return; }
      if (!showResult) {
        const map: Record<string, string> = { '1': q.options[0], '2': q.options[1], '3': q.options[2], '4': q.options[3] };
        if (map[e.key]) doSelect(map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });


  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0f172a' : '#fdf6f0' }}>
        <div style={{ color: B[400], fontWeight: 800 }}>Đang tải câu hỏi...</div>
      </motion.div>
    );
  }

  if (!q) return null; // fallback if no questions but not loading

  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i]?.answer).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const grade = pct >= 80 ? '🏆 Xuất sắc!' : pct >= 60 ? '👍 Khá tốt!' : pct >= 40 ? '📚 Cần ôn thêm' : '💪 Cố lên nhé!';
    const gc = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#fb923c' : B[400];
    const circ = 2 * Math.PI * 58;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%', maxWidth: '480px', margin: '60px auto', padding: '40px 32px',
          borderRadius: '28px',
          background: isDark ? '#1e293b' : '#fff',
          boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.45)' : '0 24px 60px rgba(0,0,0,0.12)',
          textAlign: 'center', fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: '54px', marginBottom: '10px' }}>🎉</div>
        <h2 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 900, color: gc }}>{grade}</h2>
        <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '13px', margin: '0 0 28px' }}>
          Chủ đề: <strong style={{ color: B[400] }}>{topicName}</strong>
        </p>

        <div style={{ position: 'relative', width: '144px', height: '144px', margin: '0 auto 28px' }}>
          <svg width="144" height="144" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="72" cy="72" r="58" fill="none" stroke={isDark ? '#334155' : '#f1f5f9'} strokeWidth="10" />
            <motion.circle
              cx="72" cy="72" r="58" fill="none" stroke={gc} strokeWidth="10"
              strokeLinecap="round"
              initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '34px', fontWeight: 900, color: gc }}>{pct}%</span>
            <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>Chính xác</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
          {[
            { label: 'Đúng', val: correct, color: '#22c55e' },
            { label: 'Sai', val: total - correct, color: B[400] },
            { label: 'Tổng', val: total, color: isDark ? '#64748b' : '#94a3b8' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              setCurrentIndex(0); setSelected(null); setShowResult(false);
              setAnswers(Array(totalQuestions).fill(null)); setFinished(false);
              if (timePerQuestion > 0) setTimeLeft(timePerQuestion);
            }}
            style={{ padding: '12px 22px', borderRadius: '14px', border: `1.5px solid ${B[300]}`, background: 'transparent', color: B[400], fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            🔄 Làm lại
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onFinish?.(); onClose(); }}
            style={{ padding: '12px 22px', borderRadius: '14px', border: 'none', background: `linear-gradient(135deg,${B[400]},${B[300]})`, color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(244,63,94,0.25)' }}
            ref={(el) => { if (el) el.onclick = () => { onFinish?.(); onClose(); }; }}
          >
            ← Chọn chủ đề
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const textMain = isDark ? '#f1f5f9' : '#1e293b';
  const subText = isDark ? '#94a3b8' : '#64748b';
  const progPct = (currentIndex / totalQuestions) * 100;
  const timerPct = timeLeft != null && timePerQuestion > 0 ? (timeLeft / timePerQuestion) * 100 : 100;
  const timerColor = timeLeft != null
    ? (timeLeft > timePerQuestion * 0.5 ? '#22c55e' : timeLeft > timePerQuestion * 0.25 ? '#f59e0b' : B[400])
    : B[400];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      style={{ width: '100%', maxWidth: '900px', margin: '0 auto', minHeight: '100vh', background: isDark ? '#0f172a' : '#fdf6f0', padding: '24px 20px', fontFamily: 'inherit', boxSizing: 'border-box' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: B[400], padding: '4px' }}>
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: B[400], letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎯 THỰC HÀNH
        </h2>
        {timeLeft != null ? (
          <motion.div
            animate={timeLeft <= 5 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={timeLeft <= 5 ? { repeat: Infinity, duration: 0.5 } : {}}
            style={{ minWidth: '54px', textAlign: 'center', fontWeight: 900, fontSize: '20px', color: timerColor, background: isDark ? '#1e293b' : '#fff', border: `2px solid ${timerColor}`, borderRadius: '12px', padding: '3px 10px', transition: 'color 0.3s, border-color 0.3s' }}
          >
            {timeLeft}s
          </motion.div>
        ) : <div style={{ width: '54px' }} />}
      </div>

      <div style={{ height: '5px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
        <motion.div animate={{ width: `${progPct}%` }} transition={{ duration: 0.35 }} style={{ height: '100%', background: `linear-gradient(90deg,${B[300]},${B[400]})`, borderRadius: '4px' }} />
      </div>

      {timeLeft != null && timePerQuestion > 0 && (
        <div style={{ height: '3px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
          <motion.div animate={{ width: `${timerPct}%` }} transition={{ duration: 0.9, ease: 'linear' }} style={{ height: '100%', background: timerColor, borderRadius: '3px', transition: 'background 0.3s' }} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '10px', marginTop: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: subText }}>Câu {currentIndex + 1} / {totalQuestions}</span>
        {' '}
        <span style={{ background: isDark ? 'rgba(251,113,133,0.2)' : B[100], color: B[400], padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
          Chủ đề: {topicName}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {answers.map((a, i) => (
          <span key={i} style={{ fontSize: '13px', opacity: i <= currentIndex ? 1 : 0.22 }}>
            {i < currentIndex ? (a === q.answer ? '❤️' : '🖤') : '🤍'}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.18 }}
          style={{ display: 'grid', gridTemplateColumns: showResult ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '16px' }}
        >
          <div style={{ border: `1.5px solid ${isDark ? '#334155' : '#fde68a'}`, borderRadius: '16px', padding: '20px', background: isDark ? '#1e2d40' : '#fffbeb', position: 'relative' }}>
            <p style={{ fontWeight: 700, fontSize: '16px', color: textMain, textAlign: 'center', marginTop: '24px', lineHeight: 1.8 }}>
              {q.text.split(/_{2,}/).map((part, pi, arr) => (
                <span key={pi}>
                  {part}
                  {pi < arr.length - 1 && (
                    <span style={{ display: 'inline-block', borderBottom: `2px solid ${B[400]}`, minWidth: '80px', marginInline: '4px', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '2px' }}>
                      {showResult && selected != null && (
                        <span style={{ color: isCorrect ? '#22c55e' : B[400], fontWeight: 800 }}>{selected || '—'}</span>
                      )}
                    </span>
                  )}
                </span>
              ))}
            </p>

            <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options.map((opt, oi) => {
                const isSel = selected === opt;
                const isAns = opt === q.answer;
                let bg = isDark ? '#243044' : '#f8fafc';
                let col = textMain;
                let bord = isDark ? '#334155' : '#e2e8f0';
                if (showResult) {
                  if (isAns) { bg = '#d1fae5'; col = '#065f46'; bord = '#6ee7b7'; }
                  else if (isSel && !isAns) { bg = '#fee2e2'; col = '#991b1b'; bord = '#fca5a5'; }
                } else if (isSel) { bg = '#d1fae5'; col = '#065f46'; bord = '#6ee7b7'; }

                return (
                  <motion.button key={opt}
                    whileHover={!showResult ? { scale: 1.01 } : {}} whileTap={!showResult ? { scale: 0.97 } : {}}
                    onClick={() => doSelect(opt)}
                    style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${bord}`, borderRadius: '12px', background: bg, color: col, fontWeight: isAns && showResult ? 800 : 600, fontSize: '14px', cursor: showResult ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px', background: isDark ? '#334155' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>{oi + 1}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {showResult && isAns && <span>✅</span>}
                    {showResult && isSel && !isAns && <span>❌</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
              style={{ border: `1.5px solid ${isCorrect ? '#6ee7b7' : '#fca5a5'}`, borderRadius: '16px', padding: '18px', background: isCorrect ? (isDark ? 'rgba(34,197,94,0.08)' : '#f0fdf4') : (isDark ? 'rgba(244,63,94,0.08)' : '#fff5f5'), overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ fontWeight: 800, fontSize: '16px', color: isCorrect ? '#16a34a' : B[400], display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isCorrect ? '✔ CHÍNH XÁC!' : '✖ SAI RỒI!'}
              </div>
              {!isCorrect && (
                <div style={{ fontSize: '13px', padding: '7px 12px', background: isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4', borderRadius: '8px', color: isDark ? '#86efac' : '#065f46' }}>
                  Đáp án đúng: <strong>{q.answer}</strong>
                </div>
              )}
              <div style={{ height: '1px', background: isDark ? '#334155' : '#e2e8f0' }} />
              <p style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.8, margin: 0 }}>
                <strong>Phân tích:</strong> {q.explanation}
              </p>
              <p style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#334155', margin: 0 }}>
                <strong>Dịch nghĩa:</strong> {q.translation}
              </p>
              <div style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#475569', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingTop: '8px' }}>
                <strong style={{ color: B[400] }}>Từ vựng:</strong>
                {q.vocabulary.map((v, vi) => (
                  <div key={vi} style={{ marginTop: '4px' }}>
                    <span style={{ color: B[400], fontWeight: 700 }}>{v.word}</span>: {v.meaning}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {showResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', paddingBottom: '24px' }}>
          <button onClick={doNext} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', gap: '2px' }}>
            <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.1 }}>
              <ChevronDown size={38} strokeWidth={3} color={B[400]} />
            </motion.div>
            <span style={{ fontSize: '12px', color: B[300], fontWeight: 700 }}>(↓ hoặc Enter)</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
