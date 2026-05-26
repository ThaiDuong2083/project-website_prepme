package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.enums.ExamType;
import com.fpt.website_prepme.model.entity.TestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<TestEntity, Long>, JpaSpecificationExecutor<TestEntity> {

    Page<TestEntity> findAllByIsDeletedFalseAndParentTestIsNull(Pageable pageable);

    Page<TestEntity> findAllByExamTypeAndIsDeletedFalseAndParentTestIsNull(ExamType examType, Pageable pageable);

    Page<TestEntity> findAllByTitleContainingIgnoreCaseAndIsDeletedFalseAndParentTestIsNull(String title, Pageable pageable);

    Page<TestEntity> findAllByExamTypeAndTitleContainingIgnoreCaseAndIsDeletedFalseAndParentTestIsNull(ExamType examType, String title, Pageable pageable);
}
