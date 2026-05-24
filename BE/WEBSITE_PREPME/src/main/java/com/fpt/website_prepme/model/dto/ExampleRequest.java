package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.ExampleEntity.ExampleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExampleRequest {

    @NotBlank(message = "Code is required")
    @Size(max = 50, message = "Code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    private String description;

    private ExampleStatus status;
}
