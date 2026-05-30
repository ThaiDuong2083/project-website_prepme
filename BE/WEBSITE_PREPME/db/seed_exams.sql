-- SQL Seed Script for IELTS Exams System
-- Database: PostgreSQL

-- Clear existing exam data to avoid conflicts (Optional, run with caution)
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
  'Official Cambridge 18 Practice Listening Test 1. Standard IELTS audio player and 4 sections with 8 fill-in-the-blank and multiple choice questions.', 
  false, 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  exam_type = EXCLUDED.exam_type,
  duration = EXCLUDED.duration,
  audio_url = EXCLUDED.audio_url,
  description = EXCLUDED.description;

-- Listening Sections
INSERT INTO test_sections (id, test_id, section_number, title, is_deleted, created_at)
VALUES 
(1, 1, 1, 'Part 1: Inquiry about Hotel Booking', false, NOW()),
(2, 1, 2, 'Part 2: Local Tourist Information', false, NOW()),
(3, 1, 3, 'Part 3: Academic Discussion on Project', false, NOW()),
(4, 1, 4, 'Part 4: Lecture on Wildlife Conservation', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title;

-- Listening Questions
INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES 
(1, 1, 1, 'FILL_IN_THE_BLANK', 'Name of client: John _____', NULL, 'Smith', 'The speaker clearly spells out S-M-I-T-H.', false, NOW()),
(2, 1, 2, 'MULTIPLE_CHOICE', 'The room requested is:', '["A. Double room", "B. Single room", "C. Twin room"]', 'B', 'He mentions he wants a single room since he is travelling alone.', false, NOW()),
(3, 2, 3, 'MULTIPLE_CHOICE', 'What is the main attraction of the park?', '["A. The waterfall", "B. The historic bridge", "C. The botanical garden"]', 'A', 'The speaker mentions the waterfall attracts 90% of visitors.', false, NOW()),
(4, 2, 4, 'FILL_IN_THE_BLANK', 'The tourist office is located next to the _____', NULL, 'library', 'The guide says: "It is right next to the town library."', false, NOW()),
(5, 3, 5, 'MULTIPLE_CHOICE', 'The students agree that their project needs more:', '["A. Data analysis", "B. Background research", "C. Visual diagrams"]', 'B', 'Both agree that the literature review is too brief and needs more background research.', false, NOW()),
(6, 3, 6, 'FILL_IN_THE_BLANK', 'They will meet again on _____ afternoon.', NULL, 'Thursday', 'They schedule the next meeting for Thursday afternoon.', false, NOW()),
(7, 4, 7, 'FILL_IN_THE_BLANK', 'The primary threat to the animal population is habitat _____', NULL, 'loss', 'The lecturer mentions habitat loss due to agriculture.', false, NOW()),
(8, 4, 8, 'FILL_IN_THE_BLANK', 'Conservationists suggest building wildlife _____ to connect forests.', NULL, 'corridors', 'The speaker emphasizes wildlife corridors.', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  section_id = EXCLUDED.section_id,
  question_number = EXCLUDED.question_number,
  question_type = EXCLUDED.question_type,
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;


-- ─── 2. READING EXAM (ID: 2) ──────────────────────────────────────────────────
INSERT INTO tests (id, title, exam_type, duration, description, is_deleted, created_at)
VALUES (
  2, 
  'Cambridge 18 Academic Reading Test 1', 
  'READING', 
  3600, 
  'Official Cambridge 18 Practice Reading Test 1. Contains 3 passages with true/false/not given and multiple choice questions.', 
  false, 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  exam_type = EXCLUDED.exam_type,
  duration = EXCLUDED.duration,
  description = EXCLUDED.description;

-- Reading Sections
INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES 
(5, 2, 1, 'Passage 1: The Rise of Forest Bathing', '<div><p>Forest bathing, or Shinrin-yoku, is a practice that originated in Japan in the 1980s. It involves spending quiet, mindful time in a forest, absorbing the atmosphere through the senses. Scientific research shows that this practice reduces stress hormones, lowers blood pressure, and improves immune function.</p></div>', false, NOW()),
(6, 2, 2, 'Passage 2: The History of the Bicycle', '<div><p>The history of the bicycle is a story of innovation. The earliest bicycle-like vehicle was the Draisienne, invented by Karl von Drais in 1817. It had no pedals and was propelled by pushing one''s feet against the ground. The addition of pedals in the 1860s by French inventors marked a major turning point, leading to the ''boneshaker'' and later the penny-farthing bicycle.</p></div>', false, NOW()),
(7, 2, 3, 'Passage 3: The Psychology of Decision Making', '<div><p>Decision making is a complex cognitive process. Psychologist Daniel Kahneman describes two systems of thinking: System 1 is fast, automatic, and emotional, while System 2 is slow, deliberative, and logical. Most daily decisions are made using System 1, which relies on heuristics, while complex choices require the deliberate effort of System 2.</p></div>', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title,
  passage = EXCLUDED.passage;

-- Reading Questions
INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES 
(9, 5, 1, 'TRUE_FALSE_NOT_GIVEN', 'Forest bathing was first developed in the United States.', NULL, 'FALSE', 'The passage states that it originated in Japan in the 1980s.', false, NOW()),
(10, 5, 2, 'TRUE_FALSE_NOT_GIVEN', 'Scientific evidence supports the physiological benefits of Shinrin-yoku.', NULL, 'TRUE', 'The passage states scientific research shows reductions in stress, blood pressure, and immune improvements.', false, NOW()),
(11, 6, 3, 'TRUE_FALSE_NOT_GIVEN', 'The Draisienne bicycle had pedals.', NULL, 'FALSE', 'The text states the Draisienne had no pedals.', false, NOW()),
(12, 6, 4, 'MULTIPLE_CHOICE', 'Who invented the earliest bicycle-like vehicle?', '["A. Karl von Drais", "B. Pierre Michaux", "C. James Starley"]', 'A', 'Karl von Drais invented the Draisienne in 1817.', false, NOW()),
(13, 7, 5, 'TRUE_FALSE_NOT_GIVEN', 'System 2 thinking is faster than System 1 thinking.', NULL, 'FALSE', 'System 2 is described as slow, while System 1 is fast.', false, NOW()),
(14, 7, 6, 'FILL_IN_THE_BLANK', 'System 1 thinking relies on mental shortcuts called _____', NULL, 'heuristics', 'The passage states System 1 relies on heuristics.', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  section_id = EXCLUDED.section_id,
  question_number = EXCLUDED.question_number,
  question_type = EXCLUDED.question_type,
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;


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
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  exam_type = EXCLUDED.exam_type,
  duration = EXCLUDED.duration,
  description = EXCLUDED.description;

-- Writing Sections
INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES 
(8, 3, 1, 'Task 1: Describe the Bar Chart', 'The chart below shows the percentage of households with internet access in different countries between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', false, NOW()),
(9, 3, 2, 'Task 2: Essay Writing', 'Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your opinion. Write at least 250 words.', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title,
  passage = EXCLUDED.passage;


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
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  exam_type = EXCLUDED.exam_type,
  duration = EXCLUDED.duration,
  description = EXCLUDED.description;

-- Speaking Sections
INSERT INTO test_sections (id, test_id, section_number, title, passage, cue_card, is_deleted, created_at)
VALUES 
(10, 4, 1, 'Part 1: Introduction & Interview', 'Let''s talk about your hometown. Where is your hometown? What do you like most about it?', NULL, false, NOW()),
(11, 4, 2, 'Part 2: Cue Card', NULL, 'Describe a book you read recently that you found interesting. You should say: \n- What book it is \n- When you read it \n- What it is about \n- And explain why you found it interesting.', false, NOW()),
(12, 4, 3, 'Part 3: Discussion', 'Let''s discuss reading habits. Do you think electronic books will completely replace paper books in the future? Why?', NULL, false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title,
  passage = EXCLUDED.passage,
  cue_card = EXCLUDED.cue_card;


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
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  exam_type = EXCLUDED.exam_type,
  duration = EXCLUDED.duration,
  description = EXCLUDED.description;

-- Sub-tests matching composite exam
INSERT INTO tests (id, title, exam_type, duration, parent_test_id, is_deleted, created_at)
VALUES 
(6, 'Listening Subtest (IELTS Vol 1)', 'LISTENING', 1800, 5, false, NOW()),
(7, 'Reading Subtest (IELTS Vol 1)', 'READING', 3600, 5, false, NOW()),
(8, 'Writing Subtest (IELTS Vol 1)', 'WRITING', 3600, 5, false, NOW()),
(9, 'Speaking Subtest (IELTS Vol 1)', 'SPEAKING', 900, 5, false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  exam_type = EXCLUDED.exam_type,
  duration = EXCLUDED.duration,
  parent_test_id = EXCLUDED.parent_test_id;

-- ─── 5a. Listening Subtest Details (Test ID: 6) ──────────────────────────────────
INSERT INTO test_sections (id, test_id, section_number, title, is_deleted, created_at)
VALUES 
(13, 6, 1, 'Part 1: Flight Booking Inquiry', false, NOW()),
(14, 6, 2, 'Part 2: Museum Tour Information', false, NOW()),
(15, 6, 3, 'Part 3: Group Project Discussion', false, NOW()),
(16, 6, 4, 'Part 4: Scientific Lecture on Ocean Currents', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title;

INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES 
(15, 13, 1, 'FILL_IN_THE_BLANK', 'Flight number: _____', NULL, 'VN123', 'The speaker says flight number VN123.', false, NOW()),
(16, 13, 2, 'MULTIPLE_CHOICE', 'Destination city is:', '["A. Hanoi", "B. Da Nang", "C. Ho Chi Minh City"]', 'A', 'He states he is flying to Hanoi.', false, NOW()),
(17, 14, 3, 'FILL_IN_THE_BLANK', 'Ticket price: _____ dollars', NULL, '45', 'The tour guide says tickets are 45 dollars.', false, NOW()),
(18, 15, 4, 'MULTIPLE_CHOICE', 'The presentation date has been moved to:', '["A. Monday", "B. Wednesday", "C. Friday"]', 'B', 'The professor says the date is moved to Wednesday.', false, NOW()),
(19, 16, 5, 'FILL_IN_THE_BLANK', 'Deep ocean currents are driven by density _____', NULL, 'differences', 'The speaker mentions density differences driven by temperature.', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  section_id = EXCLUDED.section_id,
  question_number = EXCLUDED.question_number,
  question_type = EXCLUDED.question_type,
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;

-- ─── 5b. Reading Subtest Details (Test ID: 7) ──────────────────────────────────
INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES 
(17, 7, 1, 'Passage 1: The Integration of Artificial Intelligence', '<div><p>Artificial Intelligence (AI) is transforming industries. Machine learning algorithms analyze vast amounts of data to make predictions. From healthcare diagnoses to autonomous vehicles, AI systems are becoming integrated into daily life.</p></div>', false, NOW()),
(18, 7, 2, 'Passage 2: The Migration of Monarch Butterflies', '<div><p>Each year, millions of Monarch butterflies travel up to 3,000 miles from Canada to Mexico. This incredible migration spans multiple generations, using environmental cues and internal compasses to navigate precisely to the same mountain forests.</p></div>', false, NOW()),
(19, 7, 3, 'Passage 3: The Evolution of Language', '<div><p>Language evolution is a subject of intense academic study. Chomsky argued that humans possess an innate universal grammar, whereas other theorists emphasize the role of social interaction and cultural transmission in linguistic development.</p></div>', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title,
  passage = EXCLUDED.passage;

INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES 
(20, 17, 1, 'TRUE_FALSE_NOT_GIVEN', 'AI systems are only used in healthcare.', NULL, 'FALSE', 'The text states AI is used in healthcare, autonomous vehicles, and integrated into daily life.', false, NOW()),
(21, 17, 2, 'MULTIPLE_CHOICE', 'What do machine learning algorithms analyze to make predictions?', '["A. Human behaviors", "B. Vast amounts of data", "C. Financial markets"]', 'B', 'The text says machine learning algorithms analyze vast amounts of data.', false, NOW()),
(22, 18, 3, 'TRUE_FALSE_NOT_GIVEN', 'The Monarch butterfly migration is completed by a single insect.', NULL, 'FALSE', 'The text states that the migration spans multiple generations.', false, NOW()),
(23, 19, 4, 'FILL_IN_THE_BLANK', 'Chomsky proposed that humans are born with a universal _____', NULL, 'grammar', 'The passage says Chomsky argued humans possess an innate universal grammar.', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  section_id = EXCLUDED.section_id,
  question_number = EXCLUDED.question_number,
  question_type = EXCLUDED.question_type,
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;

-- ─── 5c. Writing Subtest Details (Test ID: 8) ──────────────────────────────────
INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES 
(20, 8, 1, 'Task 1: Describe the Line Graph', 'The graph below shows the changes in oil consumption in four countries between 2000 and 2015. Summarize the main trends.', false, NOW()),
(21, 8, 2, 'Task 2: Essay Writing', 'With the rise of social media, face-to-face communication is decreasing. Do you agree that the advantages outweigh the disadvantages?', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title,
  passage = EXCLUDED.passage;

-- ─── 5d. Speaking Subtest Details (Test ID: 9) ──────────────────────────────────
INSERT INTO test_sections (id, test_id, section_number, title, passage, cue_card, is_deleted, created_at)
VALUES 
(22, 9, 1, 'Part 1: Study and Work', 'What are you studying? Do you prefer studying in the morning or in the evening?', NULL, false, NOW()),
(23, 9, 2, 'Part 2: Cue Card', NULL, 'Describe a memorable holiday you had. You should say:\n- Where you went\n- Who you went with\n- What you did\n- And explain why it was memorable.', false, NOW()),
(24, 9, 3, 'Part 3: Discussion', 'Let''s talk about tourism. In what ways does tourism benefit local communities? Can it have negative impacts?', NULL, false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  test_id = EXCLUDED.test_id,
  section_number = EXCLUDED.section_number,
  title = EXCLUDED.title,
  passage = EXCLUDED.passage,
  cue_card = EXCLUDED.cue_card;

-- ─── 6. AUTO-INCREMENT ALIGNMENT ─────────────────────────────────────────────
SELECT setval(pg_get_serial_sequence('tests', 'id'), coalesce(max(id), 1) + 1) FROM tests;
SELECT setval(pg_get_serial_sequence('test_sections', 'id'), coalesce(max(id), 1) + 1) FROM test_sections;
SELECT setval(pg_get_serial_sequence('test_questions', 'id'), coalesce(max(id), 1) + 1) FROM test_questions;
