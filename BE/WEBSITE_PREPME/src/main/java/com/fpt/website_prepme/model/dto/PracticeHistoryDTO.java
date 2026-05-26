package com.fpt.website_prepme.model.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.enums.PracticeStatus;
import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.model.entity.PracticeHistoryEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class PracticeHistoryDTO {
    private Long id;
    private Long userId;
    private Long testId;
    private String testTitle;
    private SkillType skillType;
    private Double score;
    private Integer completionTime;
    private Map<String, String> answers;
    private String submissionContent;
    private String recordingUrl;
    private String aiAnalysis;
    private PracticeStatus status;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static PracticeHistoryDTO toDto(PracticeHistoryEntity entity) {
        Map<String, String> answersMap = Collections.emptyMap();
        if (entity.getAnswers() != null && !entity.getAnswers().trim().isEmpty()) {
            try {
                answersMap = objectMapper.readValue(entity.getAnswers(), new TypeReference<Map<String, String>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse user answers JSON for practice history ID {}: {}", entity.getId(), e.getMessage());
            }
        }

        return PracticeHistoryDTO.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .testId(entity.getTest() != null ? entity.getTest().getId() : null)
                .testTitle(entity.getTestTitle() != null ? entity.getTestTitle() : (entity.getTest() != null ? entity.getTest().getTitle() : "Practice"))
                .skillType(entity.getSkillType())
                .score(entity.getScore())
                .completionTime(entity.getCompletionTime())
                .answers(answersMap)
                .submissionContent(entity.getSubmissionContent())
                .recordingUrl(entity.getRecordingUrl())
                .aiAnalysis(entity.getAiAnalysis())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
