package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.ExampleEntity;
import com.fpt.website_prepme.model.entity.ExampleEntity.ExampleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExampleRepository extends JpaRepository<ExampleEntity, Long>,
        JpaSpecificationExecutor<ExampleEntity> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<ExampleEntity> findByIdAndIsDeletedFalse(Long id);

    // Active records only
    Page<ExampleEntity> findAllByIsDeletedFalse(Pageable pageable);

    // Filter by status + soft-delete
    Page<ExampleEntity> findAllByStatusAndIsDeletedFalse(ExampleStatus status, Pageable pageable);

    // Search by name containing (case-insensitive)
    @Query("""
            SELECT e FROM ExampleEntity e
            WHERE e.isDeleted = false
              AND (:keyword IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(e.code) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<ExampleEntity> searchByKeyword(String keyword, Pageable pageable);
}
