package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.UserMembershipLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMembershipLogRepository extends JpaRepository<UserMembershipLogEntity, Long> {
}
