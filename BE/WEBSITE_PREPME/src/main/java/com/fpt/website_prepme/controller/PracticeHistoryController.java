package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.model.dto.PracticeHistoryDTO;
import com.fpt.website_prepme.model.dto.PracticeStatisticsDTO;
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
@RequestMapping("/practice-histories")
@RequiredArgsConstructor
@Tag(name = "Practice Histories", description = "User Practice History and Analytics Dashboard APIs")
@SecurityRequirement(name = "bearerAuth")
public class PracticeHistoryController {

    private final TestService testService;

    @GetMapping
    @Operation(summary = "Get user practice history list (paginated, filterable by SkillType)")
    public ResponseEntity<ApiResponse<PageResponse<PracticeHistoryDTO>>> getPracticeHistory(
            @RequestParam(required = false) SkillType skillType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(testService.getPracticeHistory(skillType, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed review of a specific practice session, revealing correct answers and explanations")
    public ResponseEntity<ApiResponse<PracticeHistoryDTO>> getPracticeHistoryDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(testService.getPracticeHistoryDetails(id)));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get user practice statistics for the analytics dashboard")
    public ResponseEntity<ApiResponse<PracticeStatisticsDTO>> getPracticeStatistics() {
        return ResponseEntity.ok(ApiResponse.success(testService.getPracticeStatistics()));
    }
}
