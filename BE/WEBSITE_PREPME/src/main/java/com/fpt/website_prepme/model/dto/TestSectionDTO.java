package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.TestSectionEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSectionDTO {
    private Long id;
    private Integer sectionNumber;
    private String title;
    private String passage;
    private String cueCard;
    private String audioUrl;
    private List<TestQuestionDTO> questions;

    public static TestSectionDTO toDto(TestSectionEntity entity, boolean hideAnswers) {
        List<TestQuestionDTO> questionDTOs = entity.getQuestions() != null
                ? entity.getQuestions().stream()
                    .map(q -> TestQuestionDTO.toDto(q, hideAnswers))
                    .toList()
                : Collections.emptyList();

        return TestSectionDTO.builder()
                .id(entity.getId())
                .sectionNumber(entity.getSectionNumber())
                .title(entity.getTitle())
                .passage(entity.getPassage())
                .cueCard(entity.getCueCard())
                .audioUrl(entity.getAudioUrl())
                .questions(questionDTOs)
                .build();
    }
}
