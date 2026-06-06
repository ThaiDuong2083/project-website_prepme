package com.fpt.website_prepme.model.dto.survey;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fpt.website_prepme.enums.SkillType;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateGoalsRequest {
    private Double ieltsTarget;
    private Double currentLevel;
    private List<SkillType> weakSkills;
}
