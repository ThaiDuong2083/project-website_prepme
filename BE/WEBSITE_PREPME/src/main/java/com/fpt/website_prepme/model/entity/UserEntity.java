package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.AuthProvider;
import jakarta.persistence.*;
import lombok.*;

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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<RoleEntity> roles = new HashSet<>();
}
