package com.fpt.website_prepme.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(\\+84|0)(3|5|7|8|9)\\d{8}$",
            message = "Số điện thoại không hợp lệ (VD: 0912345678)"
    )
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    @NotBlank(message = "Mật khẩu xác nhận không được để trống")
    private String confirmPassword;

    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;
}
