package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bảng từ vựng IELTS.
 * Mỗi từ thuộc về 1 topic (CategoryEntity với type=VOCAB_TOPIC).
 */
@Entity
@Table(name = "vocabulary_words", indexes = {
        @Index(name = "idx_word_category", columnList = "category_id"),
        @Index(name = "idx_word_level",    columnList = "level"),
        @Index(name = "idx_word_deleted",  columnList = "is_deleted")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyWordEntity extends BaseEntity {

    @Column(name = "word", nullable = false, length = 150)
    private String word;

    /** noun / verb / adj / adv / phrase */
    @Column(name = "word_type", length = 30)
    private String wordType;

    @Column(name = "pronunciation", length = 150)
    private String pronunciation;

    @Column(name = "meaning", nullable = false, columnDefinition = "TEXT")
    private String meaning;

    @Column(name = "example_en", columnDefinition = "TEXT")
    private String exampleEn;

    @Column(name = "example_vi", columnDefinition = "TEXT")
    private String exampleVi;

    @Column(name = "level", length = 20)
    private String level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;
}
