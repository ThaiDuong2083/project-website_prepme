package com.fpt.website_prepme.service;

import com.fpt.website_prepme.enums.ExamType;
import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.model.dto.*;
import com.fpt.website_prepme.model.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface TestService {
    
    PageResponse<TestListDTO> getExams(ExamType type, String search, Pageable pageable);

    TestDetailDTO getExamDetails(Long id, boolean hideAnswers);

    PracticeHistoryDTO submitExam(Long id, TestSubmitRequest request);

    PageResponse<PracticeHistoryDTO> getPracticeHistory(SkillType skillType, Pageable pageable);

    PracticeHistoryDTO getPracticeHistoryDetails(Long practiceId);

    PracticeStatisticsDTO getPracticeStatistics();

    void seedDemoExams();
}
