package com.fpt.website_prepme.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;


@Data
public class LoginRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(\\+84|0)(3|5|7|8|9)\\d{8}$",
            message = "Số điện thoại không hợp lệ (VD: 0912345678)")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
