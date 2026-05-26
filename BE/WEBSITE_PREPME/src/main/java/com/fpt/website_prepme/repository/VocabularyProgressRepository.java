package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.VocabularyProgressEntity;
import com.fpt.website_prepme.enums.VocabularyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VocabularyProgressRepository extends JpaRepository<VocabularyProgressEntity, Long>, JpaSpecificationExecutor<VocabularyProgressEntity> {
    List<VocabularyProgressEntity> findByUserId(Long userId);
    List<VocabularyProgressEntity> findByUserIdAndStatus(Long userId, VocabularyStatus status);
    Optional<VocabularyProgressEntity> findByUserIdAndWordId(Long userId, Long wordId);
    List<VocabularyProgressEntity> findByUserIdAndWordIdIn(Long userId, List<Long> wordIds);

    /** Trả về list topicId (category level) có ít nhất 1 từ đang LEARNING của user */
    @Query("""
        SELECT DISTINCT p.word.category.id
        FROM VocabularyProgressEntity p
        WHERE p.user.id = :userId
          AND p.word.category.id IN :topicIds
          AND p.status = 'LEARNING'
        """)
    List<Long> findTopicIdsWithLearningStatus(
        @Param("userId") Long userId,
        @Param("topicIds") List<Long> topicIds
    );

    /** Tính số từ LEARNED theo từng topic (category) */
    @Query("""
        SELECT new com.fpt.website_prepme.model.dto.CategoryCountDTO(
            p.word.category.id,
            COUNT(p)
        )
        FROM VocabularyProgressEntity p
        WHERE p.user.id = :userId
          AND p.word.category.id IN :topicIds
          AND p.status = 'LEARNED'
        GROUP BY p.word.category.id
        """)
    List<com.fpt.website_prepme.model.dto.CategoryCountDTO> countLearnedWordsGroupByCategory(
        @Param("userId") Long userId,
        @Param("topicIds") List<Long> topicIds
    );

    /** Trả về list setId (category.parent level) có ít nhất 1 từ đang LEARNING của user */
    @Query("""
        SELECT DISTINCT p.word.category.parent.id
        FROM VocabularyProgressEntity p
        WHERE p.user.id = :userId
          AND p.word.category.parent.id IN :setIds
          AND p.status = 'LEARNING'
        """)
    List<Long> findSetIdsWithLearningStatus(
        @Param("userId") Long userId,
        @Param("setIds") List<Long> setIds
    );

    /** Tính số từ LEARNED theo từng set (category.parent) */
    @Query("""
        SELECT new com.fpt.website_prepme.model.dto.CategoryCountDTO(
            p.word.category.parent.id,
            COUNT(p)
        )
        FROM VocabularyProgressEntity p
        WHERE p.user.id = :userId
          AND p.word.category.parent.id IN :setIds
          AND p.status = 'LEARNED'
        GROUP BY p.word.category.parent.id
        """)
    List<com.fpt.website_prepme.model.dto.CategoryCountDTO> countLearnedWordsGroupByParentCategory(
        @Param("userId") Long userId,
        @Param("setIds") List<Long> setIds
    );
}
