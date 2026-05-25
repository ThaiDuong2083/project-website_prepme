package com.fpt.website_prepme.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FileCreateRequest {
    @NotBlank(message = "Title must not be blank")
    private String title;

    private String category;
}
