import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Heart, Shuffle } from 'lucide-react';
import { vocabularyApi, type FavoriteVocabDTO } from '@api/vocabulary.api';
import { B } from './colors';
import { Overlay, ModalBox, ModalHeader, ToastContainer, type ToastState } from './shared';

import { FlashcardModal, FlashcardIcon } from './VocabModals';
import type { VocabularyWordDTO } from '@api/vocabulary.api';

const LEVEL_OPTIONS = ['Tất cả cấp độ', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const FavoriteWordCard = ({
  item,
  index,
  onRemove,
}: {
  item: FavoriteVocabDTO;
  index: number;
  onRemove: (wordId: number) => void;
}) => {
  const escapedWord = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = (item.exampleEn || '').split(
    new RegExp(`([a-zA-Z-]*${escapedWord}[a-zA-Z-]*)`, 'gi'),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: index * 0.03 }}
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
            {index + 1}.{' '}
            <span style={{ fontWeight: 800 }}>{item.word}</span>{' '}
            <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '12px' }}>
              ({item.wordType})
            </span>
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#94a3b8' }}>
            Gốc: {item.categoryPath}
          </p>
          <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '13px', color: '#334155' }}>
            Nghĩa: {item.meaning}
          </p>
          {item.exampleEn && (
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
                {parts.map((part, idx) =>
                  part.toLowerCase().includes(item.word.toLowerCase()) ? (
                    <span key={idx} style={{ color: B[400] }}>
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
              {item.exampleVi && (
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{item.exampleVi}</p>
              )}
            </div>
          )}
        </div>

        {/* ❤️ Remove button */}
        <button
          id={`remove-fav-${item.wordId}`}
          onClick={() => onRemove(item.wordId)}
          title="Xóa khỏi yêu thích"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: B[400],
            marginLeft: '8px',
            padding: '2px',
            flexShrink: 0,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.25)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
        >
          <Heart size={18} fill={B[400]} color={B[400]} />
        </button>
      </div>
    </motion.div>
  );
};

export const FavoriteWordsModal = ({ onClose }: { onClose: () => void }) => {
  const [favorites, setFavorites] = useState<FavoriteVocabDTO[]>([]);
  const [filtered, setFiltered] = useState<FavoriteVocabDTO[]>([]);
  const [level, setLevel] = useState('Tất cả cấp độ');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showFlashcard, setShowFlashcard] = useState(false);

  const showToast = useCallback(
    (msg: string, type: ToastState['type'] = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 2500);
    },
    [],
  );

  useEffect(() => {
    setLoading(true);
    vocabularyApi
      .getFavorites()
      .then((res) => setFavorites(res.data ?? []))
      .catch(() => showToast('Không thể tải danh sách yêu thích', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  // Apply level filter
  useEffect(() => {
    if (level === 'Tất cả cấp độ') {
      setFiltered(favorites);
    } else {
      setFiltered(favorites.filter((f) => f.level === level));
    }
  }, [favorites, level]);

  const handleShuffle = () => {
    setFiltered((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  };

  const handleRemove = async (wordId: number) => {
    try {
      await vocabularyApi.removeFavorite(wordId);
      setFavorites((prev) => prev.filter((f) => f.wordId !== wordId));
      showToast('Đã xóa khỏi yêu thích 💔', 'info');
    } catch {
      showToast('Xóa thất bại, vui lòng thử lại', 'error');
    }
  };

  if (showFlashcard) {
    const customWords: VocabularyWordDTO[] = filtered.map((f) => ({
      id: f.wordId,
      word: f.word,
      wordType: f.wordType,
      pronunciation: f.pronunciation,
      meaning: f.meaning,
      exampleEn: f.exampleEn,
      exampleVi: f.exampleVi,
      level: f.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
      categoryId: f.categoryId,
      categoryName: f.categoryName,
      categoryPath: f.categoryPath,
    }));
    const savedIds = new Set(favorites.map((f) => f.wordId));

    return (
      <AnimatePresence>
        <FlashcardModal
          topicTitle="Từ vựng của tôi"
          onClose={() => setShowFlashcard(false)}
          customWords={customWords}
          savedIds={savedIds}
          onToggleSave={handleRemove}
        />
      </AnimatePresence>
    );
  }

  return (
    <>
      <Overlay onClick={onClose}>
        <ModalBox maxWidth={720} height="88vh" onClick={(e) => e.stopPropagation()}>
          <ModalHeader name="PrepMe" streak={3} />
          <hr style={{ border: 'none', borderTop: `1px solid ${B[100]}`, marginBottom: '16px' }} />

          {/* Title */}
          <h2
            style={{
              textAlign: 'center',
              color: B[400],
              fontSize: '18px',
              fontWeight: 800,
              marginBottom: '20px',
            }}
          >
            Từ vựng của tôi ({favorites.length})
          </h2>

          {/* Filter bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 800, color: B[300] }}>
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
                onClick={handleShuffle}
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
                onClick={() => {
                  if (filtered.length > 0) setShowFlashcard(true);
                  else showToast('Chưa có từ nào để học', 'info');
                }}
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

          {/* Word list */}
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
            {loading && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>
                Đang tải...
              </p>
            )}

            {!loading && filtered.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '40px' }}>💔</span>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                  {level !== 'Tất cả cấp độ'
                    ? 'Không có từ nào ở cấp độ này.'
                    : 'Bạn chưa lưu từ vựng nào.'}
                </p>
              </div>
            )}

            <AnimatePresence>
              {filtered.map((item, idx) => (
                <FavoriteWordCard
                  key={item.wordId}
                  item={item}
                  index={idx}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Back */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
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

      <ToastContainer toast={toast} />
    </>
  );
};
