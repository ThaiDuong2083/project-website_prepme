package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_visits")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVisitEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}
