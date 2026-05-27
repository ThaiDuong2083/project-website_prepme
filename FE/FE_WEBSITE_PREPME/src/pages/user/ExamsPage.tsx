import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 ChevronLeft,
 ChevronRight,
 Search,
 Play,
 Clock,
 FileText,
 Volume2,
 Mic,
 Award,
 History,
 CheckCircle,
 AlertCircle,
 HelpCircle,
 Upload,
 BookOpen,
 Check,
 X,
 Database,
 ArrowLeft,
 Square,
 RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@store/app.store';
import { examsApi } from '@api/exams.api';
import { practiceHistoryApi } from '@api/practice-history.api';
import { filesApi } from '@api/files.api';
import type {
 TestListDTO,
 TestDetailDTO,
 TestQuestionDTO,
 TestSectionDTO,
 PracticeHistoryDTO,
 PracticeStatisticsDTO,
 BEExamType,
 QuestionType,
} from '@types';

const BRAND = {
 50: '#fff1f2',
 100: '#ffe4e6',
 200: '#fecdd3',
 300: '#fda4af',
 400: '#fb7185',
 500: '#f43f5e',
 600: '#e11d48',
 700: '#be123c',
};

const EXAM_TYPES: { value: BEExamType | 'ALL'; label: string; emoji: string }[] = [
 { value: 'ALL', label: 'Tất cả', emoji: '🌟' },
 { value: 'LISTENING', label: 'Listening', emoji: '🎧' },
 { value: 'READING', label: 'Reading', emoji: '📚' },
 { value: 'WRITING', label: 'Writing', emoji: '📝' },
 { value: 'SPEAKING', label: 'Speaking', emoji: '🎤' },
 { value: 'IELTS', label: 'Full IELTS', emoji: '🏆' },
];

export const ExamsPage = () => {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  // Navigation View State
  const [view, setView] = useState<'LIST' | 'TAKING' | 'RESULT'>('LIST');

 // Exam List & Stats State
 const [exams, setExams] = useState<TestListDTO[]>([]);
 const [activeType, setActiveType] = useState<BEExamType | 'ALL'>('ALL');
 const [search, setSearch] = useState('');
 const [localSearch, setLocalSearch] = useState('');
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [loadingExams, setLoadingExams] = useState(false);
 const [listTab, setListTab] = useState<'EXAMS' | 'HISTORY'>('EXAMS');

 // History & Statistics State
 const [historyList, setHistoryList] = useState<PracticeHistoryDTO[]>([]);
 const [historyPage, setHistoryPage] = useState(1);
 const [historyTotalPages, setHistoryTotalPages] = useState(1);
 const [historyType, setHistoryType] = useState<BEExamType | 'ALL'>('ALL');
 const [loadingHistory, setLoadingHistory] = useState(false);
 const [statistics, setStatistics] = useState<PracticeStatisticsDTO | null>(null);

 // Active Exam Practice State
 const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
 const [examDetail, setExamDetail] = useState<TestDetailDTO | null>(null);
 const [loadingDetail, setLoadingDetail] = useState(false);
 const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> userAnswer
 const [essayContent, setEssayContent] = useState<string>(''); // For Writing
 const [speakingFile, setSpeakingFile] = useState<Blob | null>(null); // For Speaking recording
 const [speakingUrl, setSpeakingUrl] = useState<string>(''); // Cloudinary voice URL
 const [speakingLocalUrl, setSpeakingLocalUrl] = useState<string>(''); // Local blob URL for preview
 const [timeLeft, setTimeLeft] = useState(0); // in seconds
 const [timerRunning, setTimerRunning] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [activeSectionIdx, setActiveSectionIdx] = useState(0);

 // Audio Recorder Ref
 const [isRecording, setIsRecording] = useState(false);
 const [recordingDuration, setRecordingDuration] = useState(0);
 const mediaRecorderRef = useRef<MediaRecorder | null>(null);
 const recordingIntervalRef = useRef<number | null>(null);
 const audioChunksRef = useRef<Blob[]>([]);

 // Detailed Practice Review State
 const [reviewId, setReviewId] = useState<number | null>(null);
 const [reviewDetail, setReviewDetail] = useState<PracticeHistoryDTO | null>(null);
 const [loadingReview, setLoadingReview] = useState(false);

 // Load Exam List & Stats
 useEffect(() => {
 if (view === 'LIST') {
 fetchExams();
 fetchStatistics();
 if (listTab === 'HISTORY') {
 fetchHistory();
 }
 }
 }, [view, activeType, search, currentPage, listTab, historyPage, historyType]);

 const fetchExams = async () => {
 try {
 setLoadingExams(true);
 const params = {
 type: activeType === 'ALL' ? undefined : activeType,
 search: search.trim() || undefined,
 page: currentPage - 1,
 size: 8,
 };
 const res = await examsApi.getAll(params);
 if ((res.code === 200 || res.code === 201) && res.data) {
 setExams(res.data.content);
 setTotalPages(res.data.pagination.totalPages);
 }
 } catch (err) {
 console.error(err);
 toast.error('Không thể tải danh sách đề thi.');
 } finally {
 setLoadingExams(false);
 }
 };

 const fetchStatistics = async () => {
 try {
 const res = await practiceHistoryApi.getStatistics();
 if ((res.code === 200 || res.code === 201) && res.data) {
 setStatistics(res.data);
 }
 } catch (err) {
 console.error(err);
 }
 };

 const fetchHistory = async () => {
 try {
 setLoadingHistory(true);
 const params = {
 skillType: historyType === 'ALL' ? undefined : historyType,
 page: historyPage - 1,
 size: 8,
 };
 const res = await practiceHistoryApi.getAll(params);
 if ((res.code === 200 || res.code === 201) && res.data) {
 setHistoryList(res.data.content);
 setHistoryTotalPages(res.data.pagination.totalPages);
 }
 } catch (err) {
 console.error(err);
 toast.error('Không thể tải lịch sử làm bài.');
 } finally {
 setLoadingHistory(false);
 }
 };

 // Seed Helper
 const handleSeed = async () => {
 const loader = toast.loading('Đang khởi tạo dữ liệu mẫu...');
 try {
 const res = await examsApi.seedDemoExams();
 if (res.code === 200 || res.code === 201) {
 toast.success('Khởi tạo dữ liệu mẫu thành công!', { id: loader });
 fetchExams();
 } else {
 toast.error('Không thể khởi tạo dữ liệu.', { id: loader });
 }
 } catch (err) {
 console.error(err);
 toast.error('Có lỗi xảy ra khi khởi tạo.', { id: loader });
 }
 };

 // Start Exam
 const handleStartExam = async (examId: number) => {
 try {
 setLoadingDetail(true);
 const res = await examsApi.getById(examId);
 if ((res.code === 200 || res.code === 201) && res.data) {
 setExamDetail(res.data);
 setSelectedExamId(examId);
 setAnswers({});
 setEssayContent('');
 setSpeakingFile(null);
 setSpeakingUrl('');
 setSpeakingLocalUrl('');
 setTimeLeft(res.data.duration || 3600);
 setTimerRunning(true);
 setActiveSectionIdx(0);
 setView('TAKING');
 }
 } catch (err) {
 console.error(err);
 toast.error('Không thể tải chi tiết đề thi.');
 } finally {
 setLoadingDetail(false);
 }
 };

 // Timer Countdown Logic
 useEffect(() => {
 let timer: number;
 if (timerRunning && timeLeft > 0) {
 timer = window.setInterval(() => {
 setTimeLeft((prev) => {
 if (prev <= 1) {
 setTimerRunning(false);
 clearInterval(timer);
 toast.error('Đã hết thời gian làm bài! Bài làm sẽ tự động nộp.');
 triggerSubmit(true);
 return 0;
 }
 if (prev === 300) {
 toast.error('Còn 5 phút! Hãy nhanh chóng hoàn thành bài làm.');
 }
 return prev - 1;
 });
 }, 1000);
 }
 return () => clearInterval(timer);
 }, [timerRunning, timeLeft]);

 // Speaking Recording Functions
 const startRecording = async () => {
 audioChunksRef.current = [];
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 const mediaRecorder = new MediaRecorder(stream);
 mediaRecorderRef.current = mediaRecorder;

 mediaRecorder.ondataavailable = (event) => {
 if (event.data.size > 0) {
 audioChunksRef.current.push(event.data);
 }
 };

 mediaRecorder.onstop = () => {
 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
 setSpeakingFile(audioBlob);
 setSpeakingLocalUrl(URL.createObjectURL(audioBlob));
 stream.getTracks().forEach((track) => track.stop());
 };

 mediaRecorder.start();
 setIsRecording(true);
 setRecordingDuration(0);
 recordingIntervalRef.current = window.setInterval(() => {
 setRecordingDuration((d) => d + 1);
 }, 1000);
 toast.success('Bắt đầu ghi âm...');
 } catch (err) {
 console.error(err);
 toast.error('Không thể kết nối mic. Vui lòng cho phép quyền ghi âm.');
 }
 };

 const stopRecording = () => {
 if (mediaRecorderRef.current && isRecording) {
 mediaRecorderRef.current.stop();
 setIsRecording(false);
 if (recordingIntervalRef.current) {
 clearInterval(recordingIntervalRef.current);
 }
 toast.success('Đã dừng ghi âm.');
 }
 };

 // Submit Practice
 const handleSubmitClick = () => {
 // Check if unanswered questions exist
 if (!examDetail) return;
 const unansweredCount = getUnansweredCount();
 if (unansweredCount > 0) {
 if (
 !window.confirm(
 `Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
 )
 ) {
 return;
 }
 } else {
 if (!window.confirm('Bạn có chắc chắn muốn nộp bài làm?')) {
 return;
 }
 }
 triggerSubmit(false);
 };

 const getUnansweredCount = (): number => {
 if (!examDetail) return 0;
 if (examDetail.examType === 'WRITING') {
 return essayContent.trim().length === 0 ? 1 : 0;
 }
 if (examDetail.examType === 'SPEAKING') {
 return !speakingFile ? 1 : 0;
 }

 let count = 0;
 examDetail.sections.forEach((section) => {
 section.questions.forEach((q) => {
 if (!answers[q.id] || !answers[q.id].trim()) {
 count++;
 }
 });
 });
 return count;
 };

 const triggerSubmit = async (isTimeUp = false) => {
 if (!selectedExamId || !examDetail) return;
 setTimerRunning(false);
 setSubmitting(true);
 const submissionId = toast.loading('Đang xử lý nộp bài...');

 try {
 let finalRecordingUrl = '';
 // 1. Upload speaking audio first if applicable
 if (examDetail.examType === 'SPEAKING' && speakingFile) {
 toast.loading('Đang tải tệp ghi âm lên hệ thống...', { id: submissionId });
 const fileToUpload = new File([speakingFile], 'speaking_attempt.webm', {
 type: 'audio/webm',
 });
 const uploadRes = await filesApi.upload(fileToUpload);
 if ((uploadRes.code === 200 || uploadRes.code === 201) && uploadRes.data) {
 finalRecordingUrl = uploadRes.data.url;
 }
 }

 // 2. Build submit payload
 const timeSpent = (examDetail.duration || 3600) - timeLeft;
 const payload = {
 answers,
 submissionContent: examDetail.examType === 'WRITING' ? essayContent : undefined,
 recordingUrl: examDetail.examType === 'SPEAKING' ? finalRecordingUrl : undefined,
 completionTime: timeSpent,
 status: 'COMPLETED' as const,
 };

 const res = await examsApi.submit(selectedExamId, payload);
 if ((res.code === 200 || res.code === 201) && res.data) {
 toast.success('Nộp bài thi thành công!', { id: submissionId });
 // Transition to results screen
 handleOpenReview(res.data.id);
 } else {
 toast.error('Nộp bài thất bại.', { id: submissionId });
 }
 } catch (err) {
 console.error(err);
 toast.error('Có lỗi xảy ra khi nộp bài làm.', { id: submissionId });
 } finally {
 setSubmitting(false);
 }
 };

 // Open detailed result review page
 const handleOpenReview = async (historyId: number) => {
 try {
 setLoadingReview(true);
 setView('RESULT');
 setReviewId(historyId);
 const res = await practiceHistoryApi.getById(historyId);
 if ((res.code === 200 || res.code === 201) && res.data) {
 setReviewDetail(res.data);
 }
 } catch (err) {
 console.error(err);
 toast.error('Không thể tải kết quả chi tiết.');
 } finally {
 setLoadingReview(false);
 }
 };

 // Helpers to format seconds to MM:SS
 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 };

  return (
    <div className={`min-h-screen px-4 py-12 ${isDark ? '' : 'bg-gradient-to-br from-[#fff5f6] via-white to-[#fff9fa]'}`}>
      <div className="mx-auto max-w-[1200px]">
        <AnimatePresence mode="wait">
          {/* ────────────────── VIEW 1: EXAM LIST & STATS ────────────────── */}
          {view === 'LIST' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={`w-full max-w-[950px] mx-auto border rounded-[32px] shadow-xl p-8 space-y-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-rose-100/70'}`}
            >
              {/* Header */}
              <div className={`relative flex flex-col items-center pb-4 border-b ${isDark ? 'border-slate-700' : 'border-rose-50'}`}>
                <button
                  onClick={() => window.history.back()}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition active:scale-95 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-rose-50/50 text-rose-500 hover:bg-rose-100'}`}
                >
                  <ChevronLeft size={20} />
                </button>
 <h2 className="text-2xl font-black text-rose-500 tracking-tight ">
 Chinh phục IELTS Full Test
 </h2>
 <p className="text-xs font-semibold text-slate-400 mt-1 ">
 Luyện đề thi thật & chấm điểm tự động
 </p>

 {/* Seed Helper on Right */}
                <button
                  onClick={handleSeed}
                  title="Khởi tạo bộ đề mẫu"
                  className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition active:scale-95 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-rose-50/50 text-rose-500 hover:bg-rose-100'}`}
                >
                  <Database size={16} />
                </button>
              </div>

              {/* Tab Selector: Exams vs History */}
              <div className={`flex justify-center gap-8 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-rose-50'}`}>
 <button
 onClick={() => setListTab('EXAMS')}
 className={`pb-1 text-sm font-black transition-all relative ${
 listTab === 'EXAMS'
 ? 'text-rose-500'
 : 'text-slate-400 hover:text-slate-600 '
 }`}
 >
 Danh sách đề thi
 {listTab === 'EXAMS' && (
 <motion.div
 layoutId="activeTabIndicator"
 className="absolute -bottom-[15px] left-0 right-0 h-0.5 bg-rose-500 rounded-full"
 />
 )}
 </button>
 <button
 onClick={() => setListTab('HISTORY')}
 className={`pb-1 text-sm font-black transition-all relative ${
 listTab === 'HISTORY'
 ? 'text-rose-500'
 : 'text-slate-400 hover:text-slate-600 '
 }`}
 >
 Lịch sử luyện tập
 {listTab === 'HISTORY' && (
 <motion.div
 layoutId="activeTabIndicator"
 className="absolute -bottom-[15px] left-0 right-0 h-0.5 bg-rose-500 rounded-full"
 />
 )}
 </button>
 </div>

 {/* List Tab 1: Available Exams */}
 {listTab === 'EXAMS' && (
 <div className="space-y-6">
 {/* Search Section */}
 <div className="flex gap-3 max-w-[650px] mx-auto mb-6">
 <div className="relative flex-1">
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
 <input
 type="text"
 placeholder="Tìm kiếm bộ đề..."
 value={localSearch}
 onChange={(e) => setLocalSearch(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 setSearch(localSearch);
 setCurrentPage(1);
 }
 }}
                      className={`w-full rounded-full border py-3 pl-11 pr-4 text-sm outline-none shadow-inner ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-rose-500' : 'bg-[#fffdfb] border-rose-100 text-slate-700 placeholder-rose-200 focus:border-rose-300'}`}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSearch(localSearch);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full border px-8 text-sm font-extrabold transition active:scale-95 shadow-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-rose-200 text-rose-500 hover:bg-rose-50/50'}`}
                  >
 Tìm
 </button>
 </div>

                {/* Skill Sub-tabs / Categories */}
                <div className={`relative border-b pb-2 ${isDark ? 'border-slate-700' : 'border-rose-100'}`}>
 <div className="flex gap-6 overflow-x-auto no-scrollbar pb-1">
 {EXAM_TYPES.map((type) => {
 const isActive = activeType === type.value;
 return (
 <button
 key={type.value}
 onClick={() => {
 setActiveType(type.value);
 setCurrentPage(1);
 }}
 className={`relative pb-3 text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${
 isActive
 ? 'text-rose-500'
 : 'text-slate-400 hover:text-slate-600 '
 }`}
 >
 {type.label} ({
 type.value === 'ALL' ? 9 :
 type.value === 'LISTENING' ? 2 :
 type.value === 'READING' ? 2 :
 type.value === 'WRITING' ? 2 :
 type.value === 'SPEAKING' ? 2 : 1
 })
 {isActive && (
 <motion.div
 layoutId="activeSkillUnderline"
 className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full"
 />
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* Exam Cards Grid */}
 {loadingExams ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {Array.from({ length: 4 }).map((_, i) => (
 <div
 key={i}
                      className={`h-44 rounded-[24px] border p-6 shadow-sm animate-pulse ${isDark ? 'bg-slate-700/50 border-slate-700' : 'bg-white border-rose-100/50'}`}
                    >
                      <div className={`h-5 w-2/3 rounded-full ${isDark ? 'bg-slate-600' : 'bg-rose-50/50'}`} />
                      <div className={`mt-3 h-4 w-1/3 rounded-full ${isDark ? 'bg-slate-600/50' : 'bg-rose-50/30'}`} />
                      <div className={`mt-6 h-9 w-full rounded-xl ${isDark ? 'bg-slate-600/30' : 'bg-rose-50/20'}`} />
                    </div>
                  ))}
                </div>
              ) : exams.length === 0 ? (
                <div className={`rounded-[24px] border border-dashed py-16 text-center ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-rose-200 bg-rose-50/10'}`}>
                  <FileText size={40} className={`mx-auto ${isDark ? 'text-slate-500' : 'text-rose-300'}`} />
                  <h3 className={`mt-4 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-rose-600'}`}>
 Không tìm thấy đề thi
 </h3>
 <p className="mt-1 text-xs text-slate-400">
 Vui lòng thử bộ lọc khác hoặc nhấn biểu tượng CSDL để khởi tạo bộ đề.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {exams.map((exam, index) => {
 const attempts = historyList.filter((h) => h.testId === exam.id);
 const hasAttempted = attempts.length > 0;
 const maxScore = hasAttempted ? Math.max(...attempts.map((a) => a.score ?? 0)) : 0;
 const questionCount = exam.examType === 'LISTENING' || exam.examType === 'READING' ? 40 : exam.examType === 'WRITING' ? 2 : 3;

                      return (
                        <motion.div
                          key={exam.id}
                          whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(244,63,94,0.06)' }}
                          className={`flex flex-col justify-between rounded-[24px] border p-6 shadow-sm ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-white border-rose-100/70'}`}
                        >
                          <div>
                            <h3 className={`text-base font-black leading-snug ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                              Test {index + 1}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5 line-clamp-1 ">
                              {exam.title}
                            </p>

 <div className="mt-4 flex items-center gap-6 text-xs text-slate-400 font-semibold ">
 <div className="flex items-center gap-1.5">
 <FileText size={14} className="text-rose-400" />
 <span>{questionCount} câu</span>
 </div>
 <div className="flex items-center gap-1.5">
 <Clock size={14} className="text-rose-400" />
 <span>{Math.round(exam.duration / 60)} phút</span>
 </div>
 </div>

                              <div className="mt-3 text-xs font-semibold text-slate-400 ">
                                {hasAttempted ? (
                                  <span className="text-emerald-500 font-bold ">
                                    Đã làm (Band {maxScore.toFixed(1)})
                                  </span>
                                ) : (
                                  <span>Chưa làm</span>
                                )}
                              </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition flex-1 active:scale-95 ${isDark ? 'bg-slate-800 border-slate-600 text-rose-400 hover:bg-slate-700' : 'bg-white border-rose-200 text-rose-500 hover:bg-rose-50/50'}`}
                              >
                                <Play size={12} className={isDark ? 'text-rose-400' : 'text-rose-500'} />
                                Luyện thi
                              </button>
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition flex-1 active:scale-95 ${isDark ? 'bg-slate-800 border-slate-600 text-rose-400 hover:bg-slate-700' : 'bg-white border-rose-200 text-rose-500 hover:bg-rose-50/50'}`}
                              >
                                <BookOpen size={12} className={isDark ? 'text-rose-400' : 'text-rose-500'} />
                                Luyện tập
                              </button>
                            </div>
 </motion.div>
 );
 })}
 </div>
 )}

 {/* Exam Pagination */}
 {totalPages > 1 && (
 <div className="mt-8 flex justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => c - 1)}
                    className={`rounded-lg border p-2 transition disabled:opacity-50 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="flex items-center text-xs text-slate-500">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className={`rounded-lg border p-2 transition disabled:opacity-50 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
 <ChevronRight size={16} />
 </button>
 </div>
 )}
 </div>
 )}


 {/* List Tab 2: Practice History */}
 {listTab === 'HISTORY' && (
 <div className="space-y-6">
 <div className="flex flex-wrap gap-2">
 {EXAM_TYPES.map((type) => (
 <button
 key={type.value}
 onClick={() => {
 setHistoryType(type.value);
 setHistoryPage(1);
 }}
 className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                        historyType === type.value
                          ? 'bg-pink-500 text-white'
                          : (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')
                      }`}
                    >
                      {type.emoji} {type.label}
                    </button>
                  ))}
                </div>

                {loadingHistory ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`skeleton h-16 w-full rounded-xl ${isDark ? 'bg-slate-700' : ''}`}
                      />
                    ))}
                  </div>
                ) : historyList.length === 0 ? (
                  <div className={`rounded-2xl border border-dashed py-16 text-center ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200'}`}>
                    <History size={40} className={`mx-auto ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                    <h3 className={`mt-4 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
 Chưa có lịch sử làm bài
 </h3>
 <p className="mt-1 text-xs text-slate-400">
 Hãy chọn một đề thi và bắt đầu thực hiện bài luyện tập đầu tiên nhé.
 </p>
 </div>
 ) : (
                    <div className={`divide-y rounded-2xl border p-4 shadow-sm ${isDark ? 'divide-slate-700 border-slate-700 bg-slate-800' : 'divide-slate-100 border-slate-100 bg-white'}`}>
                      {historyList.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase"
                                style={{
                                  backgroundColor: isDark ? 'rgba(244, 63, 94, 0.15)' : '#fdf2f8',
                                  color: isDark ? '#fb7185' : BRAND[500],
                                }}
                              >
                                {record.skillType}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h4 className={`mt-1 text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {record.testTitle}
                            </h4>
                            <div className="mt-1 text-xs text-slate-400">
                              Thời gian hoàn thành:{' '}
                              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {Math.round((record.completionTime || 0) / 60)} phút
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {record.score !== null ? (
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-semibold">
                                  Band
                                </span>
                                <span className="text-lg font-black text-pink-600">
                                  {(record.score ?? 0).toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className={`rounded px-2.5 py-1 text-xs font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-400'}`}>
                                Đã nộp
                              </span>
                            )}

                            <button
                              onClick={() => handleOpenReview(record.id)}
                              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${isDark ? 'bg-slate-700 border-slate-600 text-rose-400 hover:bg-slate-600' : 'bg-white border-pink-200 text-pink-500 hover:bg-pink-50'}`}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* History Pagination */}
                  {historyTotalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage((c) => c - 1)}
                        className={`rounded-lg border p-2 transition disabled:opacity-50 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="flex items-center text-xs text-slate-500">
                        Trang {historyPage} / {historyTotalPages}
                      </span>
                      <button
                        disabled={historyPage === historyTotalPages}
                        onClick={() => setHistoryPage((c) => c + 1)}
                        className={`rounded-lg border p-2 transition disabled:opacity-50 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
 )}
 </div>
 )}
 </motion.div>
 )}

 {/* ────────────────── VIEW 2: EXAM TAKING VIEW ────────────────── */}
 {view === 'TAKING' && examDetail && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="flex flex-col h-screen max-w-full fixed inset-0 z-[100] bg-[#faf6ee] p-4"
 >
 {/* Split screen Header */}
 <div className="flex items-center justify-between border-b border-rose-100 bg-[#fffdfa] px-6 py-4 shadow-sm ">
 <div className="flex items-center gap-4">
 <button
 onClick={() => {
 if (
 window.confirm(
 'Bạn có chắc chắn muốn hủy thi? Mọi tiến trình làm bài của bạn sẽ mất.',
 )
 ) {
 setView('LIST');
 setTimerRunning(false);
 }
 }}
 className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition"
 >
 <ArrowLeft size={18} />
 </button>
 <div>
 <span className="inline-block rounded bg-pink-100 px-2 py-0.5 text-[9px] font-extrabold text-pink-600 uppercase">
 {examDetail.examType}
 </span>
 <h2 className="text-base font-black text-slate-800 leading-tight">
 {examDetail.title}
 </h2>
 </div>
 </div>

 {/* Header Timer */}
 <div className="flex items-center gap-6">
 <div
 className={`flex items-center gap-2 rounded-2xl border px-5 py-2 font-black shadow-sm transition ${
 timeLeft <= 300
 ? 'border-red-200 bg-red-50 text-red-600 animate-pulse'
 : 'border-rose-200 bg-rose-50/50 text-rose-600'
 }`}
 >
 <Clock size={16} />
 <span className="text-sm tracking-widest">{formatTime(timeLeft)}</span>
 </div>

 <button
 onClick={handleSubmitClick}
 disabled={submitting}
 className="rounded-2xl bg-pink-500 px-6 py-2.5 text-xs font-black text-white hover:bg-pink-600 transition active:scale-95 shadow-md disabled:opacity-50"
 >
 {submitting ? 'Đang nộp...' : 'Nộp bài'}
 </button>
 </div>
 </div>

 {/* Split Screen Dual-Pane Area */}
 <div className="flex-1 flex overflow-hidden min-h-0 mt-4 gap-4">
 {/* Left Pane: Audio/Passages/Prompts */}
 <div className="flex-1 rounded-3xl border border-rose-100/50 bg-[#fffdfa] p-6 shadow-sm overflow-y-auto ">
 {/* For Listening Section: Custom Audio Player */}
 {examDetail.examType === 'LISTENING' && examDetail.audioUrl && (
 <div className="mb-6 rounded-2xl bg-rose-50/40 p-4 border border-rose-100/30 flex items-center gap-4">
 <Volume2 size={24} className="text-pink-500" />
 <audio
 src={examDetail.audioUrl}
 controls
 className="w-full"
 />
 </div>
 )}

 {/* Render sections if exists */}
 {examDetail.sections && examDetail.sections.length > 0 ? (
 <div>
 {/* Section tab headers */}
 {examDetail.sections.length > 1 && (
 <div className="mb-4 flex gap-2 border-b border-rose-50 pb-2">
 {examDetail.sections.map((sec, idx) => (
 <button
 key={sec.id}
 onClick={() => setActiveSectionIdx(idx)}
 className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
 activeSectionIdx === idx
 ? 'bg-pink-100 text-pink-600'
 : 'text-slate-400 hover:text-slate-600'
 }`}
 >
 Phần {sec.sectionNumber || idx + 1}
 </button>
 ))}
 </div>
 )}

 {/* Section Content */}
 {(() => {
 const activeSec = examDetail.sections[activeSectionIdx];
 if (!activeSec) return null;
 return (
 <div className="space-y-4">
 {activeSec.title && (
 <h3 className="text-lg font-black text-slate-800 ">
 {activeSec.title}
 </h3>
 )}

 {activeSec.passage && (
 <div
 className="prose max-w-none text-sm text-slate-600 leading-relaxed"
 dangerouslySetInnerHTML={{ __html: activeSec.passage }}
 />
 )}

 {activeSec.cueCard && (
 <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 ">
 <h4 className="text-sm font-extrabold text-amber-800 mb-3">
 📌 Cue Card Topic:
 </h4>
 <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 ">
 {activeSec.cueCard}
 </pre>
 </div>
 )}
 </div>
 );
 })()}
 </div>
 ) : (
 <div className="flex h-full items-center justify-center text-slate-400">
 Không có thông tin mô tả cho đề thi này.
 </div>
 )}
 </div>

 {/* Right Pane: Question Input Forms */}
 <div className="w-[500px] flex flex-col rounded-3xl border border-rose-100/50 bg-[#fffdfa] shadow-sm overflow-hidden ">
 <div className="bg-slate-50 px-5 py-3 border-b border-rose-50/40 text-xs font-bold text-slate-600 ">
 📒 CÂU HỎI & TRẢ LỜI
 </div>

 <div className="flex-1 overflow-y-auto p-6">
 {/* WRITING WORKSPACE */}
 {examDetail.examType === 'WRITING' ? (
 <div className="flex flex-col h-full space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase">
 Bài viết của bạn
 </label>
 <p className="text-[10px] text-slate-400 mt-0.5">
 Tự động lưu tạm nháp khi soạn thảo.
 </p>
 </div>
 <textarea
 value={essayContent}
 onChange={(e) => setEssayContent(e.target.value)}
 placeholder="Hãy nhập bài luận của bạn tại đây (Essay Content)..."
 className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none focus:border-pink-300 resize-none "
 />
 <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
 <span>Số từ: {essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0} từ</span>
 <span>Đề xuất: tối thiểu 250 từ</span>
 </div>
 </div>
 ) : examDetail.examType === 'SPEAKING' ? (
 /* SPEAKING WORKSPACE */
 <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
 <div className="rounded-full bg-rose-50 p-6 border border-rose-100">
 {isRecording ? (
 <motion.div
 animate={{ scale: [1, 1.15, 1] }}
 transition={{ repeat: Infinity, duration: 1.5 }}
 className="rounded-full bg-red-500 p-6 text-white cursor-pointer"
 onClick={stopRecording}
 >
 <Square size={32} fill="white" />
 </motion.div>
 ) : (
 <button
 onClick={startRecording}
 className="rounded-full bg-pink-500 p-6 text-white hover:bg-pink-600 transition active:scale-95 cursor-pointer"
 >
 <Mic size={32} fill="white" />
 </button>
 )}
 </div>

 <div>
 <h4 className="text-sm font-bold text-slate-800 ">
 {isRecording ? 'Đang ghi âm...' : 'Sẵn sàng ghi âm'}
 </h4>
 <p className="text-xs text-slate-400 mt-1">
 {isRecording
 ? `Độ dài: ${formatTime(recordingDuration)}`
 : 'Nhấn vào mic để bắt đầu trả lời bằng giọng nói'}
 </p>
 </div>

 {/* Wave Equalizer Animation (simulated) */}
 {isRecording && (
 <div className="flex items-center gap-1 h-8">
 {Array.from({ length: 8 }).map((_, i) => (
 <motion.div
 key={i}
 animate={{ height: [8, Math.random() * 24 + 8, 8] }}
 transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
 className="w-1 bg-red-400 rounded-full"
 />
 ))}
 </div>
 )}

 {/* Playback preview */}
 {speakingLocalUrl && !isRecording && (
 <div className="w-full border border-rose-100 bg-rose-50/20 p-4 rounded-2xl">
 <span className="text-[10px] font-bold text-slate-400 block mb-2">
 PREVIEW BẢN THU ÂM
 </span>
 <audio
 src={speakingLocalUrl}
 controls
 className="mx-auto w-full"
 />
 </div>
 )}
 </div>
 ) : (
 /* RECEPTIVE SKILLS QUESTION FORMS (LISTENING & READING) */
 <div className="space-y-6">
 {examDetail.sections.map((section, sIdx) => (
 <div key={section.id} className="space-y-4">
 <div className="text-xs font-bold text-pink-500 tracking-wider">
 PHẦN {section.sectionNumber || sIdx + 1}
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
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 )}

 {/* ────────────────── VIEW 3: PRACTICE REVIEW & RESULTS ────────────────── */}
 {view === 'RESULT' && (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 className="space-y-6"
 >
 {/* Back Header */}
 <div className="flex items-center gap-4">
 <button
 onClick={() => setView('LIST')}
 className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
 >
 <ArrowLeft size={14} />
 Quay lại danh sách
 </button>
 </div>

 {loadingReview ? (
 <div className="text-center py-16">
 <RefreshCw className="mx-auto text-pink-500 animate-spin" size={32} />
 <p className="mt-4 text-sm text-slate-500">Đang tải kết quả chi tiết...</p>
 </div>
 ) : reviewDetail ? (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Result Summary Sidebar */}
 <div className="space-y-6">
 {/* Score Card */}
 <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm text-center">
 <Award size={40} className="mx-auto text-pink-500" />
 <h3 className="mt-3 text-lg font-black text-slate-800 ">
 {reviewDetail.testTitle}
 </h3>
 <p className="text-xs text-slate-400 mt-1">
 Luyện tập ngày:{' '}
 {new Date(reviewDetail.createdAt).toLocaleDateString('vi-VN')}
 </p>

 <div className="my-6">
 <div className="text-xs text-slate-400 font-semibold uppercase">
 Điểm số của bạn
 </div>
 <div className="text-5xl font-black text-pink-600 mt-1">
 {reviewDetail.score !== null ? reviewDetail.score.toFixed(1) : '-'}
 </div>
 <div className="text-xs text-slate-400 mt-1">IELTS Band Score</div>
 </div>

 <div className="grid grid-cols-2 gap-3 border-t border-rose-50 pt-4 text-left">
 <div>
 <span className="text-[10px] text-slate-400 block">Kỹ năng</span>
 <span className="text-xs font-bold text-slate-700 ">
 {reviewDetail.skillType}
 </span>
 </div>
 <div>
 <span className="text-[10px] text-slate-400 block">Thời gian làm</span>
 <span className="text-xs font-bold text-slate-700 ">
 {Math.round((reviewDetail.completionTime || 0) / 60)} phút
 </span>
 </div>
 </div>
 </div>

 {/* AI Feedback Card */}
 {reviewDetail.aiAnalysis && (
 <div className="rounded-3xl border border-amber-200 bg-amber-50/20 p-6 ">
 <h4 className="flex items-center gap-2 text-sm font-black text-amber-800 mb-3">
 ⚡ Phân tích & Gợi ý từ AI:
 </h4>
 <div className="prose text-xs text-slate-600 leading-relaxed whitespace-pre-line">
 {reviewDetail.aiAnalysis}
 </div>
 </div>
 )}
 </div>

 {/* Question Review List */}
 <div className="lg:col-span-2 space-y-6">
 {/* For Writing / Speaking: show essay or recording */}
 {reviewDetail.skillType === 'WRITING' && (
 <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ">
 <h4 className="text-sm font-black text-slate-800 mb-3">
 Bài viết đã nộp:
 </h4>
 <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
 {reviewDetail.submissionContent}
 </div>
 </div>
 )}

 {reviewDetail.skillType === 'SPEAKING' && (
 <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ">
 <h4 className="text-sm font-black text-slate-800 mb-3">
 Bản thu âm đã nộp:
 </h4>
 {reviewDetail.recordingUrl ? (
 <audio
 src={reviewDetail.recordingUrl}
 controls
 className="w-full"
 />
 ) : (
 <p className="text-xs text-slate-400">Không tìm thấy bản thu âm.</p>
 )}
 </div>
 )}

 {/* For Reading / Listening: list questions, answers, corrected labels, and explanations */}
 {(reviewDetail.skillType === 'READING' ||
 reviewDetail.skillType === 'LISTENING') && (
 <div className="space-y-4">
 <h4 className="text-base font-black text-slate-800 ">
 Chi tiết từng câu hỏi:
 </h4>

 {/* We mock detail questions if backend does not load them directly inside reviewDetail.
 Wait! The backend PracticeHistoryDTO exposes `answers` as a Map.
 Let's query the original test if we want to display the full question cards.
 Wait, let's look at if we can display the matched items cleanly.
 Since we submitted, we can load the test detail for correct answers, or
 let's check: does practiceHistoryDetails show the questionText?
 Wait, in PracticeHistoryDTO on the backend:
 It returns answers, testTitle, score, skillType etc.
 But wait! How do we display the original questions alongside correct answers?
 Let's check if we can load the TestDetailDTO dynamically to overlay!
 Yes, when opening a review, we can fetch `examsApi.getById(reviewDetail.testId)`
 to overlay the question texts, options, explanations, and correct answers!
 Let's implement this overlay loader! */}

 {(() => {
 // Let's write a small custom fetcher to get exam details on the fly
 const [originalTest, setOriginalTest] = useState<TestDetailDTO | null>(null);
 useEffect(() => {
 if (reviewDetail?.testId) {
 examsApi.getById(reviewDetail.testId).then((res) => {
 if ((res.code === 200 || res.code === 201) && res.data) {
 setOriginalTest(res.data);
 }
 });
 }
 }, [reviewDetail?.testId]);

 if (!originalTest) {
 return (
 <div className="text-xs text-slate-400">
 Đang tải dữ liệu câu hỏi gốc...
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {originalTest.sections.map((section, sIdx) => (
 <div key={section.id} className="space-y-4">
 <div className="text-xs font-bold text-pink-500">
 PHẦN {section.sectionNumber || sIdx + 1}
 </div>

 {section.questions.map((q) => {
 const userAnswer = reviewDetail.answers?.[q.id.toString()] || reviewDetail.answers?.[q.questionNumber.toString()];
 const isCorrect =
 userAnswer &&
 q.correctAnswer &&
 userAnswer.trim().toLowerCase() ===
 q.correctAnswer.trim().toLowerCase();

 return (
 <div
 key={q.id}
 className={`rounded-2xl border p-4 shadow-sm transition ${
 isCorrect
 ? 'border-green-100 bg-green-50/20'
 : 'border-red-100 bg-red-50/20'
 }`}
 >
 <div className="flex items-start gap-2">
 <span
 className={`rounded px-2 py-0.5 text-xs font-bold ${
 isCorrect
 ? 'bg-green-100 text-green-600'
 : 'bg-red-100 text-red-600'
 }`}
 >
 Câu {q.questionNumber}
 </span>
 <div className="text-xs font-bold text-slate-700 ">
 {q.questionText}
 </div>
 </div>

 {/* Answer comparison details */}
 <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
 <div className="rounded-xl bg-white p-3 border border-slate-100 ">
 <span className="text-[10px] text-slate-400 block font-semibold">
 Đáp án của bạn
 </span>
 <span
 className={`font-bold mt-1 block ${
 isCorrect ? 'text-green-600' : 'text-red-500'
 }`}
 >
 {userAnswer || '(Không trả lời)'}
 {userAnswer &&
 (isCorrect ? (
 <Check
 size={14}
 className="inline ml-1"
 />
 ) : (
 <X size={14} className="inline ml-1" />
 ))}
 </span>
 </div>

 <div className="rounded-xl bg-white p-3 border border-slate-100 ">
 <span className="text-[10px] text-slate-400 block font-semibold">
 Đáp án đúng
 </span>
 <span className="font-bold text-green-600 mt-1 block">
 {q.correctAnswer}
 </span>
 </div>
 </div>

 {/* Explanation */}
 {q.explanation && (
 <div className="mt-3 border-t border-dashed border-slate-200/60 pt-3 text-xs text-slate-500 leading-relaxed">
 <span className="font-bold text-slate-600 ">
 Giải thích:{' '}
 </span>
 {q.explanation}
 </div>
 )}
 </div>
 );
 })}
 </div>
 ))}
 </div>
 );
 })()}
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="text-center py-16 text-slate-400">
 Không thể hiển thị kết quả. Vui lòng quay lại.
 </div>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
};
