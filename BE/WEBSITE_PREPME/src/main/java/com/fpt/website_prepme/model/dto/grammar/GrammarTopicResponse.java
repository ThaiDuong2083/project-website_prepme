package com.fpt.website_prepme.model.dto.grammar;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GrammarTopicResponse {
    private Long id;
    private String name;
    private int done;
    private int total;
    private double accuracy;
}
