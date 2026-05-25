package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VocabCategoryRepository extends JpaRepository<CategoryEntity, Long> {
    List<CategoryEntity> findAllByTypeAndParentIsNull(String type);
    List<CategoryEntity> findAllByParentId(Long parentId);
}
