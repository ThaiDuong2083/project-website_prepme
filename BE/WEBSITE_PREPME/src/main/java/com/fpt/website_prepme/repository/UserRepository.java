package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.enums.MembershipType;
import com.fpt.website_prepme.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>,
        JpaSpecificationExecutor<UserEntity> {

    Optional<UserEntity> findByPhone(String phone);
    Optional<UserEntity> findByGoogleId(String googleId);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByUsername(String username);

    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByGoogleId(String googleId);

    List<UserEntity> findAllByMembershipTypeAndSubscriptionExpiresAtBefore(
            MembershipType membershipType, LocalDateTime dateTime);

    /** Lấy tất cả user còn hoạt động, có email, để gửi reminder */
    @Query("SELECT u FROM UserEntity u WHERE u.email IS NOT NULL AND u.isDeleted = false")
    List<UserEntity> findAllActiveUsersWithEmail();
}
