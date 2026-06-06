import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';
import { surveyApi, type WeakSkill } from '@api/survey.api';
import toast from 'react-hot-toast';

// ── Brand ────────────────────────────────────────────────────────────────────
const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  400: '#fb7185',
  500: '#f43f5e',
};

const SKILL_META: Record<WeakSkill, { label: string; emoji: string }> = {
  LISTENING: { label: 'Nghe',  emoji: '🎧' },
  READING:   { label: 'Đọc',   emoji: '📖' },
  WRITING:   { label: 'Viết',  emoji: '✍️' },
  SPEAKING:  { label: 'Nói',   emoji: '🗣️' },
};

const BAND_OPTIONS    = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
const CURRENT_OPTIONS = [0, 1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0];

interface SurveyModalProps { onComplete: () => void; }

export const SurveyModal = ({ onComplete }: SurveyModalProps) => {
  const [ieltsTarget, setIeltsTarget]   = useState(6.5);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [weakSkills, setWeakSkills]     = useState<WeakSkill[]>([]);
  const [submitting, setSubmitting]     = useState(false);

  const toggleSkill = (sk: WeakSkill) =>
    setWeakSkills((prev) => prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk]);

  const canSubmit = weakSkills.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await surveyApi.submitSurvey({ ieltsTarget, currentLevel, weakSkills });
      toast.success('Đã lưu mục tiêu! 🎯');
      onComplete();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra, thử lại nhé!');
    } finally {
      setSubmitting(false);
    }
  };

  const chipStyle = (selected: boolean) => ({
    padding: '5px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
    border: `1.5px solid ${selected ? BRAND[400] : BRAND[100]}`,
    background: selected ? BRAND[50] : '#fff',
    color: selected ? BRAND[500] : '#64748b',
    cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', overflowY: 'auto',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: '440px',
          background: '#fff', borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 20px 60px -8px rgba(0,0,0,0.3)',
          maxHeight: 'calc(100dvh - 32px)', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header – compact */}
        <div style={{
          background: 'linear-gradient(135deg,#fb7185,#f43f5e)',
          padding: '18px 24px 16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <Target size={14} color="rgba(255,255,255,0.9)" />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
              letterSpacing: '0.12em', textTransform: 'uppercase' }}>Khảo sát ban đầu</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>
            Thiết lập mục tiêu của bạn 🎯
          </h2>
        </div>

        {/* Body – scrollable */}
        <div style={{ padding: '18px 24px 20px', overflowY: 'auto', flex: 1 }}>

          {/* ── IELTS Target ── */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: BRAND[400],
                textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Mục tiêu band điểm IELTS
              </label>
              {/* Inline badge thay circle lớn */}
              <span style={{
                background: 'linear-gradient(135deg,#fb7185,#f43f5e)',
                color: '#fff', fontSize: '14px', fontWeight: 900,
                padding: '3px 12px', borderRadius: '20px',
                boxShadow: '0 3px 10px rgba(244,63,94,0.3)',
              }}>{ieltsTarget.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {BAND_OPTIONS.map((b) => (
                <button key={b} onClick={() => setIeltsTarget(b)} style={chipStyle(ieltsTarget === b)}>
                  {b.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Current Level ── */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: BRAND[400],
                textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Trình độ IELTS hiện tại
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>0 = chưa thi</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CURRENT_OPTIONS.map((b) => (
                <button key={b} onClick={() => setCurrentLevel(b)} style={chipStyle(currentLevel === b)}>
                  {b === 0 ? 'Chưa thi' : b.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Weak Skills – compact horizontal cards ── */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: BRAND[400],
                textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Kỹ năng muốn cải thiện
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Chọn nhiều</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(Object.keys(SKILL_META) as WeakSkill[]).map((sk) => {
                const m = SKILL_META[sk];
                const sel = weakSkills.includes(sk);
                return (
                  <button key={sk} onClick={() => toggleSkill(sk)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px', borderRadius: '12px',
                    border: `1.5px solid ${sel ? BRAND[400] : BRAND[100]}`,
                    background: sel ? BRAND[50] : '#fff',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.12s', textAlign: 'left',
                    boxShadow: sel ? '0 2px 10px rgba(244,63,94,0.12)' : 'none',
                  }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{m.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700,
                      color: sel ? BRAND[500] : '#1e293b', flex: 1 }}>{m.label}</span>
                    {sel && <CheckCircle2 size={14} color={BRAND[500]} style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Submit ── */}
          <button onClick={handleSubmit} disabled={!canSubmit} style={{
            width: '100%', height: '46px', borderRadius: '14px', border: 'none',
            background: canSubmit ? 'linear-gradient(135deg,#fb7185,#f43f5e)' : '#e2e8f0',
            color: canSubmit ? '#fff' : '#94a3b8',
            fontSize: '14px', fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? '0 5px 16px rgba(244,63,94,0.3)' : 'none',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
            {submitting ? 'Đang lưu...' : weakSkills.length > 0
              ? `Bắt đầu học ngay 🚀 (${weakSkills.length} kỹ năng)`
              : 'Chọn ít nhất 1 kỹ năng'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
