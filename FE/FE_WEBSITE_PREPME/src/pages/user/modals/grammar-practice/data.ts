export interface GrammarTopic {
  id: number;
  name: string;
  done: number;
  total: number;
}

export interface QuestionHistory {
  id: number;
  questionText: string;
  done: number;
  correct: number;
  accuracy: number;
  recentChoices: string[];
}

export interface PracticeQuestion {
  id: number;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  translation: string;
  vocabulary: { word: string; meaning: string }[];
}

export const MOCK_TOPICS: GrammarTopic[] = [
  { id: 1, name: 'Từ loại', done: 22, total: 78 },
  { id: 2, name: 'Đại từ', done: 0, total: 62 },
  { id: 3, name: 'Động từ', done: 1, total: 113 },
  { id: 4, name: 'Câu điều kiện', done: 0, total: 13 },
  { id: 5, name: 'Giới từ', done: 0, total: 35 },
  { id: 6, name: 'Liên từ', done: 0, total: 31 },
  { id: 7, name: 'So sánh', done: 1, total: 5 },
  { id: 8, name: 'Từ vựng', done: 2, total: 107 },
  { id: 9, name: 'Cơ bản', done: 16, total: 180 },
  { id: 10, name: '600+', done: 7, total: 134 },
];

export const MOCK_PROGRESS: (GrammarTopic & { accuracy: number; questions: QuestionHistory[] })[] = [
  {
    id: 8, name: 'Từ vựng', done: 2, total: 107, accuracy: 0,
    questions: [
      { id: 1, questionText: 'Through decades of research, Dr. Carter has become the leading___ on natural pain relief techniques.', done: 1, correct: 0, accuracy: 0, recentChoices: ['experts'] },
      { id: 2, questionText: 'If you have ordered more than two items, be aware they may arrive in separate ___.', done: 1, correct: 0, accuracy: 0, recentChoices: ['sequences'] },
    ],
  },
  { id: 9, name: 'Cơ bản', done: 16, total: 180, accuracy: 19, questions: [] },
  { id: 10, name: '600+', done: 7, total: 134, accuracy: 0, questions: [] },
  { id: 11, name: '800+', done: 0, total: 55, accuracy: 0, questions: [] },
];

export const MOCK_QUESTION: PracticeQuestion = {
  id: 1,
  text: 'The March shipment to Busan can fit an ___ thirteen containers.',
  options: ['additional', 'addition', 'adding', 'additionally'],
  answer: 'additional',
  explanation: 'Ta có cấu trúc cực kỳ phổ biến trong TOEIC: an additional + [Số lượng] + Noun số nhiều. Chữ "additional" (tính từ) đứng trước số đếm để bổ nghĩa cho tổng thể cụm đó.',
  translation: 'Chuyến hàng tháng 3 đến Busan có thể chứa thêm 13 container nữa.',
  vocabulary: [
    { word: 'shipment (n)', meaning: 'chuyến hàng' },
    { word: 'container (n)', meaning: 'thùng đựng hàng' },
  ],
};
