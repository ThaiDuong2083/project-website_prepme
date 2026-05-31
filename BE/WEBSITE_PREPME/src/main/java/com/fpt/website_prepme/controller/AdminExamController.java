package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.*;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.TestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/exams")
@RequiredArgsConstructor
@Tag(name = "Admin Exams", description = "Admin CRUD APIs for managing Exams, Sections and Questions")
@SecurityRequirement(name = "bearerAuth")
public class AdminExamController {

    private final TestService testService;

    // ─── Tests ─────────────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create a new test")
    public ResponseEntity<ApiResponse<TestDetailDTO>> createTest(@RequestBody AdminCreateTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Test created successfully", testService.createTest(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing test")
    public ResponseEntity<ApiResponse<TestDetailDTO>> updateTest(
            @PathVariable Long id,
            @RequestBody AdminCreateTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Test updated successfully", testService.updateTest(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a test")
    public ResponseEntity<ApiResponse<String>> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test deleted successfully"));
    }

    // ─── Sections ──────────────────────────────────────────────────────────────

    @PostMapping("/{testId}/sections")
    @Operation(summary = "Add a section to a test")
    public ResponseEntity<ApiResponse<TestSectionDTO>> createSection(
            @PathVariable Long testId,
            @RequestBody AdminCreateSectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Section created successfully", testService.createSection(testId, request)));
    }

    @PutMapping("/sections/{sectionId}")
    @Operation(summary = "Update an existing section")
    public ResponseEntity<ApiResponse<TestSectionDTO>> updateSection(
            @PathVariable Long sectionId,
            @RequestBody AdminCreateSectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Section updated successfully", testService.updateSection(sectionId, request)));
    }

    @DeleteMapping("/sections/{sectionId}")
    @Operation(summary = "Delete a section")
    public ResponseEntity<ApiResponse<String>> deleteSection(@PathVariable Long sectionId) {
        testService.deleteSection(sectionId);
        return ResponseEntity.ok(ApiResponse.success("Section deleted successfully"));
    }

    // ─── Questions ─────────────────────────────────────────────────────────────

    @PostMapping("/sections/{sectionId}/questions")
    @Operation(summary = "Add a question to a section")
    public ResponseEntity<ApiResponse<TestQuestionDTO>> createQuestion(
            @PathVariable Long sectionId,
            @RequestBody AdminCreateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Question created successfully", testService.createQuestion(sectionId, request)));
    }

    @PutMapping("/questions/{questionId}")
    @Operation(summary = "Update an existing question")
    public ResponseEntity<ApiResponse<TestQuestionDTO>> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody AdminCreateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", testService.updateQuestion(questionId, request)));
    }

    @DeleteMapping("/questions/{questionId}")
    @Operation(summary = "Delete a question")
    public ResponseEntity<ApiResponse<String>> deleteQuestion(@PathVariable Long questionId) {
        testService.deleteQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully"));
    }
}
