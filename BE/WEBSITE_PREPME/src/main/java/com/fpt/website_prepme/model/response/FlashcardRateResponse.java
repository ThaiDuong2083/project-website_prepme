package com.fpt.website_prepme.model.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FlashcardRateResponse {
    private Long wordId;
    private String rating;
    private LocalDateTime nextReviewAt;
    private String status;
}
