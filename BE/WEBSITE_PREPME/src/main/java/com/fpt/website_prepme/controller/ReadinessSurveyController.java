package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.survey.SurveyRequest;
import com.fpt.website_prepme.model.dto.survey.UpdateGoalsRequest;
import com.fpt.website_prepme.model.dto.survey.UserGoalsResponse;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.ReadinessSurveyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/survey")
@RequiredArgsConstructor
@Tag(name = "Survey")
public class ReadinessSurveyController {

    private final ReadinessSurveyService readinessSurveyService;

    @PostMapping("/readiness")
    @Operation(summary = "Gửi khảo sát – chỉ thực hiện 1 lần khi đăng ký lần đầu")
    public ResponseEntity<ApiResponse<UserGoalsResponse>> submitSurvey(
            @Valid @RequestBody SurveyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(readinessSurveyService.submitSurvey(request)));
    }

    @GetMapping("/goals")
    @Operation(summary = "Lấy mục tiêu IELTS hiện tại")
    public ResponseEntity<ApiResponse<UserGoalsResponse>> getSurveyGoals() {
        return ResponseEntity.ok(ApiResponse.success(readinessSurveyService.getSurveyGoals()));
    }

    @PutMapping("/goals")
    @Operation(summary = "Cập nhật mục tiêu IELTS")
    public ResponseEntity<ApiResponse<UserGoalsResponse>> updateGoals(
            @RequestBody UpdateGoalsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(readinessSurveyService.updateGoals(request)));
    }
}
