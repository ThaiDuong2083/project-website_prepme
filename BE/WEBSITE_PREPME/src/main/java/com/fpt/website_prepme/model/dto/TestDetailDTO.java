package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.ExamType;
import com.fpt.website_prepme.model.entity.TestEntity;
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
public class TestDetailDTO {
    private Long id;
    private String title;
    private ExamType examType;
    private Integer duration;
    private String audioUrl;
    private String description;
    private List<TestSectionDTO> sections;
    private List<TestDetailDTO> childTests; // Used for composite IELTS exams

    public static TestDetailDTO toDto(TestEntity entity, boolean hideAnswers) {
        List<TestSectionDTO> sectionDTOs = entity.getSections() != null
                ? entity.getSections().stream()
                    .map(s -> TestSectionDTO.toDto(s, hideAnswers))
                    .toList()
                : Collections.emptyList();

        List<TestDetailDTO> childrenList = entity.getChildTests() != null
                ? entity.getChildTests().stream()
                    .map(child -> TestDetailDTO.toDto(child, hideAnswers))
                    .toList()
                : Collections.emptyList();

        return TestDetailDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .examType(entity.getExamType())
                .duration(entity.getDuration())
                .audioUrl(entity.getAudioUrl())
                .description(entity.getDescription())
                .sections(sectionDTOs)
                .childTests(childrenList)
                .build();
    }
}
