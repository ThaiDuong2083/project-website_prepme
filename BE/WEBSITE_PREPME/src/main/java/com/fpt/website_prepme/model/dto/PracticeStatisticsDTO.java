package com.fpt.website_prepme.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeStatisticsDTO {
    private Long totalPractices;
    private Map<String, Long> practicesBySkill;
    private Map<String, Double> averageScoreBySkill;
    private Map<String, Long> dailyFrequency; // Date string (yyyy-MM-dd) -> count of practice submissions
}
