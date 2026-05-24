package com.fpt.website_prepme.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "Google ID Token is required")
    private String idToken;
}
