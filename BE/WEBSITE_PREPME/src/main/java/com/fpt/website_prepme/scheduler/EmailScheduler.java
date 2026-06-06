package com.fpt.website_prepme.scheduler;

import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class EmailScheduler {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 10 * * *")
    public void sendDailyReminderEmails() {
        log.info("[EmailScheduler] Bắt đầu gửi daily reminder emails...");

        List<UserEntity> users = userRepository.findAllActiveUsersWithEmail();

        int sent = 0;
        int skipped = 0;
        for (UserEntity user : users) {
            try {
                emailService.sendReminderEmail(user.getEmail(), user.getFullName());
                sent++;
            } catch (Exception e) {
                log.error("[EmailScheduler] Lỗi gửi email userId={}: {}", user.getId(), e.getMessage());
                skipped++;
            }
        }

        log.info("[EmailScheduler] Hoàn thành – gửi: {}, lỗi: {}", sent, skipped);
    }
}
