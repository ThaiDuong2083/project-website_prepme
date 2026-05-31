package com.fpt.website_prepme.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.model.dto.VocabWordDTO;
import com.fpt.website_prepme.model.entity.CategoryEntity;
import com.fpt.website_prepme.model.entity.VocabularyWordEntity;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.repository.VocabCategoryRepository;
import com.fpt.website_prepme.repository.VocabularyWordRepository;
import com.fpt.website_prepme.service.OpenAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/admin/vocabulary/ai")
@RequiredArgsConstructor
@Tag(name = "AI Vocabulary", description = "Admin: AI-powered vocabulary generation")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'USER')")
public class AiVocabularyController {

    private final OpenAiService openAiService;
    private final VocabCategoryRepository vocabCategoryRepository;
    private final VocabularyWordRepository vocabularyWordRepository;
    private final ObjectMapper objectMapper;

    /**
     * Request body for generating vocabulary.
     */
    public record GenerateRequest(String prompt, Long categoryId) {}

    /**
     * Request body for bulk saving vocabulary.
     */
    public record SaveRequest(List<VocabWordDTO> words, Long categoryId) {}

    @PostMapping("/generate")
    @Operation(summary = "Generate vocabulary words using AI based on a prompt")
    public ResponseEntity<ApiResponse<List<VocabWordDTO>>> generate(@RequestBody GenerateRequest request) {
        log.info("[AI Vocab] Generate request: categoryId={}, prompt={}", request.categoryId(), request.prompt());

        // Build enriched prompt — append existing words so AI avoids duplicates
        String prompt = request.prompt();
        if (request.categoryId() != null) {
            vocabCategoryRepository.findById(request.categoryId()).ifPresent(cat ->
                log.info("[AI Vocab] Category: {}", cat.getName()));

            List<String> existingWords = vocabularyWordRepository.findWordsByCategoryId(request.categoryId());
            if (!existingWords.isEmpty()) {
                String existingList = String.join(", ", existingWords);
                prompt = prompt + "\n\nQUAN TRỌNG: Các từ sau đã tồn tại trong database, TUYỆT ĐỐI KHÔNG được sinh lại bất kỳ từ nào trong danh sách này:\n[" + existingList + "]\nHãy chỉ tạo các từ hoàn toàn MỚI chưa có trong danh sách trên.";
                log.info("[AI Vocab] Appended {} existing words to prompt to avoid duplicates", existingWords.size());
            }
        }

        String jsonResult = openAiService.generateVocabularyJson(prompt);

        try {
            List<Map<String, Object>> rawList = objectMapper.readValue(jsonResult, new TypeReference<>() {});
            List<VocabWordDTO> dtos = rawList.stream().map(item -> VocabWordDTO.builder()
                    .word(str(item, "word"))
                    .wordType(str(item, "wordType"))
                    .pronunciation(str(item, "pronunciation"))
                    .meaning(str(item, "meaning"))
                    .exampleEn(str(item, "exampleEn"))
                    .exampleVi(str(item, "exampleVi"))
                    .level(str(item, "level"))
                    .categoryId(request.categoryId())
                    .build()
            ).collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Generated " + dtos.size() + " words", dtos));
        } catch (Exception e) {
            log.error("[AI Vocab] Failed to parse AI response: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<List<VocabWordDTO>>builder()
                            .code(400)
                            .message("AI trả về dữ liệu không hợp lệ: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/save")
    @Operation(summary = "Bulk save AI-generated vocabulary words to database")
    public ResponseEntity<ApiResponse<Map<String, Object>>> save(@RequestBody SaveRequest request) {
        log.info("[AI Vocab] Save request: {} words for categoryId={}", request.words().size(), request.categoryId());

        CategoryEntity category = vocabCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.categoryId()));

        List<VocabularyWordEntity> entities = request.words().stream().map(dto ->
                VocabularyWordEntity.builder()
                        .word(dto.getWord())
                        .wordType(dto.getWordType())
                        .pronunciation(dto.getPronunciation())
                        .meaning(dto.getMeaning())
                        .exampleEn(dto.getExampleEn())
                        .exampleVi(dto.getExampleVi())
                        .level(dto.getLevel())
                        .category(category)
                        .build()
        ).collect(Collectors.toList());

        List<VocabularyWordEntity> saved = vocabularyWordRepository.saveAll(entities);
        log.info("[AI Vocab] Saved {} words to category '{}'", saved.size(), category.getName());

        return ResponseEntity.ok(ApiResponse.success("Saved successfully",
                Map.of("savedCount", saved.size(), "categoryId", category.getId(), "categoryName", category.getName())));
    }

    private String str(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }
}
