package com.fpt.website_prepme.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "openaiFeignClient", url = "${app.openai.base-url:https://api.shineshop.dev/v1}")
public interface OpenAiFeignClient {

    @PostMapping(value = "/chat/completions", consumes = MediaType.APPLICATION_JSON_VALUE)
    Map<String, Object> chatCompletions(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> requestBody
    );
}
