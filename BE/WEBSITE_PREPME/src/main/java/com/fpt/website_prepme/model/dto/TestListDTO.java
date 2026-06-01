package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.ExamType;
import com.fpt.website_prepme.model.entity.TestEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestListDTO {
    private Long id;
    private String title;
    private ExamType examType;
    private Integer duration;
    private String description;
    private int sectionCount;
    private int questionCount;
    private LocalDateTime createdAt;
    private Boolean isPro;

    public static TestListDTO toDto(TestEntity entity) {
        int count = 0;
        if (entity.getExamType().equals(ExamType.SPEAKING)){
            count = 3;
        }else if (entity.getExamType().equals(ExamType.WRITING)){
            count = 2;
        }
        return TestListDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .examType(entity.getExamType())
                .duration(entity.getDuration())
                .description(entity.getDescription())
                .sectionCount(entity.getSections() != null ? entity.getSections().size() : 0)
                .questionCount(count == 0 ? entity.getQuestionCount() : count)
                .createdAt(entity.getCreatedAt())
                .isPro(entity.getIsPro())
                .build();
    }
}
