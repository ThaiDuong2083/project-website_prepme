package com.fpt.website_prepme.config;

import com.cloudinary.Cloudinary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Slf4j
@Configuration
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${app.cloudinary.api-key}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        log.info("[Cloudinary] Initializing with cloud: {}", cloudName);
        return new Cloudinary(Map.of(
                "cloud_name", cloudName,
                "api_key",    apiKey,
                "api_secret", apiSecret,
                "secure",     true
        ));
    }
}
