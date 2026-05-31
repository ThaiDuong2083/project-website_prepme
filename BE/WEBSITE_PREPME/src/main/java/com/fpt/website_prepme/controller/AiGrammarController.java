package com.fpt.website_prepme.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.model.dto.grammar.GrammarQuestionResponse;
import com.fpt.website_prepme.model.entity.CategoryEntity;
import com.fpt.website_prepme.model.entity.GrammarQuestionEntity;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.repository.GrammarQuestionRepository;
import com.fpt.website_prepme.repository.VocabCategoryRepository;
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
@RequestMapping("/admin/grammar/ai")
@RequiredArgsConstructor
@Tag(name = "AI Grammar", description = "Admin: AI-powered grammar question generation")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'USER')")
public class AiGrammarController {

    private final OpenAiService openAiService;
    private final VocabCategoryRepository vocabCategoryRepository;
    private final GrammarQuestionRepository grammarQuestionRepository;
    private final ObjectMapper objectMapper;

    public record GenerateRequest(String prompt, Long topicId) {}

    public record GrammarQuestionDTO(
            Long id,
            Long topicId,
            String questionText,
            List<String> options,
            String answer,
            String explanation,
            String translation,
            List<Map<String, String>> vocabulary
    ) {}

    public record SaveRequest(List<GrammarQuestionDTO> questions, Long topicId) {}

    @PostMapping("/generate")
    @Operation(summary = "Generate grammar questions using AI based on a prompt")
    public ResponseEntity<ApiResponse<List<GrammarQuestionDTO>>> generate(@RequestBody GenerateRequest request) {
        log.info("[AI Grammar] Generate request: topicId={}, prompt={}", request.topicId(), request.prompt());

        String prompt = request.prompt();
        if (request.topicId() != null) {
            vocabCategoryRepository.findById(request.topicId()).ifPresent(cat ->
                log.info("[AI Grammar] Topic: {}", cat.getName()));

            // Append existing questions to avoid duplicates
            List<String> existingQuestions = grammarQuestionRepository.findByTopicId(request.topicId())
                    .stream().map(GrammarQuestionEntity::getQuestionText).collect(Collectors.toList());
            if (!existingQuestions.isEmpty()) {
                String existingList = existingQuestions.stream()
                        .limit(50)
                        .collect(Collectors.joining(" | "));
                prompt = prompt + "\n\nQUAN TRỌNG: Các câu hỏi sau đã tồn tại trong database, TUYỆT ĐỐI KHÔNG được sinh lại bất kỳ câu nào tương tự:\n[" + existingList + "]\nHãy chỉ tạo các câu hỏi hoàn toàn MỚI.";
                log.info("[AI Grammar] Appended {} existing questions to prompt to avoid duplicates", existingQuestions.size());
            }
        }

        String jsonResult = openAiService.generateGrammarJson(prompt);

        try {
            List<Map<String, Object>> rawList = objectMapper.readValue(jsonResult, new TypeReference<>() {});
            List<GrammarQuestionDTO> dtos = rawList.stream().map(item -> {
                @SuppressWarnings("unchecked")
                List<String> opts = item.get("options") instanceof List ? (List<String>) item.get("options") : List.of();
                @SuppressWarnings("unchecked")
                List<Map<String, String>> vocab = item.get("vocabulary") instanceof List ? (List<Map<String, String>>) item.get("vocabulary") : List.of();
                return new GrammarQuestionDTO(
                        null,
                        request.topicId(),
                        str(item, "questionText"),
                        opts,
                        str(item, "answer"),
                        str(item, "explanation"),
                        str(item, "translation"),
                        vocab
                );
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Generated " + dtos.size() + " questions", dtos));
        } catch (Exception e) {
            log.error("[AI Grammar] Failed to parse AI response: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<List<GrammarQuestionDTO>>builder()
                            .code(400)
                            .message("AI trả về dữ liệu không hợp lệ: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/save")
    @Operation(summary = "Bulk save AI-generated grammar questions to database")
    public ResponseEntity<ApiResponse<Map<String, Object>>> save(@RequestBody SaveRequest request) {
        log.info("[AI Grammar] Save request: {} questions for topicId={}", request.questions().size(), request.topicId());

        CategoryEntity topic = vocabCategoryRepository.findById(request.topicId())
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + request.topicId()));

        List<GrammarQuestionEntity> entities = request.questions().stream().map(dto -> {
            try {
                String optionsJson = objectMapper.writeValueAsString(dto.options());
                String vocabJson = dto.vocabulary() != null ? objectMapper.writeValueAsString(dto.vocabulary()) : null;
                return GrammarQuestionEntity.builder()
                        .topic(topic)
                        .questionText(dto.questionText())
                        .options(optionsJson)
                        .answer(dto.answer())
                        .explanation(dto.explanation())
                        .translation(dto.translation())
                        .vocabulary(vocabJson)
                        .build();
            } catch (Exception e) {
                throw new RuntimeException("Error serializing options: " + e.getMessage());
            }
        }).collect(Collectors.toList());

        List<GrammarQuestionEntity> saved = grammarQuestionRepository.saveAll(entities);
        log.info("[AI Grammar] Saved {} questions to topic '{}'", saved.size(), topic.getName());

        return ResponseEntity.ok(ApiResponse.success("Saved successfully",
                Map.of("savedCount", saved.size(), "topicId", topic.getId(), "topicName", topic.getName())));
    }

    @GetMapping("/topics")
    @Operation(summary = "Get all GRAMMAR_TOPIC categories")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGrammarTopics() {
        List<CategoryEntity> topics = vocabCategoryRepository.findAllByTypeAndParentIsNull("GRAMMAR_TOPIC");
        List<Map<String, Object>> result = topics.stream()
                .map(t -> Map.<String, Object>of("id", t.getId(), "name", t.getName(), "description", t.getDescription() != null ? t.getDescription() : ""))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private String str(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : "";
    }
}
