package com.fpt.website_prepme.model.dto.grammar;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GrammarProgressHistoryResponse {
    private Long id;
    private String questionText;
    private int done;
    private int correct;
    private double accuracy;
    private List<String> recentChoices;
}
