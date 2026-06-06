package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.survey.SurveyRequest;
import com.fpt.website_prepme.model.dto.survey.UpdateGoalsRequest;
import com.fpt.website_prepme.model.dto.survey.UserGoalsResponse;

public interface ReadinessSurveyService {
    UserGoalsResponse submitSurvey(SurveyRequest request);
    UserGoalsResponse getSurveyGoals();
    UserGoalsResponse updateGoals(UpdateGoalsRequest request);
}
