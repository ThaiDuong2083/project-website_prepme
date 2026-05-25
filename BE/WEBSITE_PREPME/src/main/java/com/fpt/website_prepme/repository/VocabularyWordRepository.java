package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.dto.CategoryCountDTO;
import com.fpt.website_prepme.model.entity.VocabularyWordEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyWordRepository extends JpaRepository<VocabularyWordEntity, Long> {

  @Query("""
      SELECT w FROM VocabularyWordEntity w
      WHERE w.category.id IN :topicIds
        AND (:level = 'ALL' OR w.level = :level)
        AND w.isDeleted = false
      """)
  Page<VocabularyWordEntity> findAllByTopicIdsAndLevel(
      @Param("topicIds") List<Long> topicIds,
      @Param("level") String level,
      Pageable pageable);

  @Query("""
      SELECT w FROM VocabularyWordEntity w
      WHERE w.category.id IN :topicIds
        AND w.isDeleted = false
      """)
  List<VocabularyWordEntity> findAllByTopicIdsForFlashcard(@Param("topicIds") List<Long> topicIds);

  @Query("""
          SELECT new com.fpt.website_prepme.model.dto.CategoryCountDTO(
              w.category.parent.id,
              COUNT(w)
          )
          FROM VocabularyWordEntity w
          WHERE w.category.parent.id IN :setIds
            AND w.isDeleted = false
          GROUP BY w.category.parent.id
      """)
  List<CategoryCountDTO> countWordsGroupByParentCategory(@Param("setIds") List<Long> setIds);

  @Query("""
    SELECT w FROM VocabularyWordEntity w
    WHERE w.isDeleted = false
      AND (LOWER(w.word) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(w.meaning) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
  List<VocabularyWordEntity> searchByKeyword(@Param("keyword") String keyword);
}
