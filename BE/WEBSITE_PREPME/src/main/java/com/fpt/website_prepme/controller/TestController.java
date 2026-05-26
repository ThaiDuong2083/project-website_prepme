package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.enums.ExamType;
import com.fpt.website_prepme.model.dto.*;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.service.TestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "IELTS Exam Practice System APIs (Listening, Reading, Writing, Speaking, IELTS)")
@SecurityRequirement(name = "bearerAuth")
public class TestController {

    private final TestService testService;

    @GetMapping
    @Operation(summary = "Get list of IELTS exams (paginated, filterable by ExamType and title keyword)")
    public ResponseEntity<ApiResponse<PageResponse<TestListDTO>>> getExams(
            @RequestParam(required = false) ExamType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(testService.getExams(type, search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a specific exam. Correct answers and explanations are hidden.")
    public ResponseEntity<ApiResponse<TestDetailDTO>> getExamDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(testService.getExamDetails(id, true)));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit practice responses for scoring (Reading/Listening) or saving (Writing/Speaking)")
    public ResponseEntity<ApiResponse<PracticeHistoryDTO>> submitExam(
            @PathVariable Long id,
            @RequestBody TestSubmitRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Exam submitted successfully", testService.submitExam(id, request)));
    }

    @PostMapping("/seed")
    @Operation(summary = "Seed initial IELTS mock exams (Listening, Reading, Writing, Speaking, IELTS Vol 1)")
    public ResponseEntity<ApiResponse<String>> seedDemoExams() {
        testService.seedDemoExams();
        return ResponseEntity.ok(ApiResponse.success("Mock exams seeded successfully"));
    }
}
