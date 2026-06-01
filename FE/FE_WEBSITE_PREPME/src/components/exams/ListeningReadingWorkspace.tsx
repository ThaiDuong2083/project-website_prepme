import React from 'react';
import type { TestDetailDTO } from '@types';

interface ListeningReadingWorkspaceProps {
  examDetail: TestDetailDTO;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeSectionIdx: number;
}

export const ListeningReadingWorkspace: React.FC<ListeningReadingWorkspaceProps> = ({
  examDetail,
  answers,
  setAnswers,
  activeSectionIdx,
}) => {
  const section = examDetail.sections[activeSectionIdx];
  if (!section) return null;

  return (
    <div className="space-y-6">
      <div key={section.id} className="space-y-4">
        <div className="text-xs font-bold text-pink-500 tracking-wider uppercase">
          PHẦN {section.sectionNumber || activeSectionIdx + 1}
        </div>

        {section.questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-pink-600 border border-rose-100/50">
                Câu {q.questionNumber}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {q.questionType === 'MULTIPLE_CHOICE'
                  ? 'Chọn đáp án'
                  : q.questionType === 'TRUE_FALSE_NOT_GIVEN'
                  ? 'True/False/NG'
                  : q.questionType === 'YES_NO_NOT_GIVEN'
                  ? 'Yes/No/NG'
                  : 'Nhập đáp án'}
              </span>
            </div>

            {q.imageUrl && (
              <div className="mt-1 rounded-xl overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-1">
                <img
                  src={q.imageUrl}
                  alt={`Minh họa câu ${q.questionNumber}`}
                  className="max-h-[200px] object-contain rounded-lg"
                />
              </div>
            )}

            {/* Answer Inputs */}
            {q.questionType === 'MULTIPLE_CHOICE' && q.options && (
              <div className="flex flex-wrap gap-2 mt-1">
                {q.options.map((option) => {
                  const firstChar = option.trim().charAt(0);
                  const optionVal = firstChar.toUpperCase();
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: optionVal,
                        }))
                      }
                      className={`h-9 w-9 rounded-full border text-xs font-black transition-all flex items-center justify-center ${
                        answers[q.id] === optionVal
                          ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {optionVal}
                    </button>
                  );
                })}
              </div>
            )}

            {q.questionType === 'TRUE_FALSE_NOT_GIVEN' && (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: val }))
                    }
                    className={`rounded-xl border py-2 text-center text-[10px] font-black uppercase tracking-wider transition ${
                      answers[q.id] === val
                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {q.questionType === 'YES_NO_NOT_GIVEN' && (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['YES', 'NO', 'NOT GIVEN'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: val }))
                    }
                    className={`rounded-xl border py-2 text-center text-[10px] font-black uppercase tracking-wider transition ${
                      answers[q.id] === val
                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {q.questionType !== 'MULTIPLE_CHOICE' &&
              q.questionType !== 'TRUE_FALSE_NOT_GIVEN' &&
              q.questionType !== 'YES_NO_NOT_GIVEN' && (
                <input
                  type="text"
                  placeholder="Điền đáp án..."
                  value={answers[q.id] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-[#fffdfa] px-3.5 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-pink-300 focus:bg-white focus:shadow-inner"
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
};
