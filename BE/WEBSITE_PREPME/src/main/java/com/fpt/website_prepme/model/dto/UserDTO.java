package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.AuthProvider;
import com.fpt.website_prepme.enums.MembershipType;
import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.model.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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
    private MembershipType membershipType;
    private java.time.LocalDateTime proSubscribedAt;
    private java.time.LocalDateTime subscriptionExpiresAt;
    private boolean surveyCompleted;
    private Double ieltsTarget;
    private Double currentLevel;
    private List<SkillType> weakSkills;
    private int visitCount;

    public static UserDTO toEntity(UserEntity user) {
        String role = user.getRoles().stream().findFirst().map(r -> r.getName()).orElse("USER");

        List<SkillType> weakSkills = Collections.emptyList();
        if (user.getWeakSkills() != null && !user.getWeakSkills().isBlank()) {
            weakSkills = Arrays.stream(user.getWeakSkills().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(SkillType::valueOf)
                    .collect(Collectors.toList());
        }

        return UserDTO.builder()
                .id(String.valueOf(user.getId()))
                .phone(user.getPhone())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(role)
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .membershipType(user.getMembershipType())
                .proSubscribedAt(user.getProSubscribedAt())
                .subscriptionExpiresAt(user.getSubscriptionExpiresAt())
                .surveyCompleted(user.isSurveyCompleted())
                .ieltsTarget(user.getIeltsTarget())
                .currentLevel(user.getCurrentLevel())
                .weakSkills(weakSkills)
                .visitCount(user.getVisitCount())
                .build();
    }
}
