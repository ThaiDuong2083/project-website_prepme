package com.fpt.website_prepme.model.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.enums.QuestionType;
import com.fpt.website_prepme.model.entity.TestQuestionEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class TestQuestionDTO {
    private Long id;
    private Integer questionNumber;
    private QuestionType questionType;
    private String questionText;
    private List<String> options;
    private String correctAnswer;
    private String explanation;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static TestQuestionDTO toDto(TestQuestionEntity entity, boolean hideAnswers) {
        List<String> optionsList = Collections.emptyList();
        if (entity.getOptions() != null && !entity.getOptions().trim().isEmpty()) {
            try {
                optionsList = objectMapper.readValue(entity.getOptions(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse options JSON for question ID {}: {}", entity.getId(), e.getMessage());
                optionsList = List.of(entity.getOptions()); // fallback
            }
        }

        return TestQuestionDTO.builder()
                .id(entity.getId())
                .questionNumber(entity.getQuestionNumber())
                .questionType(entity.getQuestionType())
                .questionText(entity.getQuestionText())
                .options(optionsList)
                .correctAnswer(hideAnswers ? null : entity.getCorrectAnswer())
                .explanation(hideAnswers ? null : entity.getExplanation())
                .build();
    }
}
