package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "examples")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExampleEntity extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExampleStatus status = ExampleStatus.ACTIVE;

    public enum ExampleStatus {
        ACTIVE, INACTIVE, DRAFT
    }
}
