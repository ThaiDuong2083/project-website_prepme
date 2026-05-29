package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.grammar.GrammarQuestionResponse;
import com.fpt.website_prepme.model.dto.grammar.GrammarSubmitRequest;
import com.fpt.website_prepme.model.dto.grammar.GrammarTopicResponse;
import com.fpt.website_prepme.model.dto.grammar.TopicProgressDetailsResponse;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.GrammarService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarService grammarService;

    @GetMapping("/topics")
    public ResponseEntity<ApiResponse<List<GrammarTopicResponse>>> getTopics(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success(grammarService.getAllGrammarTopics(userId)));
    }

    @GetMapping("/topics/{topicId}/questions")
    public ResponseEntity<ApiResponse<List<GrammarQuestionResponse>>> getPracticeQuestions(
            @PathVariable Long topicId,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(grammarService.getPracticeQuestions(topicId, limit)));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Void>> submitPracticeResult(
            @RequestParam Long userId,
            @Valid @RequestBody GrammarSubmitRequest request) {
        grammarService.submitPracticeResult(userId, request);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<TopicProgressDetailsResponse>>> getGrammarProgress(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success(grammarService.getGrammarProgress(userId)));
    }
}
