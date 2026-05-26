package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.FavoriteVocabularyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FavoriteVocabularyRepository extends JpaRepository<FavoriteVocabularyEntity, Long> {

    @Query("SELECT f FROM FavoriteVocabularyEntity f JOIN FETCH f.word w JOIN FETCH w.category c " +
           "WHERE f.user.id = :userId AND f.isDeleted = false " +
           "ORDER BY f.createdAt DESC")
    List<FavoriteVocabularyEntity> findAllByUserId(@Param("userId") Long userId);

    Optional<FavoriteVocabularyEntity> findByUser_IdAndWord_Id(Long userId, Long wordId);

    boolean existsByUser_IdAndWord_Id(Long userId, Long wordId);

    long countByUser_IdAndIsDeleted(Long userId, Boolean isDeleted);

    @Query("SELECT f.word.id FROM FavoriteVocabularyEntity f WHERE f.user.id = :userId AND f.isDeleted = false")
    Set<Long> findFavoriteWordIdsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE FavoriteVocabularyEntity f SET f.isDeleted = true WHERE f.user.id = :userId AND f.word.id = :wordId")
    void softDeleteByUserIdAndWordId(@Param("userId") Long userId, @Param("wordId") Long wordId);
}
