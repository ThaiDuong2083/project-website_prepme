package com.fpt.website_prepme.repository;

import com.fpt.website_prepme.model.entity.PaymentTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransactionEntity, Long>, JpaSpecificationExecutor<PaymentTransactionEntity> {
    Optional<PaymentTransactionEntity> findByTransactionReference(String transactionReference);
    List<PaymentTransactionEntity> findByUserId(Long userId);
}
