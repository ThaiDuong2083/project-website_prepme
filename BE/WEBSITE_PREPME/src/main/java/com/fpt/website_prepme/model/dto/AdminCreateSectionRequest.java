package com.fpt.website_prepme.model.dto;

import lombok.Data;

@Data
public class AdminCreateSectionRequest {
    private Integer sectionNumber;
    private String title;
    private String audioUrl;
    private String passage;
    private String cueCard;
    private String sampleAnswer;
}
