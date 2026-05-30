package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.MembershipType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_membership_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMembershipLogEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_membership_type", nullable = false, length = 20)
    private MembershipType oldMembershipType;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_membership_type", nullable = false, length = 20)
    private MembershipType newMembershipType;

    @Column(name = "change_reason", length = 255)
    private String changeReason;
}
