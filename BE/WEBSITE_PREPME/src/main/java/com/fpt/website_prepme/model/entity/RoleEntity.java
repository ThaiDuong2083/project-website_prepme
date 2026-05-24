package com.fpt.website_prepme.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleEntity extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;
    
    @Column(name = "description", length = 200)
    private String description;
}
