package com.fpt.website_prepme.model.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bảng lưu từ vựng yêu thích của người dùng.
 * Unique constraint: mỗi user chỉ có thể lưu 1 từ 1 lần.
 */
@Entity
@Table(
    name = "favorite_vocabulary",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "word_id"}),
    indexes = {
        @Index(name = "idx_fav_user", columnList = "user_id"),
        @Index(name = "idx_fav_word", columnList = "word_id")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteVocabularyEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private VocabularyWordEntity word;
}
