-- SQL Seed Script for IELTS Exams System
-- Database: PostgreSQL

-- 1. Clear existing exam data to avoid conflicts (Optional, run with caution)
-- TRUNCATE TABLE test_questions CASCADE;
-- TRUNCATE TABLE test_sections CASCADE;
-- TRUNCATE TABLE tests CASCADE;

-- ─── 1. LISTENING EXAM (ID: 1) ────────────────────────────────────────────────
INSERT INTO tests (id, title, exam_type, duration, audio_url, description, is_deleted, created_at)
VALUES (
  1, 
  'Cambridge 18 Academic Listening Test 1', 
  'LISTENING', 
  1800, 
  'https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3', 
  'Official Cambridge 18 Practice Listening Test 1. Standard IELTS audio player and 40 fill-in-the-blank questions.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_sections (id, test_id, section_number, title, is_deleted, created_at)
VALUES (
  1, 
  1, 
  1, 
  'Part 1: Inquiry about Hotel Booking', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES 
(
  1, 
  1, 
  1, 
  'FILL_IN_THE_BLANK', 
  'Name of client: John _____', 
  NULL, 
  'Smith', 
  'The speaker clearly spells out S-M-I-T-H.', 
  false, 
  NOW()
),
(
  2, 
  1, 
  2, 
  'MULTIPLE_CHOICE', 
  'The room requested is:', 
  '["A. Double room", "B. Single room", "C. Twin room"]', 
  'B', 
  'He mentions he wants a single room since he is travelling alone.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;


-- ─── 2. READING EXAM (ID: 2) ──────────────────────────────────────────────────
INSERT INTO tests (id, title, exam_type, duration, description, is_deleted, created_at)
VALUES (
  2, 
  'Cambridge 18 Academic Reading Test 1', 
  'READING', 
  3600, 
  'Official Cambridge 18 Practice Reading Test 1. Contains 3 passages with matching headings and true/false/not given.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES (
  2, 
  2, 
  1, 
  'Passage 1: The Rise of Forest Bathing', 
  '<div><p>Forest bathing, or Shinrin-yoku, is a practice that originated in Japan in the 1980s. It involves spending quiet, mindful time in a forest, absorbing the atmosphere through the senses. Scientific research shows that this practice reduces stress hormones, lowers blood pressure, and improves immune function.</p></div>', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES 
(
  3, 
  2, 
  1, 
  'TRUE_FALSE_NOT_GIVEN', 
  'Forest bathing was first developed in the United States.', 
  NULL, 
  'FALSE', 
  'The passage states that it originated in Japan in the 1980s.', 
  false, 
  NOW()
),
(
  4, 
  2, 
  2, 
  'TRUE_FALSE_NOT_GIVEN', 
  'Scientific evidence supports the physiological benefits of Shinrin-yoku.', 
  NULL, 
  'TRUE', 
  'The passage states scientific research shows reductions in stress, blood pressure, and immune improvements.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;


-- ─── 3. WRITING EXAM (ID: 3) ──────────────────────────────────────────────────
INSERT INTO tests (id, title, exam_type, duration, description, is_deleted, created_at)
VALUES (
  3, 
  'IELTS Practice Academic Writing Test 1', 
  'WRITING', 
  3600, 
  'Writing mock exam. Consists of Task 1 (Bar Chart description) and Task 2 (Essay writing).', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES 
(
  3, 
  3, 
  1, 
  'Task 1: Describe the Bar Chart', 
  'The chart below shows the percentage of households with internet access in different countries between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', 
  false, 
  NOW()
),
(
  4, 
  3, 
  2, 
  'Task 2: Essay Writing', 
  'Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your opinion. Write at least 250 words.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;


-- ─── 4. SPEAKING EXAM (ID: 4) ─────────────────────────────────────────────────
INSERT INTO tests (id, title, exam_type, duration, description, is_deleted, created_at)
VALUES (
  4, 
  'IELTS Speaking Mock Test 1', 
  'SPEAKING', 
  900, 
  'Standard IELTS Speaking exam structure including Part 1 introduction, Part 2 cue card description, and Part 3 discussion.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_sections (id, test_id, section_number, title, passage, cue_card, is_deleted, created_at)
VALUES 
(
  5, 
  4, 
  1, 
  'Part 1: Introduction & Interview', 
  'Let''s talk about your hometown. Where is your hometown? What do you like most about it?', 
  NULL, 
  false, 
  NOW()
),
(
  6, 
  4, 
  2, 
  'Part 2: Cue Card', 
  NULL, 
  'Describe a book you read recently that you found interesting. You should say: \n- What book it is \n- When you read it \n- What it is about \n- And explain why you found it interesting.', 
  false, 
  NOW()
),
(
  7, 
  4, 
  3, 
  'Part 3: Discussion', 
  'Let''s discuss reading habits. Do you think electronic books will completely replace paper books in the future? Why?', 
  NULL, 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;


-- ─── 5. COMPOSITE IELTS EXAM PACKAGE (ID: 5) ──────────────────────────────────
INSERT INTO tests (id, title, exam_type, duration, description, is_deleted, created_at)
VALUES (
  5, 
  'IELTS Academic Practice Exam Volume 1 (Full Test)', 
  'IELTS', 
  9900, 
  'Composite exam including all 4 skills: Listening, Reading, Writing, and Speaking.', 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sub-tests matching composite exam
INSERT INTO tests (id, title, exam_type, duration, parent_test_id, is_deleted, created_at)
VALUES 
(
  6, 
  'Listening Subtest (IELTS Vol 1)', 
  'LISTENING', 
  1800, 
  5, 
  false, 
  NOW()
),
(
  7, 
  'Reading Subtest (IELTS Vol 1)', 
  'READING', 
  3600, 
  5, 
  false, 
  NOW()
),
(
  8, 
  'Writing Subtest (IELTS Vol 1)', 
  'WRITING', 
  3600, 
  5, 
  false, 
  NOW()
),
(
  9, 
  'Speaking Subtest (IELTS Vol 1)', 
  'SPEAKING', 
  900, 
  5, 
  false, 
  NOW()
) ON CONFLICT (id) DO NOTHING;


-- ─── 6. AUTO-INCREMENT ALIGNMENT ─────────────────────────────────────────────
SELECT setval(pg_get_serial_sequence('tests', 'id'), coalesce(max(id), 1) + 1) FROM tests;
SELECT setval(pg_get_serial_sequence('test_sections', 'id'), coalesce(max(id), 1) + 1) FROM test_sections;
SELECT setval(pg_get_serial_sequence('test_questions', 'id'), coalesce(max(id), 1) + 1) FROM test_questions;
