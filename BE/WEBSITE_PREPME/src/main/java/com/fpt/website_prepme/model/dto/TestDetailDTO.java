package com.fpt.website_prepme.model.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fpt.website_prepme.enums.ExamType;
import com.fpt.website_prepme.model.entity.TestEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
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
    private Boolean isPro;

    public static TestDetailDTO toDto(TestEntity entity, boolean hideAnswers) {
        List<TestSectionDTO> sectionDTOs = Collections.emptyList();
        String firstAudioUrl = null;
        if (entity.getSections() != null) {
            java.util.List<com.fpt.website_prepme.model.entity.TestSectionEntity> sortedSections = new ArrayList<>(entity.getSections());
            sortedSections.sort(java.util.Comparator.comparing(
                s -> s.getSectionNumber() != null ? s.getSectionNumber() : 0
            ));

            List<TestSectionDTO> list = new ArrayList<>();
            for (com.fpt.website_prepme.model.entity.TestSectionEntity sectionEntity : sortedSections) {
                TestSectionDTO sectionDto = TestSectionDTO.toDto(sectionEntity, hideAnswers);
                list.add(sectionDto);
            }
            sectionDTOs = list;
            if (!sortedSections.isEmpty()) {
                firstAudioUrl = sortedSections.get(0).getAudioUrl();
            }
        }

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
                .audioUrl(firstAudioUrl)
                .description(entity.getDescription())
                .sections(sectionDTOs)
                .childTests(childrenList)
                .isPro(entity.getIsPro())
                .build();
    }
}
