package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.enums.QuestionType;
import lombok.Data;
import java.util.List;

@Data
public class AdminCreateQuestionRequest {
    private Integer questionNumber;
    private QuestionType questionType;
    private String questionText;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
}
