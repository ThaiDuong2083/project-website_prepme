package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.ExampleEntity.ExampleStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExampleResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private ExampleStatus status;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
