package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.model.dto.CategoryDTO;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.model.dto.VocabWordDTO;
import com.fpt.website_prepme.service.VocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vocabulary")
@RequiredArgsConstructor
@Tag(name = "Vocabulary", description = "Vocabulary learning APIs")
@SecurityRequirement(name = "bearerAuth")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @GetMapping("/sets")
    @Operation(summary = "Get all root vocabulary sets")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getVocabSets() {
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.getVocabSets()));
    }

    @GetMapping("/sets/{setId}/topics")
    @Operation(summary = "Get all topics in a set")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getVocabTopics(@PathVariable Long setId) {
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.getTopicsBySetId(setId)));
    }

    @GetMapping("/words")
    @Operation(summary = "Get paginated vocabulary words by topicIds and level")
    public ResponseEntity<ApiResponse<PageResponse<VocabWordDTO>>> getWords(
            @RequestParam List<Long> topicIds,
            @RequestParam(defaultValue = "ALL") String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.getWords(topicIds, level, pageRequest)));
    }

    @GetMapping("/flashcard")
    @Operation(summary = "Get un-paginated words for a flashcard session")
    public ResponseEntity<ApiResponse<List<VocabWordDTO>>> getFlashcardSession(
            @RequestParam List<Long> topicIds,
            @RequestParam(defaultValue = "false") boolean shuffle) {
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.getFlashcardSession(topicIds, shuffle)));
    }

    @PostMapping("/topics/start-learning")
    @Operation(summary = "Mark topics as LEARNING – upsert progress records for all words in given topics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startLearning(@RequestParam List<Long> topicIds) {
        int updated = vocabularyService.startLearningTopics(topicIds);
        Map<String, Object> result = Map.of(
            "updatedCount", updated,
            "topicIds", topicIds,
            "status", "LEARNING"
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/search")
    @Operation(summary = "Search vocabulary words by keyword across all topics")
    public ResponseEntity<ApiResponse<List<VocabWordDTO>>> searchWords(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.searchWords(keyword)));
    }
}
