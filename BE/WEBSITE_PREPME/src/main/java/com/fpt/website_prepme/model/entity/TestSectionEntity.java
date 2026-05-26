package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_sections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSectionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private TestEntity test;

    @Column(name = "section_number", nullable = false)
    private Integer sectionNumber; // e.g. 1, 2, 3, 4

    @Column(name = "title", length = 255)
    private String title; // e.g. "Passage 1", "Cue Card Topic"

    @Column(name = "passage", columnDefinition = "TEXT")
    private String passage; // Reading passage text/HTML or Writing prompt text

    @Column(name = "cue_card", columnDefinition = "TEXT")
    private String cueCard; // Speaking Part 2 cue card details

    @Column(name = "audio_url", length = 512)
    private String audioUrl; // Section-specific audio if any

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @OrderBy("questionNumber ASC")
    private List<TestQuestionEntity> questions = new ArrayList<>();
}
