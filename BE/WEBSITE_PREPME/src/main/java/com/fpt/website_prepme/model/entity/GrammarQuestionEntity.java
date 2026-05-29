package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grammar_questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrammarQuestionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private CategoryEntity topic; // Maps to CategoryEntity with type = 'GRAMMAR_TOPIC'

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "options", columnDefinition = "TEXT", nullable = false)
    private String options; // JSON Array: ["Choice A", "Choice B", "Choice C"]

    @Column(name = "answer", length = 255, nullable = false)
    private String answer; // The correct option string

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "translation", columnDefinition = "TEXT")
    private String translation;

    @Column(name = "vocabulary", columnDefinition = "TEXT")
    private String vocabulary; // JSON Array: [{"word":"...", "meaning":"..."}]
}
