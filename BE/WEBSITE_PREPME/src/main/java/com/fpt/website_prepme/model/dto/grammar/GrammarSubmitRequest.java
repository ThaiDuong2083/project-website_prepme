package com.fpt.website_prepme.model.dto.grammar;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class GrammarSubmitRequest {
    @NotNull
    private Long questionId;
    
    @NotNull
    private String selectedAnswer;
}
