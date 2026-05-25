import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, Heart, RefreshCw, Shuffle, Volume2 } from 'lucide-react';
import type { CategoryDTO, VocabularyWordDTO } from '@api/vocabulary.api';
import { vocabularyApi } from '@api/vocabulary.api';
import { B } from './colors';
import { Overlay, ModalBox, ModalHeader } from './shared';

export const VocabMenuModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedSet, setSelectedSet] = useState<CategoryDTO | null>(null);
  const [sets, setSets] = useState<CategoryDTO[]>([]);

  useEffect(() => {
    vocabularyApi
      .getVocabSets()
      .then((res) => setSets(res.data))
      .catch(console.error);
  }, []);

  if (selectedSet) {
    return (
      <AnimatePresence>
        <TopicListModal set={selectedSet} onClose={onClose} onBack={() => setSelectedSet(null)} />
      </AnimatePresence>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={680} onClick={(e) => e.stopPropagation()}>
        <ModalHeader name="PrepMe" streak={3} />
        <hr style={{ border: 'none', borderTop: `1px solid ${B[100]}`, marginBottom: '20px' }} />
        <h2
          style={{
            textAlign: 'center',
            color: B[400],
            fontSize: '18px',
            fontWeight: 800,
            marginBottom: '20px',
          }}
        >
          Chọn bộ từ vựng
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            overflowY: 'auto',
          }}
        >
          {sets.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', gridColumn: 'span 2' }}>
              Đang tải danh sách bộ từ...
            </p>
          )}
          {sets.map((s) => {
            const isLearning = s.status === 'LEARNING';
            const isLearned = s.status === 'LEARNED';
            const statusLabel = isLearning
              ? '⏳ Đang học'
              : isLearned
                ? '✅ Đã học xong'
                : '📖 Chưa học';
            const statusColor = isLearning ? '#fbbf24' : isLearned ? '#22c55e' : '#94a3b8';
            const borderColor = isLearning ? '#fde68a' : isLearned ? '#bbf7d0' : B[100];
            const bgColor = isLearning ? '#fffbeb' : isLearned ? '#f0fdf4' : '#fff';
            const nameColor = isLearning ? '#f59e0b' : isLearned ? '#16a34a' : B[500];
            return (
              <motion.div
                key={s.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSet(s)}
                style={{
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: '16px',
                  padding: '18px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  background: bgColor,
                }}
              >
                <span style={{ fontSize: '12px', color: statusColor, fontWeight: 600 }}>
                  {statusLabel}
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', color: nameColor, fontWeight: 800 }}>
                  {s.name}
                </h3>
                <div
                  style={{
                    background: '#f1f5f9',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  📚 {s.wordCount + ' từ'}
                </div>
              </motion.div>
            );
          })}
        </div>
        {/* Back Button - Đặt ở dưới cùng */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: B[300],
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={36} strokeWidth={3} />
          </button>
        </div>
      </ModalBox>
    </Overlay>

  );
};

const LEVEL_OPTIONS = ['Tất cả cấp độ', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const TopicListModal = ({
  set,
  onClose,
  onBack,
}: {
  set: CategoryDTO;
  onClose: () => void;
  onBack: () => void;
}) => {
  const [topics, setTopics] = useState<CategoryDTO[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [level, setLevel] = useState('Tất cả cấp độ');
  const [words, setWords] = useState<VocabularyWordDTO[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [showVocabList, setShowVocabList] = useState(false);
  const [startingLearn, setStartingLearn] = useState(false);

  useEffect(() => {
    vocabularyApi
      .getTopics(set.id)
      .then((res) => setTopics(res.data))
      .catch(console.error);
  }, [set.id]);

  useEffect(() => {
    if (selectedTopics.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWords([]);
      return;
    }

    vocabularyApi.getWords({
        topicIds: selectedTopics,
        level: level === 'Tất cả cấp độ' ? 'ALL' : level,
        size: 200,
      })
      .then((res) => setWords(res.data.content))
      .catch(console.error);
  }, [selectedTopics, level]);

  const toggleTopic = (id: number) => {
    setSelectedTopics((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const enterLearn = () => {
    if (selectedTopics.length === 0 && topics.length > 0) {
      setSelectedTopics(topics.map((t) => t.id));
    }
    setShowFlashcard(true);
  };

  const handleVaoHocNgay = async () => {
    const effectiveTopics =
      selectedTopics.length === 0 && topics.length > 0 ? topics.map((t) => t.id) : selectedTopics;

    if (effectiveTopics.length === 0) return;

    if (selectedTopics.length === 0 && topics.length > 0) {
      setSelectedTopics(topics.map((t) => t.id));
    }

    setStartingLearn(true);
    try {
      await vocabularyApi.startLearning(effectiveTopics);
      const refreshed = await vocabularyApi.getTopics(set.id);
      setTopics(refreshed.data);
    } catch (err) {
      console.error('Failed to start learning', err);
    } finally {
      setStartingLearn(false);
    }
    setShowVocabList(true);
  };

  if (showFlashcard) {
    const topicHeading = selectedTopics.length > 0
        ? topics
            .filter((t) => selectedTopics.includes(t.id))
            .map((t) => t.name.split(' - ')[1] || t.name)
            .join(', ')
        : 'Tất cả';

    return (
      <AnimatePresence>
        <FlashcardModal
          topicIds={selectedTopics}
          topicTitle={`${set.name} – ${topicHeading}`}
          onClose={() => setShowFlashcard(false)}
        />
      </AnimatePresence>
    );
  }

  if (showVocabList) {
    const selectedTitles =
      selectedTopics.length > 0
        ? topics
            .filter((t) => selectedTopics.includes(t.id))
            .map((t) => t.name.split(' - ')[1] || t.name)
            .join(', ')
        : 'Tất cả';

    return (
      <Overlay onClick={onClose}>
        <ModalBox maxWidth={720} height="88vh" onClick={(e) => e.stopPropagation()}>
          <ModalHeader name="PrepMe" streak={3} onBack={() => setShowVocabList(false)} />
          <hr style={{ border: 'none', borderTop: `1px solid ${B[100]}`, marginBottom: '18px' }} />

          <h2
            style={{
              textAlign: 'center',
              color: B[300],
              fontSize: '18px',
              fontWeight: 800,
              marginBottom: '24px',
            }}
          >
            {set.name} - {selectedTitles}
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 800, color: B[300] }}>
              Danh sách từ vựng
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${B[300]}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: B[400],
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: '#fff',
                }}
              >
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setWords((prev) => {
                    const arr = [...prev];
                    for (let i = arr.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [arr[i], arr[j]] = [arr[j], arr[i]];
                    }
                    return arr;
                  });
                }}
                style={{
                  background: B[100],
                  color: B[400],
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <Shuffle size={14} /> Trộn
              </button>
              <button
                onClick={enterLearn}
                title="Học Flashcard"
                style={{
                  background: B[100],
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: B[500],
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                }}
              >
                <FlashcardIcon size={18} color={B[500]} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '4px',
            }}
          >
            {words.map((w, idx) => (
              <VocabCard
                key={w.id}
                word={w}
                index={idx}
                saved={savedIds.has(w.id)}
                onToggleSave={() =>
                  setSavedIds((s) => {
                    const next = new Set(s);
                    if (next.has(w.id)) {
                      next.delete(w.id);
                    } else {
                      next.add(w.id);
                    }
                    return next;
                  })
                }
              />
            ))}
            {words.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>
                Chưa có từ nào.
              </p>
            )}
          </div>
        </ModalBox>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={720} height="88vh" onClick={(e) => e.stopPropagation()}>
        <ModalHeader name="PrepMe" streak={3} onBack={onBack} />
        <hr style={{ border: 'none', borderTop: `1px solid ${B[100]}`, marginBottom: '18px' }} />

        <h2
          style={{
            textAlign: 'center',
            color: B[400],
            fontSize: '17px',
            fontWeight: 800,
            marginBottom: '24px',
            margin: '0 0 24px 0',
          }}
        >
          Chọn bài học ({set.name})
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
            *Có thể chọn nhiều chủ đề cùng lúc
          </span>
          <button
            onClick={handleVaoHocNgay}
            disabled={startingLearn}
            style={{
              background: startingLearn ? '#fda4af' : B[300],
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '22px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: startingLearn ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
          >
            {startingLearn ? '⏳ Đang xử lý...' : '🚀 Vào Học Ngay'}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '4px',
          }}
        >
          {topics.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Không có chủ đề nào.</p>
          )}
          {topics.map((t) => {
            const checked = selectedTopics.includes(t.id);
            const isLearning = t.status === 'LEARNING';
            const isLearned = t.status === 'LEARNED';
            const status = isLearning
              ? { label: 'Đang học', icon: '⏳', color: '#fbbf24' }
              : isLearned
                ? { label: 'Đã học xong', icon: '✅', color: '#22c55e' }
                : { label: 'Chưa học', icon: '📖', color: '#94a3b8' };
            return (
              <div
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  border: `1.5px solid ${checked ? B[300] : isLearning ? '#fde68a' : isLearned ? '#bbf7d0' : '#f1f5f9'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  background: checked
                    ? B[50]
                    : isLearning
                      ? '#fffbeb'
                      : isLearned
                        ? '#f0fdf4'
                        : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#f59e0b',
                    }}
                  >
                    {t.name}
                  </p>
                  <span
                    style={{
                      background: isLearning ? '#fef3c7' : isLearned ? '#dcfce7' : '#f1f5f9',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: status.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {status.icon} {status.label}
                  </span>
                </div>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    border: `2px solid ${checked ? B[400] : '#cbd5e1'}`,
                    borderRadius: '5px',
                    background: checked ? B[400] : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  {checked && (
                    <span style={{ color: '#fff', fontSize: '13px', lineHeight: 1 }}>✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ModalBox>
    </Overlay>
  );
};

const VocabCard = ({
  word,
  index,
  saved,
  onToggleSave,
}: {
  word: VocabularyWordDTO;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    style={{
      border: '1.5px solid #fef9c3',
      borderRadius: '14px',
      padding: '14px 16px',
      background: '#fefce8',
      position: 'relative',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 2px 0', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
          {index + 1}. <span style={{ fontWeight: 800 }}>{word.word}</span>{' '}
          <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '12px' }}>
            ({word.wordType})
          </span>
        </p>
        <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#94a3b8' }}>
          Gốc: {word.categoryPath}
        </p>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '13px', color: '#334155' }}>
          Nghĩa: {word.meaning}
        </p>
        <div
          style={{
            background: 'rgba(251,113,133,0.08)',
            borderRadius: '8px',
            padding: '8px 10px',
            borderLeft: `3px solid ${B[300]}`,
          }}
        >
          <p
            style={{
              margin: '0 0 3px 0',
              fontSize: '13px',
              color: '#1e293b',
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            {(() => {
              const escapedWord = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const parts = word.exampleEn.split(
                new RegExp(`([a-zA-Z-]*${escapedWord}[a-zA-Z-]*)`, 'gi'),
              );
              return parts.map((part, idx) =>
                part.toLowerCase().includes(word.word.toLowerCase()) ? (
                  <span key={idx} style={{ color: B[400] }}>
                    {part}
                  </span>
                ) : (
                  part
                ),
              );
            })()}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{word.exampleVi}</p>
        </div>
      </div>
      <button
        onClick={onToggleSave}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: saved ? B[400] : '#cbd5e1',
          marginLeft: '8px',
          padding: '2px',
          flexShrink: 0,
        }}
      >
        <Heart size={18} fill={saved ? B[400] : 'transparent'} />
      </button>
    </div>
  </motion.div>
);

const FlashcardModal = ({
  topicIds,
  topicTitle,
  onClose,
}: {
  topicIds: number[];
  topicTitle: string;
  onClose: () => void;
}) => {
  const [words, setWords] = useState<VocabularyWordDTO[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [direction, setDirection] = useState(0); // -1 prev, 1 next
  const [flipped, setFlipped] = useState(false); // EN↔VI toggle
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    vocabularyApi
      .getFlashcardSession(topicIds, false)
      .then((res) => setWords(res.data))
      .catch(console.error);
  }, [topicIds]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0, 1, 1, 1, 0]);
  const dragRef = useRef<HTMLDivElement>(null);

  const current = words[index];
  const progress = current ? index + 1 : 0;
  const total = words.length;
  const pct = total === 0 ? 0 : (progress / total) * 100;

  const goNext = useCallback(
    (dir = 1) => {
      setDirection(dir);
      setShowAnswer(false);
      setIndex((i) => Math.min(i + 1, total - 1));
    },
    [total],
  );
  const goPrev = useCallback(() => {
    setDirection(-1);
    setShowAnswer(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setShowAnswer((s) => !s);
      }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowUp') setShowAnswer(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    const ox = info.offset.x;
    const oy = info.offset.y;
    if (Math.abs(ox) > 80) {
      if (ox > 0) {
        goPrev();
      } else {
        goNext();
      }
    } else if (oy < -60) {
      setShowAnswer(true);
    } else if (oy > 60) {
      setShowAnswer(false);
    }
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
  };

  if (!current && total === 0) {
      return (
          <Overlay onClick={onClose}>
            <ModalBox maxWidth={680} onClick={(e) => e.stopPropagation()}>
               <ModalHeader name="PrepMe" streak={3} onBack={onClose} />
               <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Chưa có từ nào.</p>
            </ModalBox>
          </Overlay>
      );
  }
  
  if (!current) return null;

  const speak = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(current.word);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={680} onClick={(e) => e.stopPropagation()}>
        <ModalHeader name="PrepMe" streak={3} />
        <hr style={{ border: 'none', borderTop: `1px solid ${B[100]}`, marginBottom: '14px' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: B[400] }}
          >
            <ChevronLeft size={24} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
             {topicTitle} ({progress} / {total} từ)
          </span>
          <button
            onClick={() => setFlipped((f) => !f)}
            style={{
              background: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              borderRadius: '10px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={12} />
            Đảo: {flipped ? 'VI → EN' : 'EN → VI'}
          </button>
        </div>

        <div
          style={{
            background: '#f1f5f9',
            borderRadius: '6px',
            height: '6px',
            marginBottom: '16px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${pct}%` }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #fde68a, #fb7185)',
              borderRadius: '6px',
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            ref={dragRef}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            {!showAnswer ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                  cursor: 'grab',
                  userSelect: 'none',
                  position: 'relative',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedIds((s) => {
                      const n = new Set(s);
                      if (n.has(current.id)) {
                        n.delete(current.id);
                      } else {
                        n.add(current.id);
                      }
                      return n;
                    });
                  }}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: savedIds.has(current.id) ? B[400] : '#cbd5e1',
                  }}
                >
                  <Heart size={20} fill={savedIds.has(current.id) ? B[400] : 'transparent'} />
                </button>

                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  Từ vựng
                </span>

                <p style={{ fontSize: '32px', fontWeight: 900, color: B[300], margin: 0 }}>
                  {flipped ? current.meaning : current.word}
                </p>
                {!flipped && (
                  <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>
                    ({current.wordType})
                  </p>
                )}

                <button
                  onClick={speak}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#94a3b8',
                  }}
                >
                  <Volume2 size={28} />
                  <span style={{ fontSize: '11px' }}></span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '24px 28px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  cursor: 'grab',
                  userSelect: 'none',
                  position: 'relative',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedIds((s) => {
                      const n = new Set(s);
                      if (n.has(current.id)) {
                        n.delete(current.id);
                      } else {
                        n.add(current.id);
                      }
                      return n;
                    });
                  }}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: savedIds.has(current.id) ? B[400] : '#cbd5e1',
                  }}
                >
                  <Heart size={20} fill={savedIds.has(current.id) ? B[400] : 'transparent'} />
                </button>

                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: B[300],
                    textAlign: 'center',
                    margin: '0 0 4px 0',
                  }}
                >
                  {flipped ? current.meaning : current.word}
                </p>
                {!flipped && (
                  <p
                    style={{
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '14px',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {current.pronunciation}
                  </p>
                )}

                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#1e293b',
                    margin: '0 0 4px 0',
                  }}
                >
                  {flipped ? current.word : current.meaning}{' '}
                  <span style={{ fontSize: '13px', color: B[400], fontWeight: 600 }}>
                    ({current.wordType})
                  </span>
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    margin: '0 0 16px 0',
                    fontStyle: 'italic',
                  }}
                >
                  {(() => {
                    const escapedWord = current.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const parts = current.exampleEn.split(
                      new RegExp(`([a-zA-Z-]*${escapedWord}[a-zA-Z-]*)`, 'gi'),
                    );
                    return parts.map((part, idx) =>
                      part.toLowerCase().includes(current.word.toLowerCase()) ? (
                        <span key={idx} style={{ color: B[400] }}>
                          {part}
                        </span>
                      ) : (
                        part
                      ),
                    );
                  })()}
                </p>
                <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                  {current.exampleVi}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {!showAnswer ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              onClick={() => setShowAnswer(true)}
              style={{
                background: B[300],
                color: '#fff',
                border: 'none',
                padding: '14px 36px',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(251,113,133,0.4)',
              }}
            >
              👁 Hiện Đáp Án
              <span style={{ fontSize: '11px', opacity: 0.8 }}>(Phím Space)</span>
            </button>
          </div>
        ) : (
          <>
            <p
              style={{
                textAlign: 'center',
                fontSize: '13px',
                color: '#94a3b8',
                margin: '24px 0 10px 0',
              }}
            >
              ← Kéo trái/phải để chuyển • Kéo lên/xuống để xem/ẩn đáp án →
            </p>
          </>
        )}
      </ModalBox>
    </Overlay>
  );
};

const FlashcardIcon = ({
  size = 20,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="7" y1="15" x2="11" y2="15" />
  </svg>
);
