package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.ExamType;
import lombok.Data;

@Data
public class AdminCreateTestRequest {
    private String title;
    private ExamType examType;
    private Integer duration; // seconds
    private Boolean isPro;
    private String description;
    private String audioUrl;
}
