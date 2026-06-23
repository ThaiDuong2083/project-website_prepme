package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.AuthProvider;
import com.fpt.website_prepme.enums.MembershipType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "phone", unique = true, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 20)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "ielts_target")
    private Double ieltsTarget;

    @Column(name = "country_target")
    private String countryTarget;

    @Column(name = "school_target")
    private String schoolTarget;

    @Column(name = "major")
    private String major;

    @Column(name = "current_level")
    private Double currentLevel;

    @Column(name = "weak_skills", columnDefinition = "TEXT")
    private String weakSkills; // comma-separated: "LISTENING,WRITING"

    @Column(name = "readiness")
    private Double readiness;

    @Column(name = "study_hours_per_day")
    private Double studyHoursPerDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_type", nullable = false, length = 20)
    @Builder.Default
    private MembershipType membershipType = MembershipType.FREE;

    @Column(name = "pro_subscribed_at")
    private LocalDateTime proSubscribedAt;

    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;

    @Column(name = "survey_completed", nullable = false)
    @Builder.Default
    private boolean surveyCompleted = false;

    @Column(name = "visit_count")
    @Builder.Default
    private int visitCount = 0;


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<RoleEntity> roles = new HashSet<>();
}
