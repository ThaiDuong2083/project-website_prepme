package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.CategoryEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDTO {
    private Long id;
    private String name;
    private String type;
    private Long parentId;
    private Integer wordCount;
    private String description;
    private String status;

    public static CategoryDTO toDto(CategoryEntity entity) {
        return CategoryDTO.builder()
            .id(entity.getId())
            .name(entity.getName())
            .type(entity.getType())
            .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
            .description(entity.getDescription())
            .status("NOT_LEARNED")
            .build();
    }
}
