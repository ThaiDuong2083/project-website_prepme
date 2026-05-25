package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.VocabularyStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "vocabulary_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "word_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyProgressEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private VocabularyWordEntity word;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private VocabularyStatus status = VocabularyStatus.NOT_LEARNED;

    @Column(name = "attempts_count", nullable = false)
    @Builder.Default
    private Integer attemptsCount = 0;

    @Column(name = "correct_attempts", nullable = false)
    @Builder.Default
    private Integer correctAttempts = 0;
}
