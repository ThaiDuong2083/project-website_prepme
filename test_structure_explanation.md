# Hướng Dẫn Chi Tiết Cấu Trúc Đề Thi (Test System Database Structure)

Tài liệu này giải thích chi tiết cấu trúc cơ sở dữ liệu của hệ thống đề thi IELTS trong dự án Prepme, dựa trên ba thực thể JPA chính: `TestEntity`, `TestSectionEntity` và `TestQuestionEntity`.

---

## 1. Chi Tiết Các Thực Thể & Các Trường (Entity Fields & Purpose)

Cả ba thực thể đều kế thừa từ **`BaseEntity`**, do đó đều có các trường dùng chung cho mục đích audit và quản lý:
- `id`: Khóa chính tự tăng (Kiểu dữ liệu `Long`, kiểu cột `BIGSERIAL`).
- `createdAt` / `updatedAt`: Thời gian tạo / cập nhật bản ghi (`timestamp`).
- `createdBy` / `updatedBy`: Tên tài khoản người tạo / cập nhật bản ghi.
- `isDeleted`: Đánh dấu xóa mềm (`boolean`, mặc định là `false`).

---

### A. Thực thể `TestEntity` (Bảng `tests`)
Đại diện cho một đề thi hoặc một bài thi kỹ năng con (subtest).

| Tên trường (Java) | Tên cột (SQL) | Kiểu dữ liệu | Bắt buộc (Nullable) | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `title` | `String (VARCHAR(255))` | CÓ (nullable = false) | Tiêu đề của đề thi (Ví dụ: *"Cambridge 18 Academic Reading Test 1"*). |
| `examType` | `exam_type` | `ExamType (Enum)` | CÓ (nullable = false) | Loại đề thi. Nhận các giá trị: `LISTENING`, `READING`, `WRITING`, `SPEAKING`, `IELTS`. |
| `duration` | `duration` | `Integer` | Không | Thời gian làm bài tính bằng giây (Ví dụ: `1800` cho 30 phút Listening, `3600` cho 60 phút Reading/Writing). |
| `description` | `description` | `String (TEXT)` | Không | Mô tả chi tiết hoặc giới thiệu chung về đề thi. |
| `parentTest` | `parent_test_id` | `TestEntity` | Không | Tham chiếu tự liên kết (Self-Reference). Trỏ tới đề thi cha nếu đây là một đề thi kỹ năng thành phần nằm trong một bộ đề thi IELTS Full Test lớn. |
| `childTests` | - | `List<TestEntity>` | - | Danh sách các đề thi con trực thuộc (Liên kết One-to-Many ngược lại từ `parentTest`). |
| `sections` | - | `List<TestSectionEntity>` | - | Danh sách các phần thi thuộc đề thi này (Sắp xếp tăng dần theo `sectionNumber`). |
| `isPro` | `is_pro` | `Boolean` | CÓ (mặc định false) | Đánh dấu đề thi này chỉ dành cho tài khoản trả phí Premium/Pro. |

---

### B. Thực thể `TestSectionEntity` (Bảng `test_sections`)
Đại diện cho từng phần thi (Section/Part/Passage) nằm trong một đề thi.

| Tên trường (Java) | Tên cột (SQL) | Kiểu dữ liệu | Bắt buộc (Nullable) | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `test_id` | `TestEntity` | CÓ (nullable = false) | Tham chiếu khóa ngoại đến đề thi sở hữu phần này (`TestEntity`). |
| `sectionNumber` | `section_number` | `Integer` | CÓ (nullable = false) | Thứ tự của phần thi này (Ví dụ: `1`, `2`, `3`, `4`). |
| `title` | `title` | `String (VARCHAR(255))` | Không | Tiêu đề cụ thể của phần thi (Ví dụ: *"Part 1: Inquiry about Hotel Booking"*, *"Passage 1: The Rise of Forest Bathing"*). |
| `passage` | `passage` | `String (TEXT)` | Không | Đoạn văn đọc (đối với Reading - có thể chứa mã HTML), đề bài tập viết (đối với Writing), hoặc danh sách câu hỏi phỏng vấn gợi ý (đối với Speaking Part 1/3). |
| `cueCard` | `cue_card` | `String (TEXT)` | Không | Nội dung gợi ý của thẻ gợi ý nói (chỉ dành riêng cho Speaking Part 2). |
| `audioUrl` | `audio_url` | `String (VARCHAR(512))` | Không | Đường dẫn đến tệp âm thanh nghe nếu phần này là Listening. |
| `sampleAnswer` | `sample_answer` | `String (TEXT)` | Không | Bài viết mẫu hoặc câu trả lời mẫu mẫu đối với kỹ năng Writing/Speaking để người dùng so sánh hoặc phục vụ AI chấm điểm. |
| `questions` | - | `List<TestQuestionEntity>` | - | Danh sách các câu hỏi cụ thể thuộc phần này (Sắp xếp tăng dần theo `questionNumber`). |

---

### C. Thực thể `TestQuestionEntity` (Bảng `test_questions`)
Đại diện cho từng câu hỏi kiểm tra chi tiết trong một phần thi (chủ yếu áp dụng cho Listening và Reading).

| Tên trường (Java) | Tên cột (SQL) | Kiểu dữ liệu | Bắt buộc (Nullable) | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- |
| `section` | `section_id` | `TestSectionEntity` | CÓ (nullable = false) | Tham chiếu khóa ngoại đến phần thi sở hữu câu hỏi này (`TestSectionEntity`). |
| `questionNumber` | `question_number` | `Integer` | CÓ (nullable = false) | Số thứ tự câu hỏi trong đề thi (Ví dụ: từ `1` đến `40`). |
| `questionType` | `question_type` | `QuestionType (Enum)` | CÓ (nullable = false) | Loại câu hỏi. Nhận các giá trị: `TRUE_FALSE_NOT_GIVEN`, `MATCHING_HEADINGS`, `MULTIPLE_CHOICE`, `FILL_IN_THE_BLANK`, `SHORT_ANSWER`. |
| `questionText` | `question_text` | `String (TEXT)` | Không | Nội dung câu hỏi cụ thể hiển thị cho người học. |
| `options` | `options` | `String (TEXT)` | Không | Chứa các phương án lựa chọn lưu dưới dạng **chuỗi JSON đại diện cho một mảng String** (Ví dụ: `'["A. Option 1", "B. Option 2"]'`). Để trống (`null`) nếu là câu điền từ. |
| `correctAnswer` | `correct_answer` | `String (VARCHAR(255))` | Không | Đáp án chính xác để đối chiếu chấm điểm tự động (Ví dụ: `"A"`, `"TRUE"`, hoặc `"computer"`). |
| `explanation` | `explanation` | `String (TEXT)` | Không | Lời giải thích chi tiết vì sao đáp án đó đúng. |

---

## 2. Cách Thiết Lập Quan Hệ & Thêm Dữ Liệu (Data Relationship & Addition)

Khi thêm một đề thi mới vào cơ sở dữ liệu, bạn phải tuân thủ quy trình thiết lập quan hệ dữ liệu theo các bước sau:

```
1. Tạo đề thi (TestEntity)
   └── 2. Tạo phần thi (TestSectionEntity) trỏ test_id về TestEntity vừa tạo
         └── 3. Tạo các câu hỏi chi tiết (TestQuestionEntity) trỏ section_id về TestSectionEntity vừa tạo
```

### Lưu ý đặc biệt về các kỹ năng:
- **Listening & Reading:** Tuân thủ đầy đủ 3 cấp độ trên (Test -> Sections -> Questions).
- **Writing & Speaking:** Chỉ dùng 2 cấp độ đầu (Test -> Sections). 
  - Đề bài sẽ được ghi trực tiếp vào cột `passage` (cho Writing, Speaking Part 1, Part 3) hoặc `cue_card` (cho Speaking Part 2).
  - Không có bản ghi chi tiết trong bảng `test_questions`.
  - Đáp án mẫu/bài mẫu được lưu ở cột `sample_answer` trong bảng `test_sections`.
- **IELTS Full Test:** Đây là đề thi tích hợp. Cần tạo 1 đề thi cha (`exam_type = 'IELTS'`), sau đó tạo 4 đề thi con (Listening, Reading, Writing, Speaking) trỏ `parent_test_id` về đề thi cha này. Rồi từ các đề thi con mới tạo ra các `sections` và `questions`.

---

## 3. Dữ Liệu Mẫu Cho Từng Dạng Đề Thi (Sample SQL Data)

Dưới đây là các câu lệnh SQL INSERT mẫu đại diện cho 5 loại đề thi khác nhau để bạn dễ dàng thêm dữ liệu.

### Dạng 1: Listening
```sql
-- 1. Tạo đề thi Listening
INSERT INTO tests (id, title, exam_type, duration, description, is_pro, is_deleted, created_at)
VALUES (1, 'Cambridge 18 Academic Listening Test 1', 'LISTENING', 1800, 'Cambridge 18 Practice Listening Test 1.', false, false, NOW());

-- 2. Tạo phần thi (Section) có chứa file audio
INSERT INTO test_sections (id, test_id, section_number, title, audio_url, is_deleted, created_at)
VALUES 
(1, 1, 1, 'Part 1: Inquiry about Hotel Booking', 'https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3', false, NOW());

-- 3. Tạo các câu hỏi con
-- Trắc nghiệm (MULTIPLE_CHOICE)
INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES (1, 1, 1, 'MULTIPLE_CHOICE', 'The room requested is:', '["A. Double room", "B. Single room", "C. Twin room"]', 'B', 'He mentions he wants a single room since he is travelling alone.', false, NOW());

-- Điền từ (FILL_IN_THE_BLANK) - options để NULL
INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES (2, 1, 2, 'FILL_IN_THE_BLANK', 'Name of client: John _____', NULL, 'Smith', 'The speaker clearly spells out S-M-I-T-H.', false, NOW());
```

### Dạng 2: Reading
```sql
-- 1. Tạo đề thi Reading
INSERT INTO tests (id, title, exam_type, duration, description, is_pro, is_deleted, created_at)
VALUES (2, 'Cambridge 18 Academic Reading Test 1', 'READING', 3600, 'Cambridge 18 Practice Reading Test 1.', false, false, NOW());

-- 2. Tạo phần thi (Section) chứa văn bản đọc HTML
INSERT INTO test_sections (id, test_id, section_number, title, passage, is_deleted, created_at)
VALUES (5, 2, 1, 'Passage 1: The Rise of Forest Bathing', '<div><p>Forest bathing, or Shinrin-yoku, is a practice that originated in Japan in the 1980s...</p></div>', false, NOW());

-- 3. Tạo các câu hỏi con
-- Dạng TRUE/FALSE/NOT GIVEN
INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES (9, 5, 1, 'TRUE_FALSE_NOT_GIVEN', 'Forest bathing was first developed in the United States.', NULL, 'FALSE', 'The passage states that it originated in Japan in the 1980s.', false, NOW());

-- Dạng điền từ
INSERT INTO test_questions (id, section_id, question_number, question_type, question_text, options, correct_answer, explanation, is_deleted, created_at)
VALUES (10, 5, 2, 'FILL_IN_THE_BLANK', 'The Japanese term for forest bathing is _____', NULL, 'Shinrin-yoku', 'The passage says forest bathing is also called Shinrin-yoku.', false, NOW());
```

### Dạng 3: Writing
```sql
-- 1. Tạo đề thi Writing
INSERT INTO tests (id, title, exam_type, duration, description, is_pro, is_deleted, created_at)
VALUES (3, 'IELTS Practice Academic Writing Test 1', 'WRITING', 3600, 'Writing mock exam. Consists of Task 1 and Task 2.', false, false, NOW());

-- 2. Tạo Task 1
INSERT INTO test_sections (id, test_id, section_number, title, passage, sample_answer, is_deleted, created_at)
VALUES (8, 3, 1, 'Task 1: Describe the Bar Chart', 'The chart below shows the percentage of households with internet access in different countries... Write at least 150 words.', 'The bar chart compares the percentage of households that had access to the internet... (Bài mẫu chi tiết)', false, NOW());

-- 3. Tạo Task 2
INSERT INTO test_sections (id, test_id, section_number, title, passage, sample_answer, is_deleted, created_at)
VALUES (9, 3, 2, 'Task 2: Essay Writing', 'Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your opinion. Write at least 250 words.', 'It is argued by some that tertiary education should be provided free of charge... (Bài mẫu chi tiết)', false, NOW());
```

### Dạng 4: Speaking
```sql
-- 1. Tạo đề thi Speaking
INSERT INTO tests (id, title, exam_type, duration, description, is_pro, is_deleted, created_at)
VALUES (4, 'IELTS Speaking Mock Test 1', 'SPEAKING', 900, 'Standard IELTS Speaking exam structure.', false, false, NOW());

-- 2. Tạo Part 1
INSERT INTO test_sections (id, test_id, section_number, title, passage, sample_answer, is_deleted, created_at)
VALUES (10, 4, 1, 'Part 1: Introduction & Interview', 'Let''s talk about your hometown. Where is your hometown? What do you like most about it?', 'Well, I come from Hanoi, which is the capital city of Vietnam...', false, NOW());

-- 3. Tạo Part 2 (Lưu vào cue_card)
INSERT INTO test_sections (id, test_id, section_number, title, cue_card, sample_answer, is_deleted, created_at)
VALUES (11, 4, 2, 'Part 2: Cue Card', 'Describe a book you read recently that you found interesting. You should say:\n- What book it is\n- When you read it\n- And explain why you found it interesting.', 'I would like to describe a book I read recently, named Sapiens...', false, NOW());

-- 4. Tạo Part 3
INSERT INTO test_sections (id, test_id, section_number, title, passage, sample_answer, is_deleted, created_at)
VALUES (12, 4, 3, 'Part 3: Discussion', 'Let''s discuss reading habits. Do you think electronic books will completely replace paper books in the future? Why?', 'In my opinion, it is highly unlikely that printed books will vanish completely...', false, NOW());
```

### Dạng 5: Bộ Đề Tổng Hợp IELTS Full Test
```sql
-- 1. Tạo đề thi cha (IELTS Full Test)
INSERT INTO tests (id, title, exam_type, duration, description, is_pro, is_deleted, created_at)
VALUES (5, 'IELTS Academic Practice Exam Volume 1 (Full Test)', 'IELTS', 9900, 'Composite exam including all 4 skills: Listening, Reading, Writing, and Speaking.', false, false, NOW());

-- 2. Tạo các subtests con và gán parent_test_id = 5
INSERT INTO tests (id, title, exam_type, duration, parent_test_id, is_deleted, created_at)
VALUES 
(6, 'Listening Subtest (IELTS Vol 1)', 'LISTENING', 1800, 5, false, NOW()),
(7, 'Reading Subtest (IELTS Vol 1)', 'READING', 3600, 5, false, NOW()),
(8, 'Writing Subtest (IELTS Vol 1)', 'WRITING', 3600, 5, false, NOW()),
(9, 'Speaking Subtest (IELTS Vol 1)', 'SPEAKING', 900, 5, false, NOW());

-- 3. Từ các subtest con (ID 6, 7, 8, 9), ta tạo các phần thi (test_sections) và câu hỏi (test_questions) 
-- tương tự như hướng dẫn ở các dạng đơn lẻ phía trên.
```
