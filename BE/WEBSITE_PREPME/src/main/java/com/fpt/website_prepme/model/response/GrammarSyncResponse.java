package com.fpt.website_prepme.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GrammarSyncResponse {
    private int categoriesCreated;
    private int questionsImported;
    private int errors;
    private String message;
}
