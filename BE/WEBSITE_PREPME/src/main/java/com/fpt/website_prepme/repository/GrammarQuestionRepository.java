package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.GrammarQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuestionRepository extends JpaRepository<GrammarQuestionEntity, Long> {
    List<GrammarQuestionEntity> findByTopicId(Long topicId);
    int countByTopicId(Long topicId);
}
