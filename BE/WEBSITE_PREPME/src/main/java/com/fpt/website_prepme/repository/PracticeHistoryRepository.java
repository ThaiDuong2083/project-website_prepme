package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.PracticeHistoryEntity;
import com.fpt.website_prepme.enums.SkillType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeHistoryRepository extends JpaRepository<PracticeHistoryEntity, Long>, JpaSpecificationExecutor<PracticeHistoryEntity> {
    List<PracticeHistoryEntity> findByUserId(Long userId);
    List<PracticeHistoryEntity> findByUserIdAndSkillType(Long userId, SkillType skillType);
}
