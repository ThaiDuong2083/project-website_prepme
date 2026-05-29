package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.UserGrammarProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGrammarProgressRepository extends JpaRepository<UserGrammarProgressEntity, Long> {
    Optional<UserGrammarProgressEntity> findByUserIdAndQuestionId(Long userId, Long questionId);
    
    List<UserGrammarProgressEntity> findByUserId(Long userId);
    
    @Query("SELECT COUNT(p) FROM UserGrammarProgressEntity p WHERE p.user.id = :userId AND p.question.topic.id = :topicId")
    int countCompletedQuestionsByTopicAndUser(Long topicId, Long userId);
}
