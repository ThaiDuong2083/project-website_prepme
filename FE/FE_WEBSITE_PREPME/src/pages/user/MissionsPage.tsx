import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, History, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const GREEN = '#22c55e';

const suggestedMissions = [
  'Luyện 1 đề Full',
  'Học 50 từ',
  'Ôn câu sai',
  'Nghe Part 3',
  'Viết Task 2',
  'Đọc Reading 1',
];

interface Mission {
  id: string;
  text: string;
  deadline: string;
  done: boolean;
}

export const MissionsPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputDeadline, setInputDeadline] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const addMission = () => {
    if (!inputText.trim()) return;
    setMissions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputText.trim(),
        deadline: inputDeadline,
        done: false,
      },
    ]);
    setInputText('');
    setInputDeadline('');
  };

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
    );
  };

  const deleteMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  const activeMissions = missions.filter((m) => !m.done);
  const doneMissions = missions.filter((m) => m.done);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Modal-like card matching the design */}
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
            padding: '20px 24px 12px',
            borderBottom: `1px dashed ${BRAND[100]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: GREEN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Nhiệm Vụ
              </h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Kỷ luật là cầu nối giữa mục tiêu và thành tựu
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'none',
              border: `1.5px solid ${BRAND[100]}`,
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '12px',
              color: '#64748b',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            <Clock size={13} />
            Lịch sử
          </button>
        </div>

        {/* Input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            borderBottom: `1px solid ${BRAND[50]}`,
          }}
        >
          <div
            style={{
              flex: 1,
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '12px',
              padding: '10px 14px',
            }}
          >
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMission()}
              placeholder="Luyện 1 đề Full Test"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                color: '#334155',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <input
            type="time"
            value={inputDeadline}
            onChange={(e) => setInputDeadline(e.target.value)}
            style={{
              border: `1.5px solid ${BRAND[100]}`,
              borderRadius: '10px',
              padding: '10px 10px',
              fontSize: '13px',
              color: '#64748b',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <button
            onClick={addMission}
            style={{
              background: GREEN,
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={15} />
            Thêm
          </button>
        </div>

        {/* Quick suggestions */}
        <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: `1px solid ${BRAND[50]}` }}>
          {suggestedMissions.map((s) => (
            <button
              key={s}
              onClick={() => setInputText(s)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: `1.5px solid ${BRAND[100]}`,
                background: 'transparent',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = BRAND[50];
                (e.currentTarget as HTMLElement).style.borderColor = BRAND[300];
                (e.currentTarget as HTMLElement).style.color = BRAND[500];
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = BRAND[100];
                (e.currentTarget as HTMLElement).style.color = '#64748b';
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mission list */}
        <div style={{ padding: '16px 24px', minHeight: '200px' }}>
          <AnimatePresence>
            {missions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', paddingTop: '40px' }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                  Hôm nay bạn chưa có mục tiêu nào.
                  <br />
                  Hãy viết gì đó vào ô trống phía trên nhé!
                </p>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Active */}
                {activeMissions.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `1.5px solid ${BRAND[100]}`,
                      background: '#fff',
                    }}
                  >
                    <button
                      onClick={() => toggleMission(m.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${BRAND[200]}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '14px', color: '#334155' }}>{m.text}</span>
                    {m.deadline && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {m.deadline}
                      </span>
                    )}
                    <button
                      onClick={() => deleteMission(m.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}

                {/* Completed */}
                {doneMissions.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `1.5px solid #dcfce7`,
                      background: '#f0fdf4',
                      opacity: 0.7,
                    }}
                  >
                    <button
                      onClick={() => toggleMission(m.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${GREEN}`,
                        background: GREEN,
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <CheckCircle2 size={13} color="#fff" />
                    </button>
                    <span style={{ flex: 1, fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through' }}>{m.text}</span>
                    <button
                      onClick={() => deleteMission(m.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
