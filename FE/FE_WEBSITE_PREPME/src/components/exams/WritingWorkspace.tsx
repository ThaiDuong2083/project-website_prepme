import React from 'react';

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
        className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none focus:border-blue-300 resize-none "
      />
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
        <span>Số từ: {wordCount} từ</span>
        <span>Đề xuất: tối thiểu 250 từ</span>
      </div>
    </div>
  );
};
