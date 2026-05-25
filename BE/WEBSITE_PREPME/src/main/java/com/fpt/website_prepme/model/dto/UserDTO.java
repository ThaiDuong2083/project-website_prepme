package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.AuthProvider;
import com.fpt.website_prepme.model.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String phone;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private AuthProvider provider;
    private String createdAt;

    public static UserDTO toEntity(UserEntity user) {
        String role = user.getRoles().stream().findFirst().map(r -> r.getName()).orElse("USER");
        return UserDTO.builder()
                .id(String.valueOf(user.getId()))
                .phone(user.getPhone())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(role)
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
