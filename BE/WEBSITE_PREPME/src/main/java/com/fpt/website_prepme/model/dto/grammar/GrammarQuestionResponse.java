package com.fpt.website_prepme.model.dto.grammar;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class GrammarQuestionResponse {
    private Long id;
    private Long topicId;
    private String text;
    private List<String> options;
    private String answer;
    private String explanation;
    private String translation;
    private List<Map<String, String>> vocabulary;
}
