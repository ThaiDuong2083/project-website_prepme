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
}
