package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.UserDTO;
import com.fpt.website_prepme.model.dto.PhoneUpdateRequest;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.fpt.website_prepme.model.dto.UserVisitResponseDTO;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for user management and profiles")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/check-phone")
    @Operation(summary = "Check if currently logged-in user has a phone number")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkPhone() {
        boolean hasPhone = userService.checkPhone();
        return ResponseEntity.ok(ApiResponse.success(Map.of("hasPhone", hasPhone)));
    }

    @PutMapping("/phone")
    @Operation(summary = "Update phone number for the currently logged-in user")
    public ResponseEntity<ApiResponse<UserDTO>> updatePhone(
            @Valid @RequestBody PhoneUpdateRequest request) {
        UserDTO updatedUser = userService.updatePhone(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật số điện thoại thành công", updatedUser));
    }

    @PostMapping("/visit")
    @Operation(summary = "Increment visit count for the currently logged-in user")
    public ResponseEntity<ApiResponse<UserDTO>> incrementVisit() {
        UserDTO updatedUser = userService.incrementVisit();
        return ResponseEntity.ok(ApiResponse.success("Ghi nhận lượt truy cập thành công", updatedUser));
    }

    @GetMapping("/visits/total")
    @Operation(summary = "Get total visit counts in a period filtered by createdAt range")
    public ResponseEntity<ApiResponse<Long>> getTotalVisits(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        long total = userService.getTotalVisits(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/visits/list")
    @Operation(summary = "Get paginated visit details in a period filtered by createdAt range")
    public ResponseEntity<ApiResponse<Page<UserVisitResponseDTO>>> getAllVisits(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<UserVisitResponseDTO> visits = userService.getAllVisits(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(visits));
    }

    @GetMapping("/visits/search")
    @Operation(summary = "Search visits of a specific user with pagination filtered by createdAt range")
    public ResponseEntity<ApiResponse<Page<UserVisitResponseDTO>>> searchVisitsByUser(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<UserVisitResponseDTO> visits = userService.searchVisitsByUser(phone, email, username, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(visits));
    }
}
