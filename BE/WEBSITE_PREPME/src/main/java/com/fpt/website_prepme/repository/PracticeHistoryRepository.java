package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.enums.PracticeStatus;
import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.model.entity.PracticeHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeHistoryRepository extends JpaRepository<PracticeHistoryEntity, Long>, JpaSpecificationExecutor<PracticeHistoryEntity> {
    
    List<PracticeHistoryEntity> findByUserIdAndIsDeletedFalse(Long userId);
    
    Page<PracticeHistoryEntity> findAllByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    
    Page<PracticeHistoryEntity> findAllByUserIdAndSkillTypeAndIsDeletedFalse(Long userId, SkillType skillType, Pageable pageable);
    
    long countByUserIdAndSkillTypeAndStatusAndIsDeletedFalse(Long userId, SkillType skillType, PracticeStatus status);
}
