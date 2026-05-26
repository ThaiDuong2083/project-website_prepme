package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.TestSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestSectionRepository extends JpaRepository<TestSectionEntity, Long> {
    List<TestSectionEntity> findAllByTestIdOrderBySectionNumberAsc(Long testId);
}
