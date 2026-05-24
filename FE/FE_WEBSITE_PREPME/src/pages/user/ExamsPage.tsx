import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Play, BookOpen, Clock, FileText } from 'lucide-react';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const examSets = [
  {
    id: 'cambridge',
    label: 'Cambridge IELTS',
    books: Array.from({ length: 16 }, (_, i) => ({
      id: `cam-${i + 1}`,
      title: `Cambridge ${i + 1}`,
      tests: 4,
      duration: 170,
    })),
  },
  {
    id: 'ielts-trainer',
    label: 'IELTS Trainer',
    books: Array.from({ length: 6 }, (_, i) => ({
      id: `trainer-${i + 1}`,
      title: `Trainer ${i + 1}`,
      tests: 3,
      duration: 170,
    })),
  },
  {
    id: 'road-to-ielts',
    label: 'Road to IELTS',
    books: Array.from({ length: 8 }, (_, i) => ({
      id: `road-${i + 1}`,
      title: `Road ${i + 1}`,
      tests: 4,
      duration: 170,
    })),
  },
];

// Individual tests inside a Cambridge book
const getTests = (bookId: string) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `${bookId}-test-${i + 1}`,
    title: `Test ${i + 1}`,
    questions: 200,
    duration: 120,
    status: 'Chưa làm' as const,
  }));

export const ExamsPage = () => {
  const [activeSet, setActiveSet] = useState(0);
  const [activeBook, setActiveBook] = useState(0);
  const [search, setSearch] = useState('');

  const currentSet = examSets[activeSet];
  const books = currentSet.books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );
  const currentBook = books[activeBook] ?? books[0];
  const tests = currentBook ? getTests(currentBook.id) : [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ChevronLeft size={20} color={BRAND[400]} style={{ cursor: 'pointer' }} />
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', margin: 0 }}>
            Chinh phục IELTS Full Test
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Luyện để thi thật & chấm điểm tự động
          </p>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          border: `1.5px solid ${BRAND[100]}`,
          padding: '24px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(244,63,94,0.08)',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '14px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '11px 16px' }}>
            <Search size={15} color="#fbbf24" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Tìm kiếm bộ đề..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                color: '#334155',
                fontFamily: 'inherit',
                flex: 1,
              }}
            />
          </div>
          <button
            style={{
              background: '#fbbf24',
              color: '#fff',
              border: 'none',
              padding: '11px 20px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Tìm
          </button>
        </div>

        {/* Exam set tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px', borderBottom: `2px solid ${BRAND[100]}`, overflowX: 'auto' }}>
          {examSets.map((set, i) => (
            <button
              key={set.id}
              onClick={() => { setActiveSet(i); setActiveBook(0); }}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: activeSet === i ? 800 : 500,
                color: activeSet === i ? BRAND[500] : '#64748b',
                borderBottom: activeSet === i ? `2.5px solid ${BRAND[500]}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                marginBottom: '-2px',
                transition: 'all 0.15s',
              }}
            >
              {set.label}
            </button>
          ))}

          {/* Scroll arrows */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveBook((b) => Math.max(0, b - 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActiveBook((b) => Math.min(books.length - 1, b + 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Book selector strip */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
          {books.map((book, i) => (
            <button
              key={book.id}
              onClick={() => setActiveBook(i)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1.5px solid ${activeBook === i ? BRAND[400] : BRAND[100]}`,
                background: activeBook === i ? BRAND[50] : 'transparent',
                color: activeBook === i ? BRAND[500] : '#64748b',
                fontWeight: activeBook === i ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {book.title}
            </button>
          ))}
        </div>

        {/* Test cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {tests.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: '#fff',
                border: `1.5px solid ${BRAND[100]}`,
                borderRadius: '16px',
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{test.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={13} color="#94a3b8" />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{test.questions} câu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#94a3b8" />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{test.duration} phút</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>Chưa làm</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: `1.5px solid ${BRAND[200]}`,
                    background: '#fff',
                    color: BRAND[500],
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = BRAND[50];
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#fff';
                  }}
                >
                  <Play size={12} fill={BRAND[400]} color={BRAND[400]} />
                  Luyện thi
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: `1.5px solid ${BRAND[200]}`,
                    background: '#fff',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#fff';
                  }}
                >
                  <BookOpen size={12} />
                  Luyện tập
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
