import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ChevronLeft, ChevronRight, Eye, Database,
  Clock, BookOpen, Layers, ChevronDown, ChevronUp,
  FileText, Headphones, PenLine, Mic2, Trophy, Trash2,
  X, Check, AlertTriangle, ArrowLeft, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@components/ui/Button';
import { Card, CardBody } from '@components/ui/Card';
import { examsApi, type AdminCreateSectionRequest, type AdminCreateQuestionRequest, type AdminCreateTestRequest } from '@api/exams.api';
import type {
  TestListDTO, TestDetailDTO, TestSectionDTO, TestQuestionDTO,
  BEExamType, BEQuestionType,
} from '@types';

// ─── Constants ────────────────────────────────────────────────────────────────
const EXAM_TYPES: { value: BEExamType | 'ALL'; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'ALL', label: 'Tất cả', icon: <Trophy size={14} />, color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  { value: 'LISTENING', label: 'Listening', icon: <Headphones size={14} />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'READING', label: 'Reading', icon: <BookOpen size={14} />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { value: 'WRITING', label: 'Writing', icon: <PenLine size={14} />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'SPEAKING', label: 'Speaking', icon: <Mic2 size={14} />, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { value: 'IELTS', label: 'Full IELTS', icon: <Trophy size={14} />, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
];

const QUESTION_TYPES: { value: BEQuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
  { value: 'FILL_IN_THE_BLANK', label: 'Fill in the Blank' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
];

function examTypeColor(type?: string) {
  return EXAM_TYPES.find((t) => t.value === type)?.color
    ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

function formatDuration(secs?: number) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}p` : `${h}h`;
}

// ─── Sub-components: Modals ──────────────────────────────────────────────────

interface SectionModalProps { onClose: () => void; testId: number; sectionCount: number; onSuccess: () => void; }
const SectionModal = ({ onClose, testId, sectionCount, onSuccess }: SectionModalProps) => {
  const [form, setForm] = useState<AdminCreateSectionRequest>({
    sectionNumber: sectionCount + 1,
    title: '',
    audioUrl: '',
    passage: '',
    cueCard: '',
    sampleAnswer: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await examsApi.admin.createSection(testId, {
        ...form,
        title: form.title || undefined,
        audioUrl: form.audioUrl || undefined,
        passage: form.passage || undefined,
        cueCard: form.cueCard || undefined,
        sampleAnswer: form.sampleAnswer || undefined,
      });
      if (res.code === 200 || res.code === 201) {
        toast.success('Section đã được thêm thành công!');
        onSuccess();
        onClose();
      } else {
        toast.error('Thêm section thất bại');
      }
    } catch {
      toast.error('Lỗi khi thêm section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-black text-slate-800 dark:text-white">➕ Thêm Section mới</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Số thứ tự *</label>
              <input type="number" required value={form.sectionNumber}
                onChange={(e) => setForm(f => ({ ...f, sectionNumber: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Tiêu đề (vd: Passage 1)</label>
              <input type="text" value={form.title ?? ''} placeholder="Section 1 / Passage 1..."
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Audio URL (Listening)</label>
            <input type="url" value={form.audioUrl ?? ''} placeholder="https://..."
              onChange={(e) => setForm(f => ({ ...f, audioUrl: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Passage (Reading - HTML hoặc text)</label>
            <textarea rows={4} value={form.passage ?? ''} placeholder="Nội dung bài đọc..."
              onChange={(e) => setForm(f => ({ ...f, passage: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Cue Card (Speaking Part 2)</label>
            <textarea rows={3} value={form.cueCard ?? ''} placeholder="Describe a place you have visited..."
              onChange={(e) => setForm(f => ({ ...f, cueCard: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Sample Answer (Writing/Speaking)</label>
            <textarea rows={3} value={form.sampleAnswer ?? ''} placeholder="Model answer..."
              onChange={(e) => setForm(f => ({ ...f, sampleAnswer: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} className="flex-1" disabled={loading}>Hủy</Button>
            <Button type="submit" variant="primary" size="sm" className="flex-1" disabled={loading}>
              {loading ? 'Đang lưu...' : <><Check size={14} /> Lưu Section</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface QuestionModalProps { onClose: () => void; sectionId: number; questionCount: number; onSuccess: () => void; }
const QuestionModal = ({ onClose, sectionId, questionCount, onSuccess }: QuestionModalProps) => {
  const [form, setForm] = useState<{
    questionNumber: number;
    questionType: BEQuestionType;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>({
    questionNumber: questionCount + 1,
    questionType: 'MULTIPLE_CHOICE',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.questionText.trim()) { toast.error('Vui lòng nhập nội dung câu hỏi'); return; }
    if (!form.correctAnswer.trim()) { toast.error('Vui lòng nhập đáp án đúng'); return; }

    const payload: AdminCreateQuestionRequest = {
      questionNumber: form.questionNumber,
      questionType: form.questionType,
      questionText: form.questionText,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation || undefined,
      options: form.questionType === 'MULTIPLE_CHOICE'
        ? form.options.filter(o => o.trim() !== '')
        : undefined,
    };

    setLoading(true);
    try {
      const res = await examsApi.admin.createQuestion(sectionId, payload);
      if (res.code === 200 || res.code === 201) {
        toast.success('Câu hỏi đã được thêm thành công!');
        onSuccess();
        onClose();
      } else {
        toast.error('Thêm câu hỏi thất bại');
      }
    } catch {
      toast.error('Lỗi khi thêm câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const needsOptions = form.questionType === 'MULTIPLE_CHOICE';
  const tfOptions = form.questionType === 'TRUE_FALSE_NOT_GIVEN';
  const LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-black text-slate-800 dark:text-white">➕ Thêm Câu hỏi mới</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Số câu *</label>
              <input type="number" required value={form.questionNumber}
                onChange={(e) => setForm(f => ({ ...f, questionNumber: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Loại câu hỏi *</label>
              <select value={form.questionType}
                onChange={(e) => setForm(f => ({ ...f, questionType: e.target.value as BEQuestionType, correctAnswer: '', options: ['', '', '', ''] }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nội dung câu hỏi *</label>
            <textarea rows={3} required value={form.questionText} placeholder="Nhập nội dung câu hỏi..."
              onChange={(e) => setForm(f => ({ ...f, questionText: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Multiple Choice Options */}
          {needsOptions && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Các lựa chọn (A/B/C/D) *</label>
              <div className="space-y-2">
                {form.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {LABELS[oi]}
                    </span>
                    <input type="text" value={opt} placeholder={`Lựa chọn ${LABELS[oi]}...`}
                      onChange={(e) => {
                        const newOpts = [...form.options];
                        newOpts[oi] = e.target.value;
                        setForm(f => ({ ...f, options: newOpts }));
                      }}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Đáp án đúng *</label>
            {needsOptions ? (
              <div className="flex gap-2">
                {LABELS.map((l) => (
                  <button key={l} type="button"
                    onClick={() => setForm(f => ({ ...f, correctAnswer: l }))}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black transition ${form.correctAnswer === l
                      ? 'border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300 dark:border-slate-600'
                    }`}
                  >{l}</button>
                ))}
              </div>
            ) : tfOptions ? (
              <div className="flex gap-2">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map((v) => (
                  <button key={v} type="button"
                    onClick={() => setForm(f => ({ ...f, correctAnswer: v }))}
                    className={`rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition ${form.correctAnswer === v
                      ? 'border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300 dark:border-slate-600'
                    }`}
                  >{v === 'NOT GIVEN' ? 'NG' : v}</button>
                ))}
              </div>
            ) : (
              <input type="text" required value={form.correctAnswer} placeholder="Nhập đáp án đúng..."
                onChange={(e) => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Giải thích (tùy chọn)</label>
            <textarea rows={2} value={form.explanation} placeholder="Giải thích tại sao đáp án này đúng..."
              onChange={(e) => setForm(f => ({ ...f, explanation: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} className="flex-1" disabled={loading}>Hủy</Button>
            <Button type="submit" variant="primary" size="sm" className="flex-1" disabled={loading}>
              {loading ? 'Đang lưu...' : <><Check size={14} /> Lưu Câu hỏi</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Form tạo test mới
interface CreateTestFormProps { onCancel: () => void; onSuccess: () => void; }
const CreateTestForm = ({ onCancel, onSuccess }: CreateTestFormProps) => {
  const [form, setForm] = useState({
    title: '',
    examType: 'LISTENING' as BEExamType,
    durationMinutes: '40',
    isPro: false,
    description: '',
    audioUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài thi'); return; }
    setLoading(true);
    try {
      const res = await examsApi.admin.createTest({
        title: form.title,
        examType: form.examType,
        duration: Number(form.durationMinutes) * 60,
        isPro: form.isPro,
        description: form.description || undefined,
        audioUrl: form.audioUrl || undefined,
      });
      if (res.code === 200 || res.code === 201) {
        toast.success('Tạo bài thi thành công!');
        onSuccess();
      } else {
        toast.error('Tạo bài thi thất bại');
      }
    } catch {
      toast.error('Lỗi khi tạo bài thi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowLeft size={16} className="text-slate-500" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Tạo Đề thi mới</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Điền thông tin cơ bản của bài thi</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tiêu đề bài thi *</label>
              <input type="text" required value={form.title}
                placeholder="VD: IELTS Simulation Set 3 Listening test 1"
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Loại bài thi *</label>
                <select value={form.examType}
                  onChange={(e) => setForm(f => ({ ...f, examType: e.target.value as BEExamType }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 transition"
                >
                  {EXAM_TYPES.filter(t => t.value !== 'ALL').map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Thời gian (phút) *</label>
                <input type="number" required min={1} value={form.durationMinutes}
                  onChange={(e) => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 transition"
                />
              </div>
            </div>

            {(form.examType === 'LISTENING') && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Audio URL tổng (tùy chọn)</label>
                <input type="url" value={form.audioUrl} placeholder="https://..."
                  onChange={(e) => setForm(f => ({ ...f, audioUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Mô tả (tùy chọn)</label>
              <textarea rows={3} value={form.description} placeholder="Mô tả bài thi..."
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, isPro: !f.isPro }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${form.isPro ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isPro ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Bài thi PRO (yêu cầu gói Premium)
              </span>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button type="button" variant="secondary" size="md" onClick={onCancel} className="flex-1">
                Hủy
              </Button>
              <Button type="submit" variant="primary" size="md" className="flex-1" disabled={loading}>
                {loading ? 'Đang xử lý...' : <><Plus size={14} /> Tạo bài thi</>}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// ─── Section Accordion ───────────────────────────────────────────────────────
const SectionAccordion = ({ section, onRefresh }: { section: TestSectionDTO; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [showQModal, setShowQModal] = useState(false);

  const LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs font-black text-indigo-600 dark:text-indigo-400">
            {section.sectionNumber}
          </span>
          <div>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {section.title || `Section ${section.sectionNumber}`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {section.questions.length} câu hỏi
              {section.audioUrl && ' • 🎧 Audio'}
              {section.passage && ' • 📄 Passage'}
              {section.cueCard && ' • 📌 Cue Card'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {section.questions.length} câu
          </span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Section Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4 border-t border-slate-100 dark:border-slate-700">
              {/* Audio */}
              {section.audioUrl && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-3 flex items-center gap-3">
                  <Headphones size={16} className="text-blue-500 shrink-0" />
                  <a href={section.audioUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 underline truncate">
                    {section.audioUrl}
                  </a>
                </div>
              )}

              {/* Passage Preview */}
              {section.passage && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">📄 Passage</p>
                  <div
                    className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: section.passage }}
                  />
                </div>
              )}

              {/* Cue Card Preview */}
              {section.cueCard && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-4">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">📌 Cue Card</p>
                  <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans">{section.cueCard}</pre>
                </div>
              )}

              {/* Questions Table */}
              {section.questions.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Câu hỏi</p>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800">
                          <th className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400 w-12">#</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400">Nội dung câu hỏi</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400 w-32">Loại</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400 w-24">Đáp án</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400 w-24">Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {section.questions.map((q: TestQuestionDTO) => (
                          <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300">
                              {q.questionNumber}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200 max-w-[300px]">
                              <p className="truncate">{q.questionText || '—'}</p>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                q.questionType === 'MULTIPLE_CHOICE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                  : q.questionType === 'TRUE_FALSE_NOT_GIVEN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                                {q.questionType === 'MULTIPLE_CHOICE' ? 'MC'
                                  : q.questionType === 'TRUE_FALSE_NOT_GIVEN' ? 'T/F/NG'
                                  : q.questionType === 'FILL_IN_THE_BLANK' ? 'Fill'
                                  : 'Short'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              {q.correctAnswer ? (
                                <span className="rounded bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[11px] font-black text-green-700 dark:text-green-300">
                                  {q.correctAnswer}
                                </span>
                              ) : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                              {q.options && q.options.length > 0 ? (
                                <span className="text-[10px]">
                                  {q.options.map((o, i) => `${LABELS[i] ?? i + 1}. ${o}`).join(' | ')}
                                </span>
                              ) : <span>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-8 text-center">
                  <FileText size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Chưa có câu hỏi nào</p>
                </div>
              )}

              {/* Add Question Button */}
              <button
                type="button"
                onClick={() => setShowQModal(true)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition w-full justify-center"
              >
                <Plus size={14} /> Thêm câu hỏi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal */}
      <AnimatePresence>
        {showQModal && (
          <QuestionModal
            onClose={() => setShowQModal(false)}
            sectionId={section.id}
            questionCount={section.questions.length}
            onSuccess={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Detail View ─────────────────────────────────────────────────────────────
const ExamDetailView = ({ examId, onBack }: { examId: number; onBack: () => void }) => {
  const [showSectionModal, setShowSectionModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-exam-detail', examId],
    queryFn: async () => {
      const res = await examsApi.getById(examId, false);
      return res.data as TestDetailDTO;
    },
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa section này? Tất cả câu hỏi trong section cũng sẽ bị xóa.')) return;
    try {
      const res = await examsApi.admin.deleteSection(sectionId);
      if (res.code === 200 || res.code === 201) {
        toast.success('Đã xóa section!');
        handleRefresh();
      } else {
        toast.error('Xóa section thất bại');
      }
    } catch {
      toast.error('Lỗi khi xóa section');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải chi tiết đề thi...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center text-slate-500 dark:text-slate-400">
        <Info size={40} className="mx-auto mb-3 text-slate-300" />
        <p>Không tìm thấy đề thi</p>
        <Button variant="secondary" size="sm" onClick={onBack} className="mt-4">
          <ArrowLeft size={14} /> Quay lại
        </Button>
      </div>
    );
  }

  const totalQuestions = data.sections.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {/* Back + Title */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={onBack} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition mt-1 shrink-0">
          <ArrowLeft size={16} className="text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${examTypeColor(data.examType)}`}>
              {data.examType}
            </span>
            {data.isPro && (
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                PRO
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mt-1">{data.title}</h2>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
            <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(data.duration)}</span>
            <span className="flex items-center gap-1"><Layers size={12} /> {data.sections.length} sections</span>
            <span className="flex items-center gap-1"><FileText size={12} /> {totalQuestions} câu hỏi</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Sections', value: data.sections.length, icon: <Layers size={18} className="text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Câu hỏi', value: totalQuestions, icon: <FileText size={18} className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Thời gian', value: formatDuration(data.duration), icon: <Clock size={18} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 ${stat.bg}`}>
            {stat.icon}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{stat.label}</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Sections ({data.sections.length})
          </h3>
          <button
            onClick={() => setShowSectionModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
          >
            <Plus size={12} /> Thêm Section
          </button>
        </div>

        {data.sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center">
            <Layers size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Chưa có section nào</p>
            <button
              onClick={() => setShowSectionModal(true)}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              <Plus size={12} className="inline mr-1" /> Thêm Section đầu tiên
            </button>
          </div>
        ) : (
          data.sections.map((section) => (
            <div key={section.id} className="relative">
              <SectionAccordion section={section} onRefresh={handleRefresh} />
              <button
                onClick={() => handleDeleteSection(section.id)}
                title="Xóa section"
                className="absolute top-3 right-12 rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition group z-10"
              >
                <Trash2 size={13} className="text-slate-400 group-hover:text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Section Modal */}
      <AnimatePresence>
        {showSectionModal && (
          <SectionModal
            onClose={() => setShowSectionModal(false)}
            testId={examId}
            sectionCount={data.sections.length}
            onSuccess={handleRefresh}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminExamsPage = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Filters & Pagination
  const [typeFilter, setTypeFilter] = useState<BEExamType | 'ALL'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin-exams', typeFilter, search, page],
    queryFn: async () => {
      const res = await examsApi.getAll({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        search: search.trim() || undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });
      return res.data;
    },
    enabled: view === 'list',
  });

  const exams: TestListDTO[] = listData?.content ?? [];
  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalElements = listData?.pagination?.totalElements ?? 0;

  const handleSeed = async () => {
    if (!window.confirm('Bạn có muốn seed dữ liệu demo? Thao tác này sẽ tạo thêm bộ đề mẫu.')) return;
    const t = toast.loading('Đang seed dữ liệu demo...');
    try {
      const res = await examsApi.seedDemoExams();
      if (res.code === 200 || res.code === 201) {
        toast.success('Seed thành công!', { id: t });
        queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
      } else {
        toast.error('Seed thất bại', { id: t });
      }
    } catch {
      toast.error('Lỗi khi seed dữ liệu', { id: t });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-500" size={26} />
            Quản lý Đề thi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tạo và quản lý bộ đề IELTS Listening, Reading, Writing, Speaking
          </p>
        </div>
        {view === 'list' && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSeed}>
              <Database size={14} /> Seed Demo
            </Button>
            <Button variant="primary" size="sm" onClick={() => setView('create')}>
              <Plus size={14} /> Tạo đề thi
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── VIEW: LIST ── */}
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Type Filters */}
            <div className="flex gap-2 flex-wrap">
              {EXAM_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTypeFilter(t.value); setPage(1); }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    typeFilter === t.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đề thi..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={() => { setSearch(searchInput); setPage(1); }}>
                Tìm
              </Button>
              {(search || typeFilter !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setTypeFilter('ALL'); setPage(1); }}>
                  <X size={14} /> Xóa lọc
                </Button>
              )}
            </div>

            {/* Stats row */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tổng: <strong>{totalElements}</strong> đề thi
            </div>

            {/* Table */}
            <Card>
              <CardBody className="p-0">
                {isLoading ? (
                  <div className="py-16 text-center">
                    <div className="inline-block h-7 w-7 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="py-16 text-center">
                    <FileText size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Không tìm thấy đề thi nào</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Nhấn "Seed Demo" để tạo dữ liệu mẫu</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiêu đề</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Loại</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Thời gian</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Sections</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">Pro</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Ngày tạo</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {exams.map((exam, idx) => (
                          <motion.tr
                            key={exam.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="px-4 py-3.5 text-xs font-bold text-slate-400">
                              {(page - 1) * PAGE_SIZE + idx + 1}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-slate-800 dark:text-white leading-tight">{exam.title}</p>
                              {exam.description && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{exam.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${examTypeColor(exam.examType)}`}>
                                {exam.examType}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <Clock size={12} className="text-slate-400" />
                                {formatDuration(exam.duration)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <Layers size={12} className="text-slate-400" />
                                {exam.sectionCount}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {exam.isPro ? (
                                <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 uppercase">PRO</span>
                              ) : (
                                <span className="text-slate-400 text-xs">Free</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => { setSelectedId(exam.id); setView('detail'); }}
                                  title="Xem chi tiết"
                                  className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 transition group"
                                >
                                  <Eye size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm(`Xóa "${exam.title}"?`)) return;
                                    try {
                                      const res = await examsApi.admin.deleteTest(exam.id);
                                      if (res.code === 200 || res.code === 201) {
                                        toast.success('Đã xóa bài thi!');
                                        queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
                                      } else {
                                        toast.error('Xóa thất bại');
                                      }
                                    } catch {
                                      toast.error('Lỗi khi xóa bài thi');
                                    }
                                  }}
                                  title="Xóa"
                                  className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition group"
                                >
                                  <Trash2 size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition ${p === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >{p}</button>
                    );
                  })}
                  <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── VIEW: DETAIL ── */}
        {view === 'detail' && selectedId && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ExamDetailView
              examId={selectedId}
              onBack={() => setView('list')}
            />
          </motion.div>
        )}

        {/* ── VIEW: CREATE ── */}
        {view === 'create' && (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CreateTestForm
              onCancel={() => setView('list')}
              onSuccess={() => {
                setView('list');
                queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
