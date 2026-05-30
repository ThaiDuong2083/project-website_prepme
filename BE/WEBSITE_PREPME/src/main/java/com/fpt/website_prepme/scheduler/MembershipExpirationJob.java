package com.fpt.website_prepme.scheduler;

import com.fpt.website_prepme.enums.MembershipType;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.model.entity.UserMembershipLogEntity;
import com.fpt.website_prepme.repository.UserMembershipLogRepository;
import com.fpt.website_prepme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class MembershipExpirationJob {

    private final UserRepository userRepository;
    private final UserMembershipLogRepository userMembershipLogRepository;

    // Run every day at midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkExpiredMemberships() {
        log.info("[Job] Starting check for expired pro/premium memberships...");
        LocalDateTime now = LocalDateTime.now();

        List<UserEntity> expiredUsers = userRepository.findAllByMembershipTypeAndSubscriptionExpiresAtBefore(
                MembershipType.PREMIUM, now
        );

        log.info("[Job] Found {} expired premium users.", expiredUsers.size());

        for (UserEntity user : expiredUsers) {
            log.info("[Job] User {} (ID: {}) premium subscription expired. Subscribed at: {}, Expired at: {}", 
                    user.getUsername(), user.getId(), user.getProSubscribedAt(), user.getSubscriptionExpiresAt());

            // Create audit log entry
            UserMembershipLogEntity changeLog = UserMembershipLogEntity.builder()
                    .user(user)
                    .oldMembershipType(MembershipType.PREMIUM)
                    .newMembershipType(MembershipType.FREE)
                    .changeReason("Premium membership expired (subscribed at: " + user.getProSubscribedAt() + ", expired at: " + user.getSubscriptionExpiresAt() + ")")
                    .build();
            userMembershipLogRepository.save(changeLog);

            // Update user membership fields
            user.setMembershipType(MembershipType.FREE);
            user.setProSubscribedAt(null);
            user.setSubscriptionExpiresAt(null);
            userRepository.save(user);
        }

        log.info("[Job] Expired premium membership check completed.");
    }
}
