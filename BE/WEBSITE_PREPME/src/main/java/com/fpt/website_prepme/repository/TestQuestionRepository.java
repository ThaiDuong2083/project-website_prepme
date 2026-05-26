package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.TestQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestQuestionRepository extends JpaRepository<TestQuestionEntity, Long> {
    List<TestQuestionEntity> findAllBySectionIdOrderByQuestionNumberAsc(Long sectionId);
}
