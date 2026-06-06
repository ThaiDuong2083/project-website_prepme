package com.fpt.website_prepme.model.dto.survey;

import com.fpt.website_prepme.enums.SkillType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserGoalsResponse {
    private Double ieltsTarget;
    private Double currentLevel;
    private List<SkillType> weakSkills;
    private boolean surveyCompleted;
}
