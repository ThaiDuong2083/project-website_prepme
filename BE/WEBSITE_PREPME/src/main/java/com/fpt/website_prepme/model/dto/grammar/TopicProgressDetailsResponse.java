package com.fpt.website_prepme.model.dto.grammar;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TopicProgressDetailsResponse {
    private Long id; // topic Id
    private String name;
    private int done;
    private int total;
    private double accuracy;
    private List<GrammarProgressHistoryResponse> questions;
}
