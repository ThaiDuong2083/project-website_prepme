package com.fpt.website_prepme.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.enums.*;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.*;
import com.fpt.website_prepme.model.entity.*;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.repository.*;
import com.fpt.website_prepme.service.TestService;
import com.fpt.website_prepme.utils.IeltsScoringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;
    private final TestSectionRepository testSectionRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final PracticeHistoryRepository practiceHistoryRepository;
    private final UserRepository userRepository;
    private final com.fpt.website_prepme.service.OpenAiService openAiService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TestListDTO> getExams(ExamType type, String search, Pageable pageable) {
        Page<TestEntity> page;
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (type != null) {
            if (hasSearch) {
                page = testRepository.findAllByExamTypeAndTitleContainingIgnoreCaseAndIsDeletedFalseAndParentTestIsNull(type, search, pageable);
            } else {
                page = testRepository.findAllByExamTypeAndIsDeletedFalseAndParentTestIsNull(type, pageable);
            }
        } else {
            if (hasSearch) {
                page = testRepository.findAllByTitleContainingIgnoreCaseAndIsDeletedFalseAndParentTestIsNull(search, pageable);
            } else {
                page = testRepository.findAllByIsDeletedFalseAndParentTestIsNull(pageable);
            }
        }

        List<TestListDTO> content = page.getContent().stream()
                .map(TestListDTO::toDto)
                .toList();

        PageResponse.PaginationMeta pagination = PageResponse.PaginationMeta.builder()
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();

        return PageResponse.<TestListDTO>builder()
                .content(content)
                .pagination(pagination)
                .build();
    }

    private void checkProAccess(TestEntity test) {
        if (Boolean.TRUE.equals(test.getIsPro())) {
            UserEntity currentUser = getCurrentUser();
            if (currentUser.getMembershipType() != MembershipType.PREMIUM) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bài thi này chỉ dành cho tài khoản Pro. Vui lòng nâng cấp tài khoản của bạn.");
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TestDetailDTO getExamDetails(Long id, boolean hideAnswers) {
        TestEntity entity = testRepository.findById(id)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Exam not found or has been deleted"));
        checkProAccess(entity);
        return TestDetailDTO.toDto(entity, hideAnswers);
    }

    @Override
    @Transactional
    public PracticeHistoryDTO submitExam(Long id, TestSubmitRequest request) {
        UserEntity currentUser = getCurrentUser();
        TestEntity test = testRepository.findById(id)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Exam not found"));
        checkProAccess(test);

        SkillType skillType = getSkillTypeFromExamType(test.getExamType());
        Double score = null;
        String userAnswersJson = null;

        // Auto-scoring logic for Listening and Reading
        if (request.getStatus() != PracticeStatus.DRAFT && (test.getExamType() == ExamType.LISTENING || test.getExamType() == ExamType.READING)) {
            int correctCount = 0;
            int totalQuestions = 0;

            List<TestSectionEntity> sections = test.getSections();
            for (TestSectionEntity section : sections) {
                for (TestQuestionEntity question : section.getQuestions()) {
                    totalQuestions++;
                    String questionKey = String.valueOf(question.getId());
                    String qNumKey = String.valueOf(question.getQuestionNumber());
                    
                    String userAnswer = null;
                    if (request.getAnswers() != null) {
                        userAnswer = request.getAnswers().get(questionKey);
                        if (userAnswer == null) {
                            userAnswer = request.getAnswers().get(qNumKey);
                        }
                    }

                    if (userAnswer != null && question.getCorrectAnswer() != null) {
                        if (userAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                            correctCount++;
                        }
                    }
                }
            }

            if (test.getExamType() == ExamType.LISTENING) {
                score = IeltsScoringUtils.calculateListeningBand(correctCount);
            } else {
                score = IeltsScoringUtils.calculateReadingAcademicBand(correctCount);
            }

            // Save correction analysis in the JSON structure
            try {
                Map<String, Object> analysis = new HashMap<>();
                analysis.put("correctCount", correctCount);
                analysis.put("totalQuestions", totalQuestions);
                analysis.put("percentage", totalQuestions > 0 ? (double) correctCount / totalQuestions * 100 : 0);
                request.setSubmissionContent(objectMapper.writeValueAsString(analysis));
            } catch (Exception e) {
                log.warn("Failed to write check statistics JSON: {}", e.getMessage());
            }
        }

        // Convert answers map to JSON string
        if (request.getAnswers() != null) {
            try {
                userAnswersJson = objectMapper.writeValueAsString(request.getAnswers());
            } catch (Exception e) {
                log.warn("Failed to serialize user answers: {}", e.getMessage());
            }
        }

        String submissionContent = request.getSubmissionContent();
        // If speaking and we have recording but no transcript, transcribe it using Whisper
        if (request.getStatus() != PracticeStatus.DRAFT && test.getExamType() == ExamType.SPEAKING) {
            if (request.getRecordingUrl() != null && !request.getRecordingUrl().trim().isEmpty()
                    && (submissionContent == null || submissionContent.trim().isEmpty())) {
                try {
                    String urlField = request.getRecordingUrl().trim();
                    if (urlField.startsWith("{") && urlField.endsWith("}")) {
                        // Parse JSON of multiple URLs
                        Map<String, String> urls = objectMapper.readValue(urlField, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
                        StringBuilder combinedTranscript = new StringBuilder();
                        for (Map.Entry<String, String> entry : urls.entrySet()) {
                            String key = entry.getKey();
                            String audioUrl = entry.getValue();
                            if (audioUrl != null && !audioUrl.trim().isEmpty()) {
                                log.info("Whisper transcribing audio for section {}: {}", key, audioUrl);
                                try {
                                    int partNum = Integer.parseInt(key) + 1;
                                    String transcript = openAiService.transcribeAudio(audioUrl);
                                    combinedTranscript.append("### Phần ").append(partNum).append("\n")
                                            .append(transcript).append("\n\n");
                                } catch (Exception e) {
                                    log.warn("Failed to transcribe speaking audio section {}: {}", key, e.getMessage());
                                }
                            }
                        }
                        submissionContent = combinedTranscript.toString().trim();
                    } else {
                        log.info("Whisper transcribing audio for speaking test: {}", urlField);
                        submissionContent = openAiService.transcribeAudio(urlField);
                    }
                } catch (Exception e) {
                    log.warn("Failed to transcribe speaking audio: {}", e.getMessage());
                    submissionContent = "[Không thể tự động nhận diện giọng nói: " + e.getMessage() + "]";
                }
            }
        }

        PracticeHistoryEntity practiceHistory = PracticeHistoryEntity.builder()
                .user(currentUser)
                .test(test)
                .testTitle(test.getTitle())
                .skillType(skillType)
                .score(score)
                .completionTime(request.getCompletionTime())
                .answers(userAnswersJson)
                .submissionContent(submissionContent)
                .recordingUrl(request.getRecordingUrl())
                .status(request.getStatus() != null ? request.getStatus() : PracticeStatus.COMPLETED)
                .build();

        if (practiceHistory.getStatus() == PracticeStatus.COMPLETED && test.getExamType() != ExamType.SPEAKING) {
            practiceHistory.setAiAnalysis("Đang chờ nhận xét từ AI...");
        }

        PracticeHistoryEntity saved = practiceHistoryRepository.save(practiceHistory);

        if (saved.getStatus() == PracticeStatus.COMPLETED && test.getExamType() != ExamType.SPEAKING) {
            try {
                openAiService.generateFeedbackAsync(saved.getId());
            } catch (Exception e) {
                log.error("Failed to trigger asynchronous AI feedback: {}", e.getMessage(), e);
            }
        }

        return PracticeHistoryDTO.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryDTO> getPracticeHistory(SkillType skillType, Pageable pageable) {
        UserEntity currentUser = getCurrentUser();
        Page<PracticeHistoryEntity> page;

        if (skillType != null) {
            page = practiceHistoryRepository.findAllByUserIdAndSkillTypeAndIsDeletedFalse(currentUser.getId(), skillType, pageable);
        } else {
            page = practiceHistoryRepository.findAllByUserIdAndIsDeletedFalse(currentUser.getId(), pageable);
        }

        List<PracticeHistoryDTO> content = page.getContent().stream()
                .map(PracticeHistoryDTO::toDto)
                .toList();

        PageResponse.PaginationMeta pagination = PageResponse.PaginationMeta.builder()
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();

        return PageResponse.<PracticeHistoryDTO>builder()
                .content(content)
                .pagination(pagination)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PracticeHistoryDTO getPracticeHistoryDetails(Long practiceId) {
        PracticeHistoryEntity entity = practiceHistoryRepository.findById(practiceId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Practice history not found"));
        return PracticeHistoryDTO.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public PracticeStatisticsDTO getPracticeStatistics() {
        UserEntity currentUser = getCurrentUser();
        List<PracticeHistoryEntity> logs = practiceHistoryRepository.findByUserIdAndIsDeletedFalse(currentUser.getId());

        long total = logs.stream()
                .filter(l -> l.getStatus() == PracticeStatus.COMPLETED)
                .count();

        Map<String, Long> practicesBySkill = logs.stream()
                .filter(l -> l.getStatus() == PracticeStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        l -> l.getSkillType().name(),
                        Collectors.counting()
                ));

        Map<String, Double> averageScoreBySkill = logs.stream()
                .filter(l -> l.getStatus() == PracticeStatus.COMPLETED && l.getScore() != null)
                .collect(Collectors.groupingBy(
                        l -> l.getSkillType().name(),
                        Collectors.averagingDouble(PracticeHistoryEntity::getScore)
                ));

        // Group daily frequencies by yyyy-MM-dd
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> dailyFrequency = logs.stream()
                .filter(l -> l.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        l -> l.getCreatedAt().format(formatter),
                        Collectors.counting()
                ));

        return PracticeStatisticsDTO.builder()
                .totalPractices(total)
                .practicesBySkill(practicesBySkill)
                .averageScoreBySkill(averageScoreBySkill)
                .dailyFrequency(dailyFrequency)
                .build();
    }

    @Override
    @Transactional
    public void seedDemoExams() {
        // Only seed if no exams exist to prevent duplication
        if (testRepository.count() > 0) {
            return;
        }

        // 1. LISTENING EXAM
        TestEntity listening = TestEntity.builder()
                .title("Cambridge 18 Academic Listening Test 1")
                .examType(ExamType.LISTENING)
                .duration(1800)
                .description("Official Cambridge 18 Practice Listening Test 1. Standard IELTS audio player and 4 sections with 8 fill-in-the-blank and multiple choice questions.")
                .isPro(false)
                .build();
        testRepository.save(listening);

        TestSectionEntity lSec1 = TestSectionEntity.builder()
                .test(listening)
                .sectionNumber(1)
                .title("Part 1: Inquiry about Hotel Booking")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        TestSectionEntity lSec2 = TestSectionEntity.builder()
                .test(listening)
                .sectionNumber(2)
                .title("Part 2: Local Tourist Information")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        TestSectionEntity lSec3 = TestSectionEntity.builder()
                .test(listening)
                .sectionNumber(3)
                .title("Part 3: Academic Discussion on Project")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        TestSectionEntity lSec4 = TestSectionEntity.builder()
                .test(listening)
                .sectionNumber(4)
                .title("Part 4: Lecture on Wildlife Conservation")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        testSectionRepository.saveAll(List.of(lSec1, lSec2, lSec3, lSec4));

        TestQuestionEntity lQ1 = TestQuestionEntity.builder()
                .section(lSec1)
                .questionNumber(1)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("Name of client: John _____")
                .correctAnswer("Smith")
                .explanation("The speaker clearly spells out S-M-I-T-H.")
                .build();
        TestQuestionEntity lQ2 = TestQuestionEntity.builder()
                .section(lSec1)
                .questionNumber(2)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("The room requested is:")
                .options("[\"A. Double room\", \"B. Single room\", \"C. Twin room\"]")
                .correctAnswer("B")
                .explanation("He mentions he wants a single room since he is travelling alone.")
                .build();
        TestQuestionEntity lQ3 = TestQuestionEntity.builder()
                .section(lSec2)
                .questionNumber(3)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("What is the main attraction of the park?")
                .options("[\"A. The waterfall\", \"B. The historic bridge\", \"C. The botanical garden\"]")
                .correctAnswer("A")
                .explanation("The speaker mentions the waterfall attracts 90% of visitors.")
                .build();
        TestQuestionEntity lQ4 = TestQuestionEntity.builder()
                .section(lSec2)
                .questionNumber(4)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("The tourist office is located next to the _____")
                .correctAnswer("library")
                .explanation("The guide says: 'It is right next to the town library.'")
                .build();
        TestQuestionEntity lQ5 = TestQuestionEntity.builder()
                .section(lSec3)
                .questionNumber(5)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("The students agree that their project needs more:")
                .options("[\"A. Data analysis\", \"B. Background research\", \"C. Visual diagrams\"]")
                .correctAnswer("B")
                .explanation("Both agree that the literature review is too brief and needs more background research.")
                .build();
        TestQuestionEntity lQ6 = TestQuestionEntity.builder()
                .section(lSec3)
                .questionNumber(6)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("They will meet again on _____ afternoon.")
                .correctAnswer("Thursday")
                .explanation("They schedule the next meeting for Thursday afternoon.")
                .build();
        TestQuestionEntity lQ7 = TestQuestionEntity.builder()
                .section(lSec4)
                .questionNumber(7)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("The primary threat to the animal population is habitat _____")
                .correctAnswer("loss")
                .explanation("The lecturer mentions habitat loss due to agriculture.")
                .build();
        TestQuestionEntity lQ8 = TestQuestionEntity.builder()
                .section(lSec4)
                .questionNumber(8)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("Conservationists suggest building wildlife _____ to connect forests.")
                .correctAnswer("corridors")
                .explanation("The speaker emphasizes wildlife corridors.")
                .build();
        testQuestionRepository.saveAll(List.of(lQ1, lQ2, lQ3, lQ4, lQ5, lQ6, lQ7, lQ8));

        // 2. READING EXAM
        TestEntity reading = TestEntity.builder()
                .title("Cambridge 18 Academic Reading Test 1")
                .examType(ExamType.READING)
                .duration(3600)
                .description("Official Cambridge 18 Practice Reading Test 1. Contains 3 passages with true/false/not given and multiple choice questions.")
                .isPro(false)
                .build();
        testRepository.save(reading);

        TestSectionEntity rSec1 = TestSectionEntity.builder()
                .test(reading)
                .sectionNumber(1)
                .title("Passage 1: The Rise of Forest Bathing")
                .passage("<div><p>Forest bathing, or Shinrin-yoku, is a practice that originated in Japan in the 1980s. It involves spending quiet, mindful time in a forest, absorbing the atmosphere through the senses. Scientific research shows that this practice reduces stress hormones, lowers blood pressure, and improves immune function.</p></div>")
                .build();
        TestSectionEntity rSec2 = TestSectionEntity.builder()
                .test(reading)
                .sectionNumber(2)
                .title("Passage 2: The History of the Bicycle")
                .passage("<div><p>The history of the bicycle is a story of innovation. The earliest bicycle-like vehicle was the Draisienne, invented by Karl von Drais in 1817. It had no pedals and was propelled by pushing one's feet against the ground. The addition of pedals in the 1860s by French inventors marked a major turning point, leading to the 'boneshaker' and later the penny-farthing bicycle.</p></div>")
                .build();
        TestSectionEntity rSec3 = TestSectionEntity.builder()
                .test(reading)
                .sectionNumber(3)
                .title("Passage 3: The Psychology of Decision Making")
                .passage("<div><p>Decision making is a complex cognitive process. Psychologist Daniel Kahneman describes two systems of thinking: System 1 is fast, automatic, and emotional, while System 2 is slow, deliberative, and logical. Most daily decisions are made using System 1, which relies on heuristics, while complex choices require the deliberate effort of System 2.</p></div>")
                .build();
        testSectionRepository.saveAll(List.of(rSec1, rSec2, rSec3));

        TestQuestionEntity rQ1 = TestQuestionEntity.builder()
                .section(rSec1)
                .questionNumber(1)
                .questionType(QuestionType.TRUE_FALSE_NOT_GIVEN)
                .questionText("Forest bathing was first developed in the United States.")
                .correctAnswer("FALSE")
                .explanation("The passage states that it originated in Japan in the 1980s.")
                .build();
        TestQuestionEntity rQ2 = TestQuestionEntity.builder()
                .section(rSec1)
                .questionNumber(2)
                .questionType(QuestionType.TRUE_FALSE_NOT_GIVEN)
                .questionText("Scientific evidence supports the physiological benefits of Shinrin-yoku.")
                .correctAnswer("TRUE")
                .explanation("The passage states scientific research shows reductions in stress, blood pressure, and immune improvements.")
                .build();
        TestQuestionEntity rQ3 = TestQuestionEntity.builder()
                .section(rSec2)
                .questionNumber(3)
                .questionType(QuestionType.TRUE_FALSE_NOT_GIVEN)
                .questionText("The Draisienne bicycle had pedals.")
                .correctAnswer("FALSE")
                .explanation("The text states the Draisienne had no pedals.")
                .build();
        TestQuestionEntity rQ4 = TestQuestionEntity.builder()
                .section(rSec2)
                .questionNumber(4)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("Who invented the earliest bicycle-like vehicle?")
                .options("[\"A. Karl von Drais\", \"B. Pierre Michaux\", \"C. James Starley\"]")
                .correctAnswer("A")
                .explanation("Karl von Drais invented the Draisienne in 1817.")
                .build();
        TestQuestionEntity rQ5 = TestQuestionEntity.builder()
                .section(rSec3)
                .questionNumber(5)
                .questionType(QuestionType.TRUE_FALSE_NOT_GIVEN)
                .questionText("System 2 thinking is faster than System 1 thinking.")
                .correctAnswer("FALSE")
                .explanation("System 2 is described as slow, while System 1 is fast.")
                .build();
        TestQuestionEntity rQ6 = TestQuestionEntity.builder()
                .section(rSec3)
                .questionNumber(6)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("System 1 thinking relies on mental shortcuts called _____")
                .correctAnswer("heuristics")
                .explanation("The passage states System 1 relies on heuristics.")
                .build();
        testQuestionRepository.saveAll(List.of(rQ1, rQ2, rQ3, rQ4, rQ5, rQ6));


        // 3. WRITING EXAM
        TestEntity writing = TestEntity.builder()
                .title("IELTS Practice Academic Writing Test 1")
                .examType(ExamType.WRITING)
                .duration(3600)
                .description("Writing mock exam. Consists of Task 1 (Bar Chart description) and Task 2 (Essay writing).")
                .isPro(true)
                .build();
        testRepository.save(writing);

        TestSectionEntity wSec1 = TestSectionEntity.builder()
                .test(writing)
                .sectionNumber(1)
                .title("Task 1: Describe the Bar Chart")
                .passage("The chart below shows the percentage of households with internet access in different countries between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.")
                .sampleAnswer("The bar chart illustrates the proportions of households with internet connection in three selected nations (Country A, Country B, and Country C) over a ten-year span from 2010 to 2020. Overall, internet accessibility witnessed a steady upward trend in all three countries. Country A maintained the highest percentage of internet-enabled homes throughout the period, while Country C experienced the most rapid growth. In 2010, Country A was the leader with approximately 60% of households having internet access, compared to 40% in Country B and only 15% in Country C. By 2020, Country A's figure reached 85%, Country B grew to 70%, and Country C surged to 65%.")
                .build();
        TestSectionEntity wSec2 = TestSectionEntity.builder()
                .test(writing)
                .sectionNumber(2)
                .title("Task 2: Essay Writing")
                .passage("Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your opinion. Write at least 250 words.")
                .sampleAnswer("The question of whether tertiary education should be fully funded by the state or paid for by students themselves is a subject of ongoing debate. While some argue that free higher education benefits society as a whole, others contend that personal investment leads to better outcomes. On one hand, making university free ensures equal opportunity for all, regardless of socio-economic background, thereby unlocking talent and driving economic growth. On the other hand, tuition fees help universities maintain high standards of teaching and facilities, and students who contribute financially may be more motivated to succeed. In conclusion, while private contributions are useful, I believe that university education should be free to cultivate a highly educated workforce.")
                .build();
        testSectionRepository.saveAll(List.of(wSec1, wSec2));


        // 4. SPEAKING EXAM
        TestEntity speaking = TestEntity.builder()
                .title("IELTS Speaking Mock Test 1")
                .examType(ExamType.SPEAKING)
                .duration(900)
                .description("Standard IELTS Speaking exam structure including Part 1 introduction, Part 2 cue card description, and Part 3 discussion.")
                .isPro(true)
                .build();
        testRepository.save(speaking);

        TestSectionEntity sSec1 = TestSectionEntity.builder()
                .test(speaking)
                .sectionNumber(1)
                .title("Part 1: Introduction & Interview")
                .passage("Let's talk about your hometown. Where is your hometown? What do you like most about it?")
                .sampleAnswer("I come from Da Nang, a beautiful coastal city in central Vietnam. What I like most about my hometown is the perfect blend of modern infrastructure and pristine nature, particularly the stunning beaches and the iconic bridges. It has a very laid-back vibe compared to busier cities like Hanoi or Ho Chi Minh City.")
                .build();
        TestSectionEntity sSec2 = TestSectionEntity.builder()
                .test(speaking)
                .sectionNumber(2)
                .title("Part 2: Cue Card")
                .cueCard("Describe a book you read recently that you found interesting. You should say: \n- What book it is \n- When you read it \n- What it is about \n- And explain why you found it interesting.")
                .sampleAnswer("I would like to talk about \"Sapiens: A Brief History of Humankind\" by Yuval Noah Harari, which I read last year. The book explores the history of human species from the Stone Age up to the twenty-first century. I found it absolutely fascinating because it combines history and biology to explain why humans succeeded in dominating the planet, highlighting the power of shared imagination and myths.")
                .build();
        TestSectionEntity sSec3 = TestSectionEntity.builder()
                .test(speaking)
                .sectionNumber(3)
                .title("Part 3: Discussion")
                .passage("Let's discuss reading habits. Do you think electronic books will completely replace paper books in the future? Why?")
                .sampleAnswer("In my opinion, while digital books are growing in popularity due to their portability and convenience, they are unlikely to completely replace physical books. Printed books offer a tactile experience—the smell of paper, the feel of turning pages—that many readers still treasure. Moreover, physical books do not cause eye strain or rely on battery power.")
                .build();
        testSectionRepository.saveAll(List.of(sSec1, sSec2, sSec3));


        // 5. COMPOSITE IELTS EXAM
        TestEntity ieltsPackage = TestEntity.builder()
                .title("IELTS Academic Practice Exam Volume 1 (Full Test)")
                .examType(ExamType.IELTS)
                .duration(9900)
                .description("Composite exam including all 4 skills: Listening, Reading, Writing, and Speaking.")
                .isPro(true)
                .build();
        testRepository.save(ieltsPackage);

        // Bind the child subtests to the main IELTS composite exam
        TestEntity lSub = TestEntity.builder()
                .title("Listening Subtest (IELTS Vol 1)")
                .examType(ExamType.LISTENING)
                .duration(1800)
                .parentTest(ieltsPackage)
                .isPro(true)
                .build();
        testRepository.save(lSub);

        TestSectionEntity lSubSec1 = TestSectionEntity.builder()
                .test(lSub)
                .sectionNumber(1)
                .title("Part 1: Flight Booking Inquiry")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        TestSectionEntity lSubSec2 = TestSectionEntity.builder()
                .test(lSub)
                .sectionNumber(2)
                .title("Part 2: Museum Tour Information")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        TestSectionEntity lSubSec3 = TestSectionEntity.builder()
                .test(lSub)
                .sectionNumber(3)
                .title("Part 3: Group Project Discussion")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        TestSectionEntity lSubSec4 = TestSectionEntity.builder()
                .test(lSub)
                .sectionNumber(4)
                .title("Part 4: Scientific Lecture on Ocean Currents")
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .build();
        testSectionRepository.saveAll(List.of(lSubSec1, lSubSec2, lSubSec3, lSubSec4));

        TestQuestionEntity lSubQ1 = TestQuestionEntity.builder()
                .section(lSubSec1)
                .questionNumber(1)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("Flight number: _____")
                .correctAnswer("VN123")
                .explanation("The speaker says flight number VN123.")
                .build();
        TestQuestionEntity lSubQ2 = TestQuestionEntity.builder()
                .section(lSubSec1)
                .questionNumber(2)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("Destination city is:")
                .options("[\"A. Hanoi\", \"B. Da Nang\", \"C. Ho Chi Minh City\"]")
                .correctAnswer("A")
                .explanation("He states he is flying to Hanoi.")
                .build();
        TestQuestionEntity lSubQ3 = TestQuestionEntity.builder()
                .section(lSubSec2)
                .questionNumber(3)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("Ticket price: _____ dollars")
                .correctAnswer("45")
                .explanation("The tour guide says tickets are 45 dollars.")
                .build();
        TestQuestionEntity lSubQ4 = TestQuestionEntity.builder()
                .section(lSubSec3)
                .questionNumber(4)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("The presentation date has been moved to:")
                .options("[\"A. Monday\", \"B. Wednesday\", \"C. Friday\"]")
                .correctAnswer("B")
                .explanation("The professor says the date is moved to Wednesday.")
                .build();
        TestQuestionEntity lSubQ5 = TestQuestionEntity.builder()
                .section(lSubSec4)
                .questionNumber(5)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("Deep ocean currents are driven by density _____")
                .correctAnswer("differences")
                .explanation("The speaker mentions density differences driven by temperature.")
                .build();
        testQuestionRepository.saveAll(List.of(lSubQ1, lSubQ2, lSubQ3, lSubQ4, lSubQ5));

        TestEntity rSub = TestEntity.builder()
                .title("Reading Subtest (IELTS Vol 1)")
                .examType(ExamType.READING)
                .duration(3600)
                .parentTest(ieltsPackage)
                .isPro(true)
                .build();
        testRepository.save(rSub);

        TestSectionEntity rSubSec1 = TestSectionEntity.builder()
                .test(rSub)
                .sectionNumber(1)
                .title("Passage 1: The Integration of Artificial Intelligence")
                .passage("<div><p>Artificial Intelligence (AI) is transforming industries. Machine learning algorithms analyze vast amounts of data to make predictions. From healthcare diagnoses to autonomous vehicles, AI systems are becoming integrated into daily life.</p></div>")
                .build();
        TestSectionEntity rSubSec2 = TestSectionEntity.builder()
                .test(rSub)
                .sectionNumber(2)
                .title("Passage 2: The Migration of Monarch Butterflies")
                .passage("<div><p>Each year, millions of Monarch butterflies travel up to 3,000 miles from Canada to Mexico. This incredible migration spans multiple generations, using environmental cues and internal compasses to navigate precisely to the same mountain forests.</p></div>")
                .build();
        TestSectionEntity rSubSec3 = TestSectionEntity.builder()
                .test(rSub)
                .sectionNumber(3)
                .title("Passage 3: The Evolution of Language")
                .passage("<div><p>Language evolution is a subject of intense academic study. Chomsky argued that humans possess an innate universal grammar, whereas other theorists emphasize the role of social interaction and cultural transmission in linguistic development.</p></div>")
                .build();
        testSectionRepository.saveAll(List.of(rSubSec1, rSubSec2, rSubSec3));

        TestQuestionEntity rSubQ1 = TestQuestionEntity.builder()
                .section(rSubSec1)
                .questionNumber(1)
                .questionType(QuestionType.TRUE_FALSE_NOT_GIVEN)
                .questionText("AI systems are only used in healthcare.")
                .correctAnswer("FALSE")
                .explanation("The text states AI is used in healthcare, autonomous vehicles, and integrated into daily life.")
                .build();
        TestQuestionEntity rSubQ2 = TestQuestionEntity.builder()
                .section(rSubSec1)
                .questionNumber(2)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionText("What do machine learning algorithms analyze to make predictions?")
                .options("[\"A. Human behaviors\", \"B. Vast amounts of data\", \"C. Financial markets\"]")
                .correctAnswer("B")
                .explanation("The text says machine learning algorithms analyze vast amounts of data.")
                .build();
        TestQuestionEntity rSubQ3 = TestQuestionEntity.builder()
                .section(rSubSec2)
                .questionNumber(3)
                .questionType(QuestionType.TRUE_FALSE_NOT_GIVEN)
                .questionText("The Monarch butterfly migration is completed by a single insect.")
                .correctAnswer("FALSE")
                .explanation("The text states that the migration spans multiple generations.")
                .build();
        TestQuestionEntity rSubQ4 = TestQuestionEntity.builder()
                .section(rSubSec3)
                .questionNumber(4)
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionText("Chomsky proposed that humans are born with a universal _____")
                .correctAnswer("grammar")
                .explanation("The passage says Chomsky argued humans possess an innate universal grammar.")
                .build();
        testQuestionRepository.saveAll(List.of(rSubQ1, rSubQ2, rSubQ3, rSubQ4));

        TestEntity wSub = TestEntity.builder()
                .title("Writing Subtest (IELTS Vol 1)")
                .examType(ExamType.WRITING)
                .duration(3600)
                .parentTest(ieltsPackage)
                .isPro(true)
                .build();
        testRepository.save(wSub);

        TestSectionEntity wSubSec1 = TestSectionEntity.builder()
                .test(wSub)
                .sectionNumber(1)
                .title("Task 1: Describe the Line Graph")
                .passage("The graph below shows the changes in oil consumption in four countries between 2000 and 2015. Summarize the main trends.")
                .build();
        TestSectionEntity wSubSec2 = TestSectionEntity.builder()
                .test(wSub)
                .sectionNumber(2)
                .title("Task 2: Essay Writing")
                .passage("With the rise of social media, face-to-face communication is decreasing. Do you agree that the advantages outweigh the disadvantages?")
                .build();
        testSectionRepository.saveAll(List.of(wSubSec1, wSubSec2));

        TestEntity sSub = TestEntity.builder()
                .title("Speaking Subtest (IELTS Vol 1)")
                .examType(ExamType.SPEAKING)
                .duration(900)
                .parentTest(ieltsPackage)
                .isPro(true)
                .build();
        testRepository.save(sSub);

        TestSectionEntity sSubSec1 = TestSectionEntity.builder()
                .test(sSub)
                .sectionNumber(1)
                .title("Part 1: Study and Work")
                .passage("What are you studying? Do you prefer studying in the morning or in the evening?")
                .build();
        TestSectionEntity sSubSec2 = TestSectionEntity.builder()
                .test(sSub)
                .sectionNumber(2)
                .title("Part 2: Cue Card")
                .cueCard("Describe a memorable holiday you had. You should say:\n- Where you went\n- Who you went with\n- What you did\n- And explain why it was memorable.")
                .build();
        TestSectionEntity sSubSec3 = TestSectionEntity.builder()
                .test(sSub)
                .sectionNumber(3)
                .title("Part 3: Discussion")
                .passage("Let's talk about tourism. In what ways does tourism benefit local communities? Can it have negative impacts?")
                .build();
        testSectionRepository.saveAll(List.of(sSubSec1, sSubSec2, sSubSec3));
    }

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));
    }

    private SkillType getSkillTypeFromExamType(ExamType examType) {
        return switch (examType) {
            case LISTENING -> SkillType.LISTENING;
            case READING -> SkillType.READING;
            case WRITING -> SkillType.WRITING;
            case SPEAKING -> SkillType.SPEAKING;
            default -> throw new AppException(ErrorCode.BAD_REQUEST, "Cannot map ExamType " + examType + " to SkillType directly.");
        };
    }

    // ─── Admin CRUD ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TestDetailDTO createTest(com.fpt.website_prepme.model.dto.AdminCreateTestRequest request) {
        TestEntity entity = TestEntity.builder()
                .title(request.getTitle())
                .examType(request.getExamType())
                .duration(request.getDuration() != null ? request.getDuration() : 3600)
                .isPro(Boolean.TRUE.equals(request.getIsPro()))
                .description(request.getDescription())
                .build();
        TestEntity saved = testRepository.save(entity);
        return TestDetailDTO.toDto(saved, false);
    }

    @Override
    @Transactional
    public TestDetailDTO updateTest(Long id, com.fpt.website_prepme.model.dto.AdminCreateTestRequest request) {
        TestEntity entity = testRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Test not found with id: " + id));
        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getExamType() != null) entity.setExamType(request.getExamType());
        if (request.getDuration() != null) entity.setDuration(request.getDuration());
        if (request.getIsPro() != null) entity.setIsPro(request.getIsPro());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        TestEntity saved = testRepository.save(entity);
        return TestDetailDTO.toDto(saved, false);
    }

    @Override
    @Transactional
    public void deleteTest(Long id) {
        TestEntity entity = testRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Test not found with id: " + id));
        entity.softDelete();
        testRepository.save(entity);
    }

    @Override
    @Transactional
    public TestSectionDTO createSection(Long testId, com.fpt.website_prepme.model.dto.AdminCreateSectionRequest request) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Test not found with id: " + testId));
        TestSectionEntity section = TestSectionEntity.builder()
                .test(test)
                .sectionNumber(request.getSectionNumber())
                .title(request.getTitle())
                .audioUrl(request.getAudioUrl())
                .passage(request.getPassage())
                .cueCard(request.getCueCard())
                .sampleAnswer(request.getSampleAnswer())
                .build();
        TestSectionEntity saved = testSectionRepository.save(section);
        return TestSectionDTO.toDto(saved, false);
    }

    @Override
    @Transactional
    public TestSectionDTO updateSection(Long sectionId, com.fpt.website_prepme.model.dto.AdminCreateSectionRequest request) {
        TestSectionEntity section = testSectionRepository.findById(sectionId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Section not found with id: " + sectionId));
        if (request.getSectionNumber() != null) section.setSectionNumber(request.getSectionNumber());
        if (request.getTitle() != null) section.setTitle(request.getTitle());
        if (request.getAudioUrl() != null) section.setAudioUrl(request.getAudioUrl());
        if (request.getPassage() != null) section.setPassage(request.getPassage());
        if (request.getCueCard() != null) section.setCueCard(request.getCueCard());
        if (request.getSampleAnswer() != null) section.setSampleAnswer(request.getSampleAnswer());
        TestSectionEntity saved = testSectionRepository.save(section);
        return TestSectionDTO.toDto(saved, false);
    }

    @Override
    @Transactional
    public void deleteSection(Long sectionId) {
        if (!testSectionRepository.existsById(sectionId))
            throw new AppException(ErrorCode.NOT_FOUND, "Section not found with id: " + sectionId);
        testSectionRepository.deleteById(sectionId);
    }

    @Override
    @Transactional
    public TestQuestionDTO createQuestion(Long sectionId, com.fpt.website_prepme.model.dto.AdminCreateQuestionRequest request) {
        TestSectionEntity section = testSectionRepository.findById(sectionId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Section not found with id: " + sectionId));
        String optionsJson = null;
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            try { optionsJson = objectMapper.writeValueAsString(request.getOptions()); }
            catch (Exception e) { log.warn("Failed to serialize options", e); }
        }
        TestQuestionEntity question = TestQuestionEntity.builder()
                .section(section)
                .questionNumber(request.getQuestionNumber())
                .questionType(request.getQuestionType())
                .questionText(request.getQuestionText())
                .options(optionsJson)
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .build();
        TestQuestionEntity saved = testQuestionRepository.save(question);
        return TestQuestionDTO.toDto(saved, false);
    }

    @Override
    @Transactional
    public TestQuestionDTO updateQuestion(Long questionId, com.fpt.website_prepme.model.dto.AdminCreateQuestionRequest request) {
        TestQuestionEntity question = testQuestionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Question not found with id: " + questionId));
        if (request.getQuestionNumber() != null) question.setQuestionNumber(request.getQuestionNumber());
        if (request.getQuestionType() != null) question.setQuestionType(request.getQuestionType());
        if (request.getQuestionText() != null) question.setQuestionText(request.getQuestionText());
        if (request.getCorrectAnswer() != null) question.setCorrectAnswer(request.getCorrectAnswer());
        if (request.getExplanation() != null) question.setExplanation(request.getExplanation());
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            try { question.setOptions(objectMapper.writeValueAsString(request.getOptions())); }
            catch (Exception e) { log.warn("Failed to serialize options", e); }
        }
        TestQuestionEntity saved = testQuestionRepository.save(question);
        return TestQuestionDTO.toDto(saved, false);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        if (!testQuestionRepository.existsById(questionId))
            throw new AppException(ErrorCode.NOT_FOUND, "Question not found with id: " + questionId);
        testQuestionRepository.deleteById(questionId);
    }
}
