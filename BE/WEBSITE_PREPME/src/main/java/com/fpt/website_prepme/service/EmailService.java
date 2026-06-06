package com.fpt.website_prepme.service;

public interface EmailService {
    void sendWelcomeEmail(String toEmail, String fullName);
    void sendReminderEmail(String toEmail, String fullName);
}
