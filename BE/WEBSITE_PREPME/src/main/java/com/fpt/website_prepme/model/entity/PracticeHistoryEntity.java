package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.PracticeStatus;
import com.fpt.website_prepme.enums.SkillType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "practice_histories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeHistoryEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_type", nullable = false, length = 20)
    private SkillType skillType;

    @Column(name = "test_title", length = 255)
    private String testTitle;

    @Column(name = "score")
    private Double score;

    @Column(name = "completion_time")
    private Integer completionTime; // In seconds

    @Column(name = "answers", columnDefinition = "TEXT")
    private String answers; // JSON representation of user answers

    @Column(name = "submission_content", columnDefinition = "TEXT")
    private String submissionContent; // Writing draft/submission or speaking transcription

    @Column(name = "recording_url", length = 512)
    private String recordingUrl; // Speaking recording file URL

    @Column(name = "ai_analysis", columnDefinition = "TEXT")
    private String aiAnalysis; // AI feedback details, grammar corrections, suggestions, model answer

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PracticeStatus status = PracticeStatus.DRAFT;
}
