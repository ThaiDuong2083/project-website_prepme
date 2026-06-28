package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.UserVisitEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface UserVisitRepository extends JpaRepository<UserVisitEntity, Long> {

    @Query("SELECT COUNT(uv) FROM UserVisitEntity uv WHERE uv.isDeleted = false " +
            "AND (:startDate IS NULL OR uv.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR uv.createdAt <= :endDate)")
    long countAllVisits(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT uv FROM UserVisitEntity uv JOIN FETCH uv.user WHERE uv.isDeleted = false " +
            "AND (:startDate IS NULL OR uv.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR uv.createdAt <= :endDate)")
    Page<UserVisitEntity> findAllVisits(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT uv FROM UserVisitEntity uv JOIN FETCH uv.user u WHERE uv.isDeleted = false " +
            "AND (:startDate IS NULL OR uv.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR uv.createdAt <= :endDate) " +
            "AND (:phone IS NULL OR u.phone = :phone) " +
            "AND (:email IS NULL OR u.email = :email) " +
            "AND (:username IS NULL OR u.username = :username)")
    Page<UserVisitEntity> findVisitsByUser(
            @Param("phone") String phone,
            @Param("email") String email,
            @Param("username") String username,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
