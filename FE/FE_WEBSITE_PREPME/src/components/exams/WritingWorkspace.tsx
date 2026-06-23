import React from 'react';
import { useAppStore } from '@store/app.store';

interface WritingWorkspaceProps {
  activeSectionIdx: number;
  writingAnswers: Record<number, string>;
  setWritingAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

export const WritingWorkspace: React.FC<WritingWorkspaceProps> = ({
  activeSectionIdx,
  writingAnswers,
  setWritingAnswers,
}) => {
  const currentAnswer = writingAnswers[activeSectionIdx] || '';
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase">
          Bài viết của bạn (Phần {activeSectionIdx + 1})
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Tự động lưu tạm nháp khi soạn thảo cho từng phần riêng biệt.
        </p>
      </div>
      <textarea
        value={currentAnswer}
        onChange={(e) =>
          setWritingAnswers((prev) => ({
            ...prev,
            [activeSectionIdx]: e.target.value,
          }))
        }
        placeholder={`Hãy nhập bài luận của bạn cho Phần ${activeSectionIdx + 1} tại đây (Essay Content)...`}
        className={`flex-1 rounded-2xl border p-4 text-sm outline-none resize-none ${
          isDark
            ? 'border-slate-800 bg-slate-900 text-slate-200 focus:border-blue-700'
            : 'border-slate-200 bg-white text-slate-700 focus:border-blue-300'
        }`}
      />
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
        <span>Số từ: {wordCount} từ</span>
        <span>Đề xuất: tối thiểu 250 từ</span>
      </div>
    </div>
  );
};
