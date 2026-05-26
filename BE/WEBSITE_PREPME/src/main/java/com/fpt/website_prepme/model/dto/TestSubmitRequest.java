package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.PracticeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSubmitRequest {
    private Map<String, String> answers; // e.g. {"1": "TRUE", "2": "A"} or questionId -> answer
    private String submissionContent; // Writing essay text or Speaking transcript
    private String recordingUrl; // speaking recording URL
    private Integer completionTime; // in seconds
    private PracticeStatus status; // DRAFT or COMPLETED (defaults to COMPLETED if null)
}
