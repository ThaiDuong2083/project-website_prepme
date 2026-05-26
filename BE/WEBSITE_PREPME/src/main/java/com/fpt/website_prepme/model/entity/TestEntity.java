package com.fpt.website_prepme.model.entity;

import com.fpt.website_prepme.enums.ExamType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestEntity extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false, length = 20)
    private ExamType examType;

    @Column(name = "duration")
    private Integer duration; // Default duration in seconds (e.g. 1800 for 30 minutes)

    @Column(name = "audio_url", length = 512)
    private String audioUrl; // Mainly for listening exams

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_test_id")
    private TestEntity parentTest; // Self-reference for composite IELTS exams

    @OneToMany(mappedBy = "parentTest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TestEntity> childTests = new ArrayList<>();

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @OrderBy("sectionNumber ASC")
    private List<TestSectionEntity> sections = new ArrayList<>();
}
