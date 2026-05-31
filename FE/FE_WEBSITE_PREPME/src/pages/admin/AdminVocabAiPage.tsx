import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, Trash2, RefreshCw, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { vocabularyApi, type VocabularyWordDTO, type CategoryDTO } from '@api/vocabulary.api';
import { Card, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

// ─── Inline editable cell ───────────────────────────────────────────────────
function EditableCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        autoFocus
        className="w-full rounded border border-indigo-400 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
      />
    );
  }
  return (
    <span
      className="block cursor-pointer rounded px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs text-slate-700 dark:text-slate-200"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="italic text-slate-400">—</span>}
    </span>
  );
}

// ─── Level badge colors ──────────────────────────────────────────────────────

export const AdminVocabAiPage = () => {
  // ── Category selection state ─────────────────────────────────────────────
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedWords, setGeneratedWords] = useState<VocabularyWordDTO[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Load vocab sets ──────────────────────────────────────────────────────
  const { data: setsRes } = useQuery({
    queryKey: ['vocab-sets'],
    queryFn: () => vocabularyApi.getVocabSets(),
  });
  const sets: CategoryDTO[] = setsRes?.data ?? [];

  // ── Load topics when a set is selected ──────────────────────────────────
  const { data: topicsRes } = useQuery({
    queryKey: ['vocab-topics', selectedSetId],
    queryFn: () => vocabularyApi.getTopics(selectedSetId!),
    enabled: !!selectedSetId,
  });
  const topics: CategoryDTO[] = topicsRes?.data ?? [];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value) || null;
    setSelectedSetId(id);
    setSelectedTopicId(null);
    setGeneratedWords([]);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value) || null;
    setSelectedTopicId(id);
    setGeneratedWords([]);
    // Auto-fill prompt hint
    const topic = topics.find((t) => t.id === id);
    if (topic && !prompt) {
      setPrompt(`Tạo 40 từ vựng liên quan đến chủ đề "${topic.name}"`);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopicId) {
      toast.error('Vui lòng chọn chủ đề (topic) trước khi generate.');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập prompt.');
      return;
    }
    setIsGenerating(true);
    setGeneratedWords([]);
    try {
      const res = await vocabularyApi.aiGenerate({ prompt: prompt.trim(), categoryId: selectedTopicId });
      if (res.data && res.data.length > 0) {
        setGeneratedWords(res.data.map((w) => ({ ...w, categoryId: selectedTopicId })));
        toast.success(`✨ AI đã tạo ${res.data.length} từ vựng!`);
      } else {
        toast.error('AI không trả về dữ liệu. Thử lại.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gọi AI';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTopicId || generatedWords.length === 0) return;
    setIsSaving(true);
    try {
      const res = await vocabularyApi.aiSave({ words: generatedWords, categoryId: selectedTopicId });
      toast.success(`✅ Đã lưu ${res.data?.savedCount ?? generatedWords.length} từ vựng vào database!`);
      setGeneratedWords([]);
      setPrompt('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRow = (idx: number) => {
    setGeneratedWords((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateWord = (idx: number, field: keyof VocabularyWordDTO, value: string) => {
    setGeneratedWords((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, [field]: value } : w))
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Vocabulary Generator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dùng AI để tự động sinh từ vựng theo chủ đề, sau đó lưu vào database.
          </p>
        </div>
      </motion.div>

      {/* Step 1: Configure */}
      <Card>
        <CardBody className="space-y-4 p-5">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">1</span>
            Chọn danh mục & Nhập prompt
          </h2>

          {/* Select set + topic */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Bộ từ vựng (Set)
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  value={selectedSetId ?? ''}
                  onChange={handleSetChange}
                >
                  <option value="">-- Chọn bộ từ vựng --</option>
                  {sets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Chủ đề (Topic) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  value={selectedTopicId ?? ''}
                  onChange={handleTopicChange}
                  disabled={!selectedSetId}
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Prompt textarea */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Prompt cho AI <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={`Ví dụ: Tạo 40 từ vựng liên quan đến chủ đề "Project Management" với các mức độ khác nhau (BEGINNER, INTERMEDIATE, ADVANCED).`}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              Gợi ý: Chỉ định rõ số lượng, chủ đề và mức độ từ vựng bạn muốn.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={!selectedTopicId || !prompt.trim() || isGenerating}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            {isGenerating ? 'Đang tạo...' : 'Generate với AI'}
          </Button>

          {/* Gemini thinking indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-700 dark:bg-indigo-950/40"
            >
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Gemini đang sinh từ vựng...
                </p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400">
                  Quá trình này có thể mất 20–60 giây. Vui lòng không đóng trang.
                </p>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {/* Step 2: Preview & Edit */}
      {generatedWords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">2</span>
                  Xem trước & Chỉnh sửa
                  <Badge className="ml-1 bg-indigo-500/15 text-indigo-500 text-xs">
                    {generatedWords.length} từ
                  </Badge>
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                  >
                    Tạo lại
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<Save className="h-3.5 w-3.5" />}
                    onClick={handleSave}
                    isLoading={isSaving}
                  >
                    Lưu vào Database
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click vào ô bất kỳ để chỉnh sửa trực tiếp. Nhấn Enter hoặc click ra ngoài để xác nhận.
              </p>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      {['#', 'Word', 'Type', 'Pronunciation', 'Meaning (VI)', 'Example EN', 'Example VI', 'Level', ''].map(
                        (h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {generatedWords.map((w, idx) => (
                        <tr
                        key={idx}
                        className="bg-white hover:bg-indigo-50/60 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-8 font-medium">{idx + 1}</td>
                        <td className="px-3 py-2 min-w-[110px] font-bold text-slate-900 dark:text-white">
                          <EditableCell value={w.word} onChange={(v) => updateWord(idx, 'word', v)} />
                        </td>
                        <td className="px-3 py-2 min-w-[70px] text-slate-700 dark:text-slate-300 italic">
                          <EditableCell value={w.wordType} onChange={(v) => updateWord(idx, 'wordType', v)} />
                        </td>
                        <td className="px-3 py-2 min-w-[120px] text-violet-700 dark:text-violet-300 font-mono text-[11px]">
                          <EditableCell value={w.pronunciation} onChange={(v) => updateWord(idx, 'pronunciation', v)} />
                        </td>
                        <td className="px-3 py-2 min-w-[140px] text-slate-800 dark:text-slate-200 font-medium">
                          <EditableCell value={w.meaning} onChange={(v) => updateWord(idx, 'meaning', v)} />
                        </td>
                        <td className="px-3 py-2 min-w-[200px] text-slate-700 dark:text-slate-300">
                          <EditableCell value={w.exampleEn} onChange={(v) => updateWord(idx, 'exampleEn', v)} />
                        </td>
                        <td className="px-3 py-2 min-w-[200px] text-slate-600 dark:text-slate-400">
                          <EditableCell value={w.exampleVi} onChange={(v) => updateWord(idx, 'exampleVi', v)} />
                        </td>
                        <td className="px-3 py-2 min-w-[130px]">
                          <select
                            className={`rounded-lg border-2 px-2 py-1 text-xs font-bold outline-none cursor-pointer w-full
                              ${w.level === 'BEGINNER'
                                ? 'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-400'
                                : w.level === 'INTERMEDIATE'
                                ? 'border-amber-500 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-400'
                                : 'border-rose-500 bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-400'
                              }`}
                            value={w.level ?? 'BEGINNER'}
                            onChange={(e) => updateWord(idx, 'level', e.target.value as VocabularyWordDTO['level'])}
                          >
                            <option value="BEGINNER">🟢 BEGINNER</option>
                            <option value="INTERMEDIATE">🟡 INTERMEDIATE</option>
                            <option value="ADVANCED">🔴 ADVANCED</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => handleDeleteRow(idx)}
                            title="Xóa dòng này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Step 3 Save button bottom */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300 inline-flex mr-1.5">3</span>
                  Xác nhận và lưu vào database
                </p>
                <Button
                  variant="success"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  {isSaving ? 'Đang lưu...' : `Lưu ${generatedWords.length} từ vựng`}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
