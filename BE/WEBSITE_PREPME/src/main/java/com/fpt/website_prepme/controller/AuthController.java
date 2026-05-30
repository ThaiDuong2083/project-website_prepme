package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.UserDTO;
import com.fpt.website_prepme.model.dto.auth.AuthResponse;
import com.fpt.website_prepme.model.dto.auth.GoogleAuthRequest;
import com.fpt.website_prepme.model.dto.auth.LoginRequest;
import com.fpt.website_prepme.model.dto.auth.RegisterRequest;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký bằng SĐT + mật khẩu")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.created(authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập bằng SĐT + mật khẩu")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/google")
    @Operation(summary = "Đăng nhập / Đăng ký bằng Google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.loginWithGoogle(request)));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserDTO>> getMe() {
        return ResponseEntity.ok(ApiResponse.success(authService.getMe()));
    }

    @PostMapping("/upgrade")
    @Operation(summary = "Nâng cấp tài khoản lên Pro/Premium")
    public ResponseEntity<ApiResponse<UserDTO>> upgrade() {
        return ResponseEntity.ok(ApiResponse.success("Nâng cấp tài khoản thành công", authService.upgradeMembership()));
    }
}
