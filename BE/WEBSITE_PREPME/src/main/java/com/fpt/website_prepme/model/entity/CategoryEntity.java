package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Bảng category dùng chung cho: Vocabulary Sets/Topics, Grammar topics, v.v.
 * Phân biệt bằng `type` + `parentId` (self-referencing tree).
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryEntity extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * Phân loại category:
     * VOCAB_SET     - Bộ từ vựng gốc (Trọng tâm, ETS 2024…)
     * VOCAB_TOPIC   - Chủ đề con trong bộ từ
     * GRAMMAR_TOPIC - Dạng bài ngữ pháp (Từ loại, Động từ…)
     * OTHER         - Tùy chỉnh
     */
    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CategoryEntity parent;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CategoryEntity> children = new ArrayList<>();
}
