package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── sendWelcomeEmail ─────────────────────────────────────────────────────

    @Async
    @Override
    public void sendWelcomeEmail(String toEmail, String fullName) {
        if (toEmail == null || toEmail.isBlank()) return;
        try {
            String html = render("email/welcome", fullName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "PrepMe 🎯");
            helper.setTo(toEmail);
            helper.setSubject("Chào mừng bạn đến với PrepMe! 🎉");
            helper.setText(html, true);
            helper.addInline("logo", new ClassPathResource("images/logo.jpg"));
            mailSender.send(message);
            log.info("[Email] Welcome → {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] Welcome FAILED → {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    @Override
    public void sendReminderEmail(String toEmail, String fullName) {
        if (toEmail == null || toEmail.isBlank()) return;
        try {
            String html = render("email/reminder", fullName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "PrepMe 🎯");
            helper.setTo(toEmail);
            helper.setSubject("Học IELTS hôm nay chưa? 🔥 Đừng bỏ lỡ streak!");
            helper.setText(html, true);
            helper.addInline("logo", new ClassPathResource("images/logo.jpg"));
            mailSender.send(message);
            log.info("[Email] Reminder → {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] Reminder FAILED → {}: {}", toEmail, e.getMessage());
        }
    }


    private String render(String template, String fullName) {
        Context ctx = new Context(new Locale("vi", "VN"));
        ctx.setVariable("fullName", (fullName != null && !fullName.isBlank()) ? fullName : "bạn");
        return templateEngine.process(template, ctx);
    }
}
