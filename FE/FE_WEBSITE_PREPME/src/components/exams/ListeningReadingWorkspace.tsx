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
        <div className="text-xs font-bold text-pink-500 tracking-wider">
          PHẦN {section.sectionNumber || activeSectionIdx + 1}
        </div>

        {section.questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm "
          >
            <div className="flex items-start gap-2">
              <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-pink-600">
                Câu {q.questionNumber}
              </span>
              <div className="text-xs text-slate-700 ">
                {q.questionText}
              </div>
            </div>

            {/* Question Types */}
            {q.questionType === 'MULTIPLE_CHOICE' && q.options && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {q.options.map((option) => {
                  const firstChar = option.trim().charAt(0); // A, B, C, D
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
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                        answers[q.id] === optionVal
                          ? 'border-pink-500 bg-pink-50 text-pink-600'
                          : 'border-slate-100 hover:bg-slate-50 '
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {q.questionType === 'TRUE_FALSE_NOT_GIVEN' && (
              <div className="mt-3 flex gap-2">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: val }))
                    }
                    className={`flex-1 rounded-xl border py-1.5 text-center text-xs font-bold transition ${
                      answers[q.id] === val
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-slate-100 hover:bg-slate-50 '
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {q.questionType !== 'MULTIPLE_CHOICE' &&
              q.questionType !== 'TRUE_FALSE_NOT_GIVEN' && (
                <input
                  type="text"
                  placeholder="Điền câu trả lời..."
                  value={answers[q.id] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-pink-300 "
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
};
