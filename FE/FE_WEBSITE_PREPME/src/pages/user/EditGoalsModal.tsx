import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Save } from 'lucide-react';
import { surveyApi, type WeakSkill } from '@api/survey.api';
import toast from 'react-hot-toast';

const BRAND = { 50: '#eff6ff', 100: '#dbeafe', 400: '#60a5fa', 500: '#3b82f6' };

const BAND_OPTIONS    = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
const CURRENT_OPTIONS = [0, 1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
const SKILL_META: Record<WeakSkill, { label: string; emoji: string }> = {
  LISTENING: { label: 'Nghe',  emoji: '🎧' },
  READING:   { label: 'Đọc',   emoji: '📖' },
  WRITING:   { label: 'Viết',  emoji: '✍️' },
  SPEAKING:  { label: 'Nói',   emoji: '🗣️' },
};

interface EditGoalsModalProps {
  currentTarget?: number;
  currentLevel?: number;
  currentSkills?: WeakSkill[];
  isDark?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const EditGoalsModal = ({
  currentTarget = 6.5,
  currentLevel: initLevel = 0,
  currentSkills = [],
  isDark = false,
  onClose,
  onSaved,
}: EditGoalsModalProps) => {
  const [target, setTarget]   = useState(currentTarget);
  const [level, setLevel]     = useState(initLevel);
  const [skills, setSkills]   = useState<WeakSkill[]>(currentSkills);
  const [saving, setSaving]       = useState(false);

  const bg      = isDark ? '#1e293b' : '#fff';
  const border  = isDark ? '#334155' : BRAND[100];
  const subtext = isDark ? '#94a3b8' : '#64748b';

  const toggleSkill = (sk: WeakSkill) =>
    setSkills((prev) =>
      prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk],
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await surveyApi.updateGoals({ ieltsTarget: target, currentLevel: level, weakSkills: skills });
      toast.success('Cập nhật mục tiêu thành công! 🎯');
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Cập nhật thất bại, thử lại nhé!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '420px', background: bg, borderRadius: '22px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="rgba(255,255,255,0.9)" />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>Chỉnh sửa mục tiêu</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '8px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={15} color="#fff" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 26px' }}>

          {/* Band target */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: BRAND[400], textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
              🎯 Mục tiêu band điểm
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{
                background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', borderRadius: '50%', width: '60px', height: '60px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(59,130,246,0.32)',
              }}>
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 900, lineHeight: 1 }}>{target.toFixed(1)}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px' }}>Band</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'center' }}>
              {BAND_OPTIONS.map((b) => (
                <button key={b} onClick={() => setTarget(b)} style={{
                  padding: '6px 12px', borderRadius: '18px', fontSize: '13px', fontWeight: 600,
                  border: `2px solid ${target === b ? BRAND[400] : border}`,
                  background: target === b ? BRAND[50] : bg,
                  color: target === b ? BRAND[500] : subtext,
                  cursor: 'pointer', transition: 'all 0.14s', fontFamily: 'inherit',
                }}>{b.toFixed(1)}</button>
              ))}
            </div>
          </div>

          {/* Current Level */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: BRAND[400], textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              📊 Trình độ hiện tại
            </label>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px' }}>
              Chọn 0 nếu chưa thi IELTS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'center' }}>
              {CURRENT_OPTIONS.map((b) => (
                <button key={b} onClick={() => setLevel(b)} style={{
                  padding: '6px 12px', borderRadius: '18px', fontSize: '13px', fontWeight: 600,
                  border: `2px solid ${level === b ? BRAND[400] : border}`,
                  background: level === b ? BRAND[50] : bg,
                  color: level === b ? BRAND[500] : subtext,
                  cursor: 'pointer', transition: 'all 0.14s', fontFamily: 'inherit',
                }}>{b === 0 ? 'Chưa thi' : b.toFixed(1)}</button>
              ))}
            </div>
          </div>

          {/* Weak Skills – multi-select */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: BRAND[400], textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>
              💪 Kỹ năng cần cải thiện
            </label>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px' }}>Chọn nhiều kỹ năng</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.keys(SKILL_META) as WeakSkill[]).map((s) => {
                const sel = skills.includes(s);
                return (
                  <button key={s} onClick={() => toggleSkill(s)} style={{
                    flex: 1, padding: '12px 4px', borderRadius: '14px', fontSize: '11px', fontWeight: 700,
                    border: `2px solid ${sel ? BRAND[400] : border}`,
                    background: sel ? BRAND[50] : bg,
                    color: sel ? BRAND[500] : subtext,
                    cursor: 'pointer', transition: 'all 0.14s', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    boxShadow: sel ? '0 2px 8px rgba(59,130,246,0.15)' : 'none',
                  }}>
                    <span style={{ fontSize: '20px' }}>{SKILL_META[s].emoji}</span>
                    <span>{SKILL_META[s].label}</span>
                    {sel && <span style={{ fontSize: '9px', color: BRAND[400] }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', height: '48px', borderRadius: '14px', border: 'none',
            background: saving ? '#e2e8f0' : 'linear-gradient(135deg,#60a5fa,#3b82f6)',
            color: saving ? '#94a3b8' : '#fff', fontSize: '14px', fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            boxShadow: saving ? 'none' : '0 6px 18px rgba(59,130,246,0.28)', fontFamily: 'inherit',
          }}>
            {saving ? 'Đang lưu...' : <><Save size={15} /> Lưu mục tiêu</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
