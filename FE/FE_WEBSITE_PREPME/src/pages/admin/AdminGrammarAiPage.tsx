import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, Trash2, RefreshCw, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { grammarApi, type AiGrammarQuestionDTO, type GrammarTopicCategory } from '@api/grammar.api';
import { Card, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

// ─── Inline editable cell ───────────────────────────────────────────────────
function EditableCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <textarea
        autoFocus
        className="w-full rounded border border-indigo-400 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none resize-none"
        value={value ?? ''}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
      />
    );
  }
  return (
    <span
      className="block cursor-pointer rounded px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="italic text-slate-400">—</span>}
    </span>
  );
}

export const AdminGrammarAiPage = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<AiGrammarQuestionDTO[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: topicsRes } = useQuery({
    queryKey: ['grammar-ai-topics'],
    queryFn: () => grammarApi.getAiTopics(),
  });
  const topics: GrammarTopicCategory[] = topicsRes?.data ?? [];

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value) || null;
    setSelectedTopicId(id);
    setGeneratedQuestions([]);
    const topic = topics.find((t) => t.id === id);
    if (topic && !prompt) {
      setPrompt(`Tạo 20 câu hỏi trắc nghiệm ngữ pháp tiếng Anh về chủ đề "${topic.name}". Mỗi câu có 4 lựa chọn A, B, C, D với 1 đáp án đúng, có giải thích và bản dịch tiếng Việt.`);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopicId) {
      toast.error('Vui lòng chọn chủ đề trước khi generate.');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập prompt.');
      return;
    }
    setIsGenerating(true);
    setGeneratedQuestions([]);
    try {
      const res = await grammarApi.aiGenerate({ prompt: prompt.trim(), topicId: selectedTopicId });
      if (res.data && res.data.length > 0) {
        setGeneratedQuestions(res.data.map((q) => ({ ...q, topicId: selectedTopicId })));
        toast.success(`✨ AI đã tạo ${res.data.length} câu hỏi ngữ pháp!`);
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
    if (!selectedTopicId || generatedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      const res = await grammarApi.aiSave({ questions: generatedQuestions, topicId: selectedTopicId });
      toast.success(`✅ Đã lưu ${res.data?.savedCount ?? generatedQuestions.length} câu hỏi vào database!`);
      setGeneratedQuestions([]);
      setPrompt('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRow = (idx: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof AiGrammarQuestionDTO, value: string | string[]) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = value;
        return { ...q, options: newOpts };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Grammar Question Generator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dùng AI để tự động sinh câu hỏi ngữ pháp theo chủ đề, sau đó lưu vào database.
          </p>
        </div>
      </motion.div>

      {/* Step 1: Configure */}
      <Card>
        <CardBody className="space-y-4 p-5">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-900 dark:text-emerald-300">1</span>
            Chọn chủ đề ngữ pháp & Nhập prompt
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Chủ đề ngữ pháp <span className="text-red-500">*</span>
            </label>
            <div className="relative max-w-sm">
              <select
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={selectedTopicId ?? ''}
                onChange={handleTopicChange}
              >
                <option value="">-- Chọn chủ đề ngữ pháp --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Prompt cho AI <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={`Ví dụ: Tạo 20 câu hỏi trắc nghiệm về "Câu điều kiện" với 4 lựa chọn A/B/C/D...`}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={!selectedTopicId || !prompt.trim() || isGenerating}
            leftIcon={<Sparkles className="h-4 w-4" />}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? 'Đang tạo...' : 'Generate với AI'}
          </Button>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-950/40"
            >
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Gemini đang sinh câu hỏi...</p>
                <p className="text-xs text-emerald-500 dark:text-emerald-400">Quá trình này có thể mất 20–60 giây.</p>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {/* Step 2: Preview & Edit */}
      {generatedQuestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-900 dark:text-emerald-300">2</span>
                  Xem trước & Chỉnh sửa
                  <Badge className="ml-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                    {generatedQuestions.length} câu
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
                Click vào ô bất kỳ để chỉnh sửa trực tiếp.
              </p>

              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <button
                        className="ml-auto rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDeleteRow(idx)}
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Question text */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Câu hỏi</p>
                      <EditableCell
                        value={q.questionText}
                        onChange={(v) => updateQuestion(idx, 'questionText', v)}
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Lựa chọn</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options ?? []).map((opt, optIdx) => (
                          <div key={optIdx} className={`rounded-lg border px-3 py-2 text-xs ${opt === q.answer
                              ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-slate-700'
                            }`}>
                            <EditableCell
                              value={opt}
                              onChange={(v) => updateOption(idx, optIdx, v)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Answer */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide">Đáp án đúng</p>
                        <select
                          className="w-full rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-200 px-2 py-1 text-xs outline-none cursor-pointer"
                          value={q.answer}
                          onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                        >
                          {(q.options ?? []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Explanation & Translation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Giải thích (EN)</p>
                        <EditableCell
                          value={q.explanation}
                          onChange={(v) => updateQuestion(idx, 'explanation', v)}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Bản dịch (VI)</p>
                        <EditableCell
                          value={q.translation}
                          onChange={(v) => updateQuestion(idx, 'translation', v)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-900 dark:text-emerald-300 mr-1.5">3</span>
                  Xác nhận và lưu vào database
                </p>
                <Button
                  variant="success"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  {isSaving ? 'Đang lưu...' : `Lưu ${generatedQuestions.length} câu hỏi`}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
