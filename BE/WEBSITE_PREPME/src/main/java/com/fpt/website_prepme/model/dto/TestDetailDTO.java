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
        List<String> audioUrls = parseAudioUrls(entity.getAudioUrl());

        List<TestSectionDTO> sectionDTOs = Collections.emptyList();
        if (entity.getSections() != null) {
            java.util.List<com.fpt.website_prepme.model.entity.TestSectionEntity> sortedSections = new ArrayList<>(entity.getSections());
            sortedSections.sort(java.util.Comparator.comparing(
                s -> s.getSectionNumber() != null ? s.getSectionNumber() : 0
            ));

            List<TestSectionDTO> list = new ArrayList<>();
            for (int i = 0; i < sortedSections.size(); i++) {
                com.fpt.website_prepme.model.entity.TestSectionEntity sectionEntity = sortedSections.get(i);
                TestSectionDTO sectionDto = TestSectionDTO.toDto(sectionEntity, hideAnswers);
                if (i < audioUrls.size()) {
                    sectionDto.setAudioUrl(audioUrls.get(i));
                }
                list.add(sectionDto);
            }
            sectionDTOs = list;
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
                .audioUrl(entity.getAudioUrl())
                .description(entity.getDescription())
                .sections(sectionDTOs)
                .childTests(childrenList)
                .isPro(entity.getIsPro())
                .build();
    }

    private static List<String> parseAudioUrls(String audioUrlField) {
        if (audioUrlField == null || audioUrlField.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String trimmed = audioUrlField.trim();
        // Check if JSON array
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(trimmed, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                // Fallback to comma splitting
            }
        }
        return java.util.Arrays.stream(trimmed.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
