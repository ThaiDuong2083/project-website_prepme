package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestQuestionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private TestSectionEntity section;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber; // e.g. 1 to 40

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    private QuestionType questionType;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "options", columnDefinition = "TEXT")
    private String options; // JSON string of choices, e.g. ["Choice A", "Choice B", "Choice C"]

    @Column(name = "correct_answer", length = 255)
    private String correctAnswer; // Correct answer for auto-checking

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation; // Explanation for why it's correct
}
