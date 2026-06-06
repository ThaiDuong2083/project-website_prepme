package com.fpt.website_prepme.model.dto.survey;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fpt.website_prepme.enums.SkillType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SurveyRequest {

    @NotNull(message = "Mục tiêu IELTS không được để trống")
    @DecimalMin(value = "0.0") @DecimalMax(value = "9.0")
    private Double ieltsTarget;

    @DecimalMin(value = "0.0") @DecimalMax(value = "9.0")
    private Double currentLevel = 0.0;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 kỹ năng muốn cải thiện")
    private List<SkillType> weakSkills;
}
