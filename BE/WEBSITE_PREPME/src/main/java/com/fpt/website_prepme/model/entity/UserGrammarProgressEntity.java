package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "user_grammar_progress",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "question_id"})
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGrammarProgressEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private GrammarQuestionEntity question;

    @Column(name = "times_done", nullable = false)
    @Builder.Default
    private Integer timesDone = 0;

    @Column(name = "times_correct", nullable = false)
    @Builder.Default
    private Integer timesCorrect = 0;

    @Column(name = "recent_choices", columnDefinition = "TEXT")
    private String recentChoices; // JSON Array: ["Choice A", "Choice B"] (Max 5 items usually)
}
