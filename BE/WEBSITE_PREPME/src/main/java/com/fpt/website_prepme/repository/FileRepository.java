package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.FileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    @Query("SELECT f FROM FileEntity f WHERE (:category IS NULL OR f.category = :category)")
    Page<FileEntity> findByCategory(@Param("category") String category, Pageable pageable);
}
