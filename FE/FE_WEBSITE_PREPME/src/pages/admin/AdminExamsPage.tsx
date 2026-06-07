import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ChevronLeft, ChevronRight, Eye, Database,
  Clock, BookOpen, Layers, ChevronDown, ChevronUp,
  FileText, Headphones, PenLine, Mic2, Trophy, Trash2,
  X, Check, ArrowLeft, Info, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@components/ui/Button';
import { Card, CardBody } from '@components/ui/Card';
import { examsApi, type AdminCreateSectionRequest, type AdminCreateQuestionRequest } from '@api/exams.api';
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

const QUESTION_TYPES: { value: BEQuestionType; label: string; shortLabel: string; color: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (A/B/C/D)', shortLabel: 'MC', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given', shortLabel: 'T/F/NG', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given', shortLabel: 'Y/N/NG', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'FILL_IN_THE_BLANK', label: 'Fill in the Blank', shortLabel: 'Fill', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'SHORT_ANSWER', label: 'Short Answer', shortLabel: 'Short', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'MATCHING_HEADINGS', label: 'Matching Headings', shortLabel: 'Match', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
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
// ─── Utility: Auto-format plain text → HTML passage ─────────────────────────
/**
 * Detects Writing Task1 / Task2 / Speaking / generic và format thành HTML chuẩn CSV.
 * - Task 1 (có "Summarise/Summarize", "chart", "diagram", "graph", "map", "table")
 *   → mỗi đoạn dùng <strong>, nếu có imageUrl thêm <img> ở cuối
 * - Task 2 (câu hỏi essay: có "?" hoặc "agree", "discuss", "What", "Why", "How")
 *   → mỗi đoạn dùng <strong><em>
 * - Speaking (bullet points bắt đầu bằng "-" hoặc "•")
 *   → <h6>heading</h6><ul><li>...</li></ul>
 * - Fallback (Listening notes, Reading passage)
 *   → mỗi đoạn dùng <p>
 */
function formatPassageToHtml(rawText: string, imageUrl?: string): string {
  const text = rawText.trim();
  if (!text) return '';

  // Đã là HTML rồi → trả về nguyên
  if (text.startsWith('<')) return text;

  // ── Detect task type ──────────────────────────────────────────────────────
  const isTask1 = /summaris|summariz|chart|diagram|graph|map\b|the (figure|data|information) (below|above)/i.test(text);

  // Speaking: có bullet (-/•) HOẶC có bracket hints kiểu IELTS Part 1 [How?] [Why?]
  const hasBullets = /^(\s*[-•]\s+|\s*<li>)/m.test(text);
  const hasBracketHints = /\[\s*(How|Why|When|Where|What|Who)[^[\]]*\?[^[\]]*]/i.test(text);
  const isSpeaking = hasBullets || hasBracketHints;

  const isTask2 = !isTask1 && !isSpeaking && (
    text.includes('?') ||
    /\b(agree|disagree|discuss|opinion|view|extent|advantage|disadvantage|cause|effect|solution|problem)\b/i.test(text)
  );

  // ── Speaking → <p><strong>heading</strong></p> + <ul><li><strong>...</strong></li></ul> ──
  if (isSpeaking) {
    // Chuẩn hoá single-line → multi-line
    let normalized = text;
    if (!text.includes('\n')) {
      // Tách tại 2+ space trước chữ hoa (topic separator)
      normalized = normalized.replace(/\s{2,}(?=[A-Z])/g, '\n');
      // Tách sau mỗi câu hỏi (kể cả có bracket) trước chữ hoa tiếp theo
      normalized = normalized.replace(/(\?(?:\s*\[[^\][]*])?)\s+([A-Z])/g, '$1\n$2');
    }

    const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);

    const sections: { heading: string; questions: string[] }[] = [];
    let cur: { heading: string; questions: string[] } | null = null;

    for (const line of lines) {
      const cleanLine = line.replace(/^[-•]\s*/, '');
      // Là câu hỏi nếu có dấu ? ngoài bracket
      const isQuestion = /\?/.test(cleanLine.replace(/\[.*?]/g, ''));

      if (!isQuestion) {
        if (cur) sections.push(cur);
        cur = { heading: cleanLine, questions: [] };
      } else {
        if (!cur) cur = { heading: '', questions: [] };
        cur.questions.push(cleanLine);
      }
    }
    if (cur) sections.push(cur);

    const parts = sections.map(sec => {
      const headingHtml = sec.heading
        ? `<p><strong>${sec.heading}</strong></p>`
        : '';
      if (sec.questions.length === 0) return headingHtml;
      const liItems = sec.questions
        .map(q => `  <li><strong>${q}</strong></li>`)
        .join('\n');
      const ul = `<ul>\n${liItems}\n</ul>`;
      return headingHtml ? `${headingHtml}\n${ul}` : ul;
    });

    return parts.filter(Boolean).join('\n\n');
  }

  // ── Writing Task 1 / Task 2 → <div class="writing-task"> ─────────────────
  if (isTask1 || isTask2) {
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);

    const pHtml = paragraphs.map(para => {
      if (isTask2) {
        return `    <p>\n        <strong><em>\n            ${para}\n        </em></strong>\n    </p>`;
      } else {
        return `    <p>\n        <strong>\n            ${para}\n        </strong>\n    </p>`;
      }
    }).join('\n\n');

    let html = `<div class="writing-task">\n${pHtml}`;

    // Nếu có image URL → thêm khối <img>
    const isImageUrl = imageUrl && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(imageUrl);
    if (isImageUrl) {
      html += `\n\n    <p>\n        <img\n            src="${imageUrl}"\n            alt="Task image"\n            style="max-width: 100%; height: auto;"\n        />\n    </p>`;
    }

    html += `\n</div>`;
    return html;
  }

  // ── Fallback: Listening notes / Reading → mỗi đoạn là <p> ───────────────
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(para => `<p>${para}</p>`).join('\n');
}

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
  const [passagePreview, setPassagePreview] = useState(false);
  const [rawPassage, setRawPassage] = useState('');

  // Kiểm tra passage hiện tại có phải HTML chưa
  const isPassageHtml = (form.passage ?? '').trimStart().startsWith('<');

  const handleAutoFormat = () => {
    const source = rawPassage.trim() || (form.passage ?? '');
    if (!source) { toast.error('Vui lòng nhập nội dung passage trước'); return; }
    const html = formatPassageToHtml(source, form.audioUrl ?? '');
    setForm(f => ({ ...f, passage: html }));
    setRawPassage('');
    setPassagePreview(true);
    toast.success('Đã format sang HTML!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalPassage = form.passage?.trim() || '';
    if (!finalPassage && rawPassage.trim()) {
      finalPassage = formatPassageToHtml(rawPassage.trim(), form.audioUrl ?? '');
      setForm(f => ({ ...f, passage: finalPassage }));
    }

    try {
      const res = await examsApi.admin.createSection(testId, {
        ...form,
        title: form.title || undefined,
        audioUrl: form.audioUrl || undefined,
        passage: finalPassage || undefined,
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
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-black text-slate-800 dark:text-white">➕ Thêm Section mới</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Số thứ tự *</label>
              <input type="number" required value={form.sectionNumber}
                onChange={(e) => setForm(f => ({ ...f, sectionNumber: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Tiêu đề (vd: Section 1 / Passage 1)</label>
              <input type="text" value={form.title ?? ''} placeholder="Section 1 / Passage 1..."
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              />
            </div>
          </div>

          {/* Audio URL */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              🎧 Audio URL <span className="font-normal text-slate-400">(Listening — Cloudinary/CDN link)</span>
            </label>
            <input type="url" value={form.audioUrl ?? ''} placeholder="https://res.cloudinary.com/..."
              onChange={(e) => setForm(f => ({ ...f, audioUrl: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 font-mono text-xs"
            />
          </div>

          {/* Passage — two-mode: plain text → auto-format HTML */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                📄 Passage
              </label>
              <div className="flex items-center gap-1.5">
                {form.passage && (
                  <span className="text-[10px] text-slate-400">{(form.passage ?? '').length} ký tự</span>
                )}
                {isPassageHtml && (
                  <button
                    type="button"
                    onClick={() => setPassagePreview(p => !p)}
                    className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                      passagePreview
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400'
                        : 'border-slate-200 text-slate-500 hover:border-indigo-300 dark:border-slate-600'
                    }`}
                  >
                    {passagePreview ? <><PenLine size={10} /> Sửa HTML</> : <><Eye size={10} /> Xem trước</>}
                  </button>
                )}
              </div>
            </div>

            {/* Bước 1: Nhập plain text → Auto-format */}
            <div className="rounded-xl border border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-900/10 p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  🪄 Bước 1 — Nhập plain text → Auto-format HTML
                </span>
                <button
                  type="button"
                  onClick={handleAutoFormat}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 text-xs font-black transition shadow-sm"
                >
                  <Sparkles size={12} /> Auto-format HTML
                </button>
              </div>

              {/* Passage type selector */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {([
                  { value: 'reading',  label: '📖 Reading / Listening', hint: 'Đoạn văn → mỗi đoạn <p>' },
                  { value: 'speaking', label: '🎤 Speaking',            hint: 'Heading + bullet in đậm' },
                  { value: 'task1',    label: '✍️ Writing Task 1',      hint: 'Chart/diagram → <strong>' },
                  { value: 'task2',    label: '📝 Writing Task 2',      hint: 'Essay → <strong><em>' },
                ] as { value: string; label: string; hint: string }[]).map(opt => (
                  <span
                    key={opt.value}
                    title={opt.hint}
                    className="rounded-lg border border-violet-200 dark:border-violet-700 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2.5 py-1 text-[11px] font-bold cursor-default"
                  >
                    {opt.label}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-violet-500 dark:text-violet-400 mb-2">
                ☝️ Hệ thống <strong>tự nhận diện</strong> loại passage. Nếu là <strong>Reading</strong>, hãy paste đoạn văn vào ô HTML bên dưới trực tiếp — không cần qua Auto-format.
              </p>

              <textarea
                rows={4}
                value={rawPassage}
                placeholder={`Paste plain text vào đây, ví dụ:\n\nYou should spend about 20 minutes on this task.\nThe first chart below shows how energy is used in an average Australian household.\nSummarise the information by selecting and reporting the main features.\n\n→ Nhấn "Auto-format HTML" hoặc cứ nhấn Lưu — hệ thống tự format.`}
                onChange={(e) => setRawPassage(e.target.value)}
                className="w-full rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-violet-400 resize-y leading-relaxed"
                spellCheck={false}
              />

              {/* Status hints */}
              {rawPassage.trim() && !form.passage?.trim() && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-2">
                  <Sparkles size={12} className="text-amber-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Text sẽ tự động format HTML khi bấm Lưu — hoặc nhấn Auto-format để xem trước ngay.
                  </span>
                </div>
              )}
              {form.passage?.trim() && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 px-3 py-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    ✅ Đã có HTML ({(form.passage ?? '').length} ký tự) — sẽ gửi khi submit.
                  </span>
                </div>
              )}

              <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                <span className="bg-violet-100 dark:bg-violet-900/30 rounded px-1.5 py-0.5">Task 1 (chart/diagram) → <code className="font-mono">&lt;strong&gt;</code> + ảnh từ Audio URL</span>
                <span className="bg-violet-100 dark:bg-violet-900/30 rounded px-1.5 py-0.5">Task 2 (essay ?) → <code className="font-mono">&lt;strong&gt;&lt;em&gt;</code></span>
                <span className="bg-violet-100 dark:bg-violet-900/30 rounded px-1.5 py-0.5">Speaking ([Why?]/bullet) → heading + <code className="font-mono">&lt;ul&gt;&lt;li&gt;</code> in đậm</span>
                <span className="bg-violet-100 dark:bg-violet-900/30 rounded px-1.5 py-0.5">📖 Reading → paste thẳng vào ô HTML bên dưới</span>
              </div>
            </div>

            {/* Bước 2: Chỉnh sửa HTML hoặc xem preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bước 2 — HTML (chỉnh sửa hoặc paste trực tiếp)
                </span>
                {form.passage && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, passage: '' }))}
                    className="text-[10px] text-slate-400 hover:text-red-500 transition font-medium">
                    Xóa
                  </button>
                )}
              </div>

              {passagePreview && isPassageHtml ? (
                <div className="bg-white dark:bg-slate-900 p-4 min-h-[120px] max-h-[400px] overflow-y-auto prose prose-sm max-w-none dark:prose-invert text-sm">
                  {form.passage
                    ? <div dangerouslySetInnerHTML={{ __html: form.passage }} />
                    : <p className="text-slate-400 italic text-xs">Chưa có nội dung...</p>
                  }
                </div>
              ) : (
                <textarea
                  rows={7}
                  value={form.passage ?? ''}
                  placeholder='<div class="writing-task">...\nHoặc paste HTML từ CSV vào đây'
                  onChange={(e) => { setForm(f => ({ ...f, passage: e.target.value })); setPassagePreview(false); }}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-900 resize-y font-mono leading-relaxed"
                  spellCheck={false}
                />
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Info size={10} />
              Hỗ trợ HTML đầy đủ: &lt;p&gt;, &lt;div&gt;, &lt;table&gt;, &lt;ul&gt;, &lt;img&gt;, style=&quot;...&quot; — Xem preview để kiểm tra trước khi lưu.
            </p>
          </div>

          {/* Cue Card */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              📌 Cue Card <span className="font-normal text-slate-400">(Speaking Part 2 — plain text)</span>
            </label>
            <textarea rows={3} value={form.cueCard ?? ''} placeholder="Describe a place you have visited. You should say:&#10;- Where it is&#10;- When you went there&#10;- What you did"
              onChange={(e) => setForm(f => ({ ...f, cueCard: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Sample Answer */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              ✏️ Sample Answer <span className="font-normal text-slate-400">(Writing/Speaking — model answer)</span>
            </label>
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
    questionType: 'FILL_IN_THE_BLANK',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.correctAnswer.trim()) { toast.error('Vui lòng nhập đáp án đúng'); return; }

    const payload: AdminCreateQuestionRequest = {
      questionNumber: form.questionNumber,
      questionType: form.questionType,
      questionText: form.questionText || undefined,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation || undefined,
      options: form.questionType === 'MULTIPLE_CHOICE'
        ? form.options
            .map((opt, i) => opt.trim() ? `${LABELS[i]}. ${opt.trim()}` : null)
            .filter(Boolean) as string[]
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
  const isTFNG = form.questionType === 'TRUE_FALSE_NOT_GIVEN';
  const isYNNG = form.questionType === 'YES_NO_NOT_GIVEN';
  const LABELS = ['A', 'B', 'C', 'D'];
  const qTypeMeta = QUESTION_TYPES.find(t => t.value === form.questionType);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-slate-800 dark:text-white">➕ Thêm Câu hỏi mới</h3>
            {qTypeMeta && (
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${qTypeMeta.color}`}>
                {qTypeMeta.shortLabel}
              </span>
            )}
          </div>
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

          {/* Type hint */}
          {(isTFNG || isYNNG) && (
            <div className={`rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${isTFNG ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/30' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/30'}`}>
              <Info size={13} className="shrink-0" />
              {isTFNG
                ? 'Đây là loại câu hỏi theo đoạn văn. Nội dung câu hỏi có thể để trống nếu đã nằm trong passage.'
                : 'Yes/No/Not Given — dùng cho câu hỏi về quan điểm/ý kiến của tác giả.'}
            </div>
          )}
          {form.questionType === 'FILL_IN_THE_BLANK' && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-4 py-2.5 text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Info size={13} className="shrink-0" />
              Câu hỏi điền vào chỗ trống. Nội dung có thể trống nếu đáp án được đánh dấu trực tiếp trong passage.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Nội dung câu hỏi <span className="font-normal text-slate-400">(tùy chọn với Fill/T-F/Y-N)</span>
            </label>
            <textarea rows={3} value={form.questionText} placeholder="Nhập nội dung câu hỏi... (để trống nếu câu hỏi đã nằm trong passage)"
              onChange={(e) => setForm(f => ({ ...f, questionText: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Multiple Choice Options */}
          {needsOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Các lựa chọn *</label>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 rounded px-2 py-0.5">
                  💾 Lưu dạng: <code className="font-mono">["A. text", "B. text", ...]</code>
                </span>
              </div>
              <div className="space-y-2">
                {form.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="flex h-7 w-16 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {LABELS[oi]}.
                    </span>
                    <input type="text" value={opt} placeholder={`Nội dung lựa chọn ${LABELS[oi]} (VD: at the front counter.)`}
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
              <div className="flex gap-2 flex-wrap">
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
            ) : isTFNG ? (
              <div className="flex gap-2 flex-wrap">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map((v) => (
                  <button key={v} type="button"
                    onClick={() => setForm(f => ({ ...f, correctAnswer: v }))}
                    className={`rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition ${form.correctAnswer === v
                      ? 'border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300 dark:border-slate-600'
                    }`}
                  >{v}</button>
                ))}
              </div>
            ) : isYNNG ? (
              <div className="flex gap-2 flex-wrap">
                {['YES', 'NO', 'NOT GIVEN'].map((v) => (
                  <button key={v} type="button"
                    onClick={() => setForm(f => ({ ...f, correctAnswer: v }))}
                    className={`rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition ${form.correctAnswer === v
                      ? 'border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-900/50'
                      : 'border-slate-200 text-slate-500 hover:border-orange-300 dark:border-slate-600'
                    }`}
                  >{v}</button>
                ))}
              </div>
            ) : (
              <div>
                <input type="text" required value={form.correctAnswer}
                  placeholder="VD: LONDON   /   NOT GIVEN   /   A BIRTHDAY PARTY   /   2008"
                  onChange={(e) => setForm(f => ({ ...f, correctAnswer: e.target.value.toUpperCase() }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 font-mono uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info size={10} /> Tự động UPPERCASE — khớp với định dạng CSV (SYLVIA, ENGLAND, 26 JULY, 100000...)
                </p>
              </div>
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
interface CreateTestFormProps { onCancel: () => void; onSuccess: (newId: number) => void; }
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

  const DURATION_PRESETS: Record<BEExamType, number> = {
    LISTENING: 40,
    READING: 60,
    WRITING: 60,
    SPEAKING: 15,
    IELTS: 165,
  };

  const handleTypeChange = (type: BEExamType) => {
    setForm(f => ({ ...f, examType: type, durationMinutes: String(DURATION_PRESETS[type] ?? 60) }));
  };

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
        toast.success('Tạo bài thi thành công! Hãy thêm sections và câu hỏi.');
        onSuccess(res.data!.id);
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Bước 1/2 — Thông tin cơ bản. Sau khi tạo sẽ chuyển sang thêm Sections & Câu hỏi.</p>
        </div>
      </div>

      {/* Workflow guide */}
      <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-4 mb-5 flex gap-3 items-start">
        <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-700 dark:text-indigo-300">
          <p className="font-black mb-1">📋 Quy trình tạo đề thi:</p>
          <ol className="list-decimal list-inside space-y-0.5 font-medium">
            <li>Tạo đề thi (thông tin cơ bản)</li>
            <li>Thêm Sections (mỗi section có audio/passage/cue card)</li>
            <li>Thêm câu hỏi vào từng section (Fill in Blank / MC / T-F-NG / Y-N-NG)</li>
          </ol>
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
                  onChange={(e) => handleTypeChange(e.target.value as BEExamType)}
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
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Gợi ý: Listen=40p, Read=60p, Write=60p, Speak=15p
                </p>
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
              <textarea rows={2} value={form.description} placeholder="Mô tả bài thi..."
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
                {loading ? 'Đang xử lý...' : <><Plus size={14} /> Tạo & Thêm Sections →</>}
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
                        {section.questions.map((q: TestQuestionDTO) => {
                          const qtMeta = QUESTION_TYPES.find(t => t.value === q.questionType);
                          return (
                          <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300">
                              {q.questionNumber}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200 max-w-[300px]">
                              <p className="truncate">{q.questionText || <span className="italic text-slate-400">—</span>}</p>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${qtMeta?.color ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {qtMeta?.shortLabel ?? q.questionType}
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
                          );
                        })}
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
              onSuccess={(newId: number) => {
                queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
                setSelectedId(newId);
                setView('detail');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
