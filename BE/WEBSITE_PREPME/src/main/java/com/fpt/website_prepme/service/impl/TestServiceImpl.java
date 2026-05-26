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

    @Override
    @Transactional(readOnly = true)
    public TestDetailDTO getExamDetails(Long id, boolean hideAnswers) {
        TestEntity entity = testRepository.findById(id)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Exam not found or has been deleted"));
        return TestDetailDTO.toDto(entity, hideAnswers);
    }

    @Override
    @Transactional
    public PracticeHistoryDTO submitExam(Long id, TestSubmitRequest request) {
        UserEntity currentUser = getCurrentUser();
        TestEntity test = testRepository.findById(id)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Exam not found"));

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

        PracticeHistoryEntity practiceHistory = PracticeHistoryEntity.builder()
                .user(currentUser)
                .test(test)
                .testTitle(test.getTitle())
                .skillType(skillType)
                .score(score)
                .completionTime(request.getCompletionTime())
                .answers(userAnswersJson)
                .submissionContent(request.getSubmissionContent())
                .recordingUrl(request.getRecordingUrl())
                .status(request.getStatus() != null ? request.getStatus() : PracticeStatus.COMPLETED)
                .build();

        PracticeHistoryEntity saved = practiceHistoryRepository.save(practiceHistory);
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
                .audioUrl("https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3")
                .description("Official Cambridge 18 Practice Listening Test 1. Standard IELTS audio player and 40 fill-in-the-blank questions.")
                .build();
        testRepository.save(listening);

        TestSectionEntity lSec1 = TestSectionEntity.builder()
                .test(listening)
                .sectionNumber(1)
                .title("Part 1: Inquiry about Hotel Booking")
                .build();
        testSectionRepository.save(lSec1);

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
        testQuestionRepository.saveAll(List.of(lQ1, lQ2));


        // 2. READING EXAM
        TestEntity reading = TestEntity.builder()
                .title("Cambridge 18 Academic Reading Test 1")
                .examType(ExamType.READING)
                .duration(3600)
                .description("Official Cambridge 18 Practice Reading Test 1. Contains 3 passages with matching headings and true/false/not given.")
                .build();
        testRepository.save(reading);

        TestSectionEntity rSec1 = TestSectionEntity.builder()
                .test(reading)
                .sectionNumber(1)
                .title("Passage 1: The Rise of Forest Bathing")
                .passage("<div><p>Forest bathing, or Shinrin-yoku, is a practice that originated in Japan in the 1980s. It involves spending quiet, mindful time in a forest, absorbing the atmosphere through the senses. Scientific research shows that this practice reduces stress hormones, lowers blood pressure, and improves immune function.</p></div>")
                .build();
        testSectionRepository.save(rSec1);

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
        testQuestionRepository.saveAll(List.of(rQ1, rQ2));


        // 3. WRITING EXAM
        TestEntity writing = TestEntity.builder()
                .title("IELTS Practice Academic Writing Test 1")
                .examType(ExamType.WRITING)
                .duration(3600)
                .description("Writing mock exam. Consists of Task 1 (Bar Chart description) and Task 2 (Essay writing).")
                .build();
        testRepository.save(writing);

        TestSectionEntity wSec1 = TestSectionEntity.builder()
                .test(writing)
                .sectionNumber(1)
                .title("Task 1: Describe the Bar Chart")
                .passage("The chart below shows the percentage of households with internet access in different countries between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.")
                .build();
        TestSectionEntity wSec2 = TestSectionEntity.builder()
                .test(writing)
                .sectionNumber(2)
                .title("Task 2: Essay Writing")
                .passage("Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your opinion. Write at least 250 words.")
                .build();
        testSectionRepository.saveAll(List.of(wSec1, wSec2));


        // 4. SPEAKING EXAM
        TestEntity speaking = TestEntity.builder()
                .title("IELTS Speaking Mock Test 1")
                .examType(ExamType.SPEAKING)
                .duration(900)
                .description("Standard IELTS Speaking exam structure including Part 1 introduction, Part 2 cue card description, and Part 3 discussion.")
                .build();
        testRepository.save(speaking);

        TestSectionEntity sSec1 = TestSectionEntity.builder()
                .test(speaking)
                .sectionNumber(1)
                .title("Part 1: Introduction & Interview")
                .passage("Let's talk about your hometown. Where is your hometown? What do you like most about it?")
                .build();
        TestSectionEntity sSec2 = TestSectionEntity.builder()
                .test(speaking)
                .sectionNumber(2)
                .title("Part 2: Cue Card")
                .cueCard("Describe a book you read recently that you found interesting. You should say: \n- What book it is \n- When you read it \n- What it is about \n- And explain why you found it interesting.")
                .build();
        TestSectionEntity sSec3 = TestSectionEntity.builder()
                .test(speaking)
                .sectionNumber(3)
                .title("Part 3: Discussion")
                .passage("Let's discuss reading habits. Do you think electronic books will completely replace paper books in the future? Why?")
                .build();
        testSectionRepository.saveAll(List.of(sSec1, sSec2, sSec3));


        // 5. COMPOSITE IELTS EXAM
        TestEntity ieltsPackage = TestEntity.builder()
                .title("IELTS Academic Practice Exam Volume 1 (Full Test)")
                .examType(ExamType.IELTS)
                .duration(9900)
                .description("Composite exam including all 4 skills: Listening, Reading, Writing, and Speaking.")
                .build();
        testRepository.save(ieltsPackage);

        // Bind the child subtests to the main IELTS composite exam
        TestEntity lSub = TestEntity.builder()
                .title("Listening Subtest (IELTS Vol 1)")
                .examType(ExamType.LISTENING)
                .duration(1800)
                .parentTest(ieltsPackage)
                .build();
        testRepository.save(lSub);

        TestEntity rSub = TestEntity.builder()
                .title("Reading Subtest (IELTS Vol 1)")
                .examType(ExamType.READING)
                .duration(3600)
                .parentTest(ieltsPackage)
                .build();
        testRepository.save(rSub);

        TestEntity wSub = TestEntity.builder()
                .title("Writing Subtest (IELTS Vol 1)")
                .examType(ExamType.WRITING)
                .duration(3600)
                .parentTest(ieltsPackage)
                .build();
        testRepository.save(wSub);

        TestEntity sSub = TestEntity.builder()
                .title("Speaking Subtest (IELTS Vol 1)")
                .examType(ExamType.SPEAKING)
                .duration(900)
                .parentTest(ieltsPackage)
                .build();
        testRepository.save(sSub);
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
}
