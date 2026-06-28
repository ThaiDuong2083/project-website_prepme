package com.fpt.website_prepme.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVisitResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private LocalDateTime createdAt;
}
