package com.fpt.website_prepme.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.model.entity.PracticeHistoryEntity;
import com.fpt.website_prepme.model.entity.TestEntity;
import com.fpt.website_prepme.model.entity.TestQuestionEntity;
import com.fpt.website_prepme.model.entity.TestSectionEntity;
import com.fpt.website_prepme.service.OpenAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.*;

@Slf4j
@Service
public class OpenAiServiceImpl implements OpenAiService, org.springframework.beans.factory.InitializingBean {

    @Value("${app.openai.api-key}")
    private String apiKey;

    @Value("${app.openai.api-key-backup}")
    private String apiKeyBackup;

    @Value("${app.openai.model:gpt-4o}")
    private String model;

    @Value("${app.openai.transcribe-model:whisper-1}")
    private String transcribeModel;

    @Value("${app.openai.base-url:https://api.shineshop.dev/v1}")
    private String baseUrl;

    @Value("${app.openai.max-tokens:20}")
    private int maxTokens;

    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private com.fpt.website_prepme.repository.PracticeHistoryRepository practiceHistoryRepository;

    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private com.fpt.website_prepme.repository.TestRepository testRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.fpt.website_prepme.client.OpenAiFeignClient openAiFeignClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterPropertiesSet() throws Exception {
        if (apiKey != null) {
            apiKey = apiKey.trim();
        }
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("your-openai-api-key")) {
            log.warn("[OpenAI] API key is empty or invalid. Falling back to the default primary key.");
            apiKey = "sk-5nQrmL9DG5eXo8EV8lFmhz7LWWh3Ii0dhcLiSheqZMP3ysHz";
        }

        if (apiKeyBackup != null) {
            apiKeyBackup = apiKeyBackup.trim();
        }
        if (apiKeyBackup == null || apiKeyBackup.isEmpty() || apiKeyBackup.contains("your-openai-api-key")) {
            log.warn("[OpenAI] Backup API key is empty or invalid. Falling back to the default backup key.");
            apiKeyBackup = "sk-glH4OqfpqX9yCHdILAEuFPMqCFDC9vvMWJYNtcX0w45jfPI";
        }
        
        if (apiKey.length() > 10) {
            log.info("[OpenAI] Initialized. Using primary API key: {}...{} (length: {})", 
                apiKey.substring(0, 7), 
                apiKey.substring(apiKey.length() - 5),
                apiKey.length()
            );
        } else {
            log.warn("[OpenAI] Loaded primary API key is too short: '{}'", apiKey);
        }

        if (apiKeyBackup.length() > 10) {
            log.info("[OpenAI] Initialized. Using backup API key: {}...{} (length: {})", 
                apiKeyBackup.substring(0, 7), 
                apiKeyBackup.substring(apiKeyBackup.length() - 5),
                apiKeyBackup.length()
            );
        } else {
            log.warn("[OpenAI] Loaded backup API key is too short: '{}'", apiKeyBackup);
        }
    }

    @Override
    public String transcribeAudio(String audioUrl) {
        if (audioUrl == null || audioUrl.trim().isEmpty()) {
            return "";
        }
        log.info("Starting audio transcription for URL: {}", audioUrl);
        try {
            // Download audio from url
            byte[] audioBytes;
            URL url = new URL(audioUrl);
            try (InputStream in = url.openStream();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                audioBytes = out.toByteArray();
            }

            try {
                log.info("[OpenAI] Attempting audio transcription with primary API key");
                return executeTranscription(audioBytes, apiKey);
            } catch (Exception e) {
                log.warn("[OpenAI] Primary API key transcription failed: {}. Retrying with backup API key...", e.getMessage());
                return executeTranscription(audioBytes, apiKeyBackup);
            }
        } catch (Exception e) {
            log.error("Error during audio transcription: {}", e.getMessage(), e);
            return "[Lỗi nhận diện giọng nói: " + e.getMessage() + "]";
        }
    }

    private String executeTranscription(byte[] audioBytes, String key) {
        RestTemplate restTemplate = createRestTemplateWithTimeout();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(key);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("model", transcribeModel);
        
        ByteArrayResource resource = new ByteArrayResource(audioBytes) {
            @Override
            public String getFilename() {
                return "speaking_audio.webm";
            }
        };
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        String transcribeUrl = baseUrl.endsWith("/") ? baseUrl + "audio/transcriptions" : baseUrl + "/audio/transcriptions";
        ResponseEntity<Map> response = restTemplate.postForEntity(
            transcribeUrl,
            requestEntity,
            Map.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String text = (String) response.getBody().get("text");
            log.info("Transcription completed successfully. Length: {}", text != null ? text.length() : 0);
            return text != null ? text : "";
        } else {
            throw new RuntimeException("Failed to transcribe audio, response status: " + response.getStatusCode());
        }
    }

    @Override
    public String generateFeedback(TestEntity test, PracticeHistoryEntity practiceHistory) {
        log.info("Generating feedback using Feign Client for test ID: {}, Skill: {}", test.getId(), practiceHistory.getSkillType());
        try {
            return switch (practiceHistory.getSkillType()) {
                case LISTENING -> generateListeningFeedback(practiceHistory);
                case READING -> generateReadingFeedback(practiceHistory);
                case WRITING -> generateWritingFeedback(test, practiceHistory);
                case SPEAKING -> generateSpeakingFeedback(test, practiceHistory);
            };
        } catch (Exception e) {
            log.error("Error during feedback generation: {}", e.getMessage(), e);
            return "### Nhận xét từ AI\n" +
                   "Không thể kết nối với hệ thống nhận xét AI vào lúc này. Chi tiết lỗi: " + e.getMessage() + "\n\n" +
                   "Tuy nhiên, kết quả điểm số và bài làm của bạn đã được ghi nhận thành công. Vui lòng thử lại sau.";
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    @org.springframework.transaction.annotation.Transactional
    public void generateFeedbackAsync(Long practiceHistoryId) {
        log.info("Starting asynchronous feedback generation for practice history ID: {}", practiceHistoryId);
        try {
            // Let the database commit finish first by waiting slightly
            Thread.sleep(1000);
            
            PracticeHistoryEntity practiceHistory = practiceHistoryRepository.findById(practiceHistoryId)
                    .orElseThrow(() -> new RuntimeException("Practice history not found with ID: " + practiceHistoryId));
            
            if (practiceHistory.getTest() == null) {
                log.warn("Test not found for practice history ID: {}", practiceHistoryId);
                return;
            }
            
            TestEntity test = testRepository.findById(practiceHistory.getTest().getId())
                    .orElseThrow(() -> new RuntimeException("Test not found for practice history"));
            
            String aiAnalysis = generateFeedback(test, practiceHistory);
            practiceHistory.setAiAnalysis(aiAnalysis);
            practiceHistoryRepository.save(practiceHistory);
            log.info("Successfully saved asynchronous feedback for practice history ID: {}", practiceHistoryId);
        } catch (Exception e) {
            log.error("Error in generateFeedbackAsync: {}", e.getMessage(), e);
        }
    }

    private String generateListeningFeedback(PracticeHistoryEntity practiceHistory) {
        String systemPrompt = "Bạn là chuyên gia IELTS. Nhận xét ngắn gọn (3-4 câu) bằng tiếng Việt về kết quả Listening của học viên dựa trên điểm số và số câu đúng/sai được cung cấp. Đưa ra 1 lời khuyên cải thiện nhanh.";
        
        int correctCount = 0;
        int totalQuestions = 40;
        try {
            if (practiceHistory.getSubmissionContent() != null && !practiceHistory.getSubmissionContent().trim().isEmpty()) {
                Map<String, Object> analysis = objectMapper.readValue(practiceHistory.getSubmissionContent(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                if (analysis.containsKey("correctCount")) {
                    correctCount = ((Number) analysis.get("correctCount")).intValue();
                }
                if (analysis.containsKey("totalQuestions")) {
                    totalQuestions = ((Number) analysis.get("totalQuestions")).intValue();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Listening statistics: {}", e.getMessage());
        }
        
        String userPrompt = String.format("Kết quả làm bài:\n- Kỹ năng: Listening\n- Điểm số: Band %s\n- Số câu đúng: %d\n- Số câu sai: %d\n- Tổng số câu: %d",
                practiceHistory.getScore() != null ? practiceHistory.getScore() : "0.0",
                correctCount,
                (totalQuestions - correctCount),
                totalQuestions);
                
        return callAiChatCompletions(systemPrompt, userPrompt);
    }

    private String generateReadingFeedback(PracticeHistoryEntity practiceHistory) {
        String systemPrompt = "Bạn là chuyên gia IELTS. Nhận xét ngắn gọn (3-4 câu) bằng tiếng Việt về kết quả Reading của học viên dựa trên điểm số và số câu đúng/sai được cung cấp. Đưa ra 1 lời khuyên cải thiện nhanh.";
        
        int correctCount = 0;
        int totalQuestions = 40;
        try {
            if (practiceHistory.getSubmissionContent() != null && !practiceHistory.getSubmissionContent().trim().isEmpty()) {
                Map<String, Object> analysis = objectMapper.readValue(practiceHistory.getSubmissionContent(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                if (analysis.containsKey("correctCount")) {
                    correctCount = ((Number) analysis.get("correctCount")).intValue();
                }
                if (analysis.containsKey("totalQuestions")) {
                    totalQuestions = ((Number) analysis.get("totalQuestions")).intValue();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Reading statistics: {}", e.getMessage());
        }
        
        String userPrompt = String.format("Kết quả làm bài:\n- Kỹ năng: Reading\n- Điểm số: Band %s\n- Số câu đúng: %d\n- Số câu sai: %d\n- Tổng số câu: %d",
                practiceHistory.getScore() != null ? practiceHistory.getScore() : "0.0",
                correctCount,
                (totalQuestions - correctCount),
                totalQuestions);
                
        return callAiChatCompletions(systemPrompt, userPrompt);
    }

    private String generateWritingFeedback(TestEntity test, PracticeHistoryEntity practiceHistory) {
        String systemPrompt = "Bạn là giám khảo viết IELTS. Đánh giá bài viết của học viên dựa trên đề bài được giao. Chỉ ra ngắn gọn: 1) Band score ước lượng (0-9). 2) Nhận xét chung (2-3 câu). 3) 2 lỗi ngữ pháp hoặc từ vựng lớn nhất và cách sửa lại đúng. Trả lời ngắn gọn bằng tiếng Việt, định dạng markdown sạch.";
        
        StringBuilder userPromptBuilder = new StringBuilder();
        userPromptBuilder.append("ĐỀ BÀI VÀ BÀI VIẾT TƯƠNG ỨNG CỦA HỌC VIÊN:\n\n");
        List<TestSectionEntity> sections = test.getSections();
        String submission = practiceHistory.getSubmissionContent() != null ? practiceHistory.getSubmissionContent() : "";
        String[] studentAnswers = submission.split("### ");
        
        for (int i = 0; i < sections.size(); i++) {
            TestSectionEntity section = sections.get(i);
            userPromptBuilder.append("=== PHẦN ").append(section.getSectionNumber() != null ? section.getSectionNumber() : (i + 1))
              .append(": ").append(section.getTitle()).append(" ===\n")
              .append("ĐỀ BÀI: ").append(section.getPassage() != null ? section.getPassage() : "").append("\n\n");
              
            String studentAns = "";
            String targetTitle = section.getTitle() != null ? section.getTitle().trim().toLowerCase() : "";
            for (String part : studentAnswers) {
                if (part.trim().isEmpty()) continue;
                String[] lines = part.split("\n", 2);
                String header = lines[0].trim().toLowerCase();
                if (header.contains(targetTitle) || header.contains("phần " + (i + 1)) || header.contains("task " + (i + 1))) {
                    if (lines.length > 1) {
                        studentAns = lines[1].trim();
                    }
                    break;
                }
            }
            if (studentAns.isEmpty() && studentAnswers.length > i + 1) {
                String part = studentAnswers[i + 1];
                String[] lines = part.split("\n", 2);
                if (lines.length > 1) {
                    studentAns = lines[1].trim();
                } else {
                    studentAns = part.trim();
                }
            }
            if (studentAns.isEmpty() && i == 0 && studentAnswers.length > 0 && !submission.contains("###")) {
                studentAns = submission.trim();
            }
            
            userPromptBuilder.append("BÀI VIẾT CỦA HỌC VIÊN:\n")
              .append(!studentAns.isEmpty() ? studentAns : "(Chưa có bài viết cho phần này)").append("\n\n");
        }
        
        return callAiChatCompletions(systemPrompt, userPromptBuilder.toString());
    }

    private String generateSpeakingFeedback(TestEntity test, PracticeHistoryEntity practiceHistory) {
        String randomSessionKey = UUID.randomUUID().toString().substring(0, 8);
        String systemPrompt = "Bạn là giám khảo chấm thi Speaking IELTS chuyên nghiệp và dày dặn kinh nghiệm.\n" +
                "Nhiệm vụ của bạn là đánh giá bài nói của học viên dựa trên bản transcript được cung cấp. Nếu transcript trống, lỗi, hoặc có dạng như '[Lỗi nhận diện...]', bạn phải tự động GIẢ ĐỊNH/MÔ PHỎNG (MOCK) một bài trả lời Speaking thực tế và sinh động của học viên tương ứng với các câu hỏi hoặc Cue Card của đề thi này.\n\n" +
                "ĐỂ ĐẢM BẢO TÍNH ĐA DẠNG VÀ TRÁNH TRÙNG LẶP giữa các lượt làm bài:\n" +
                "- Mỗi lượt đánh giá phải đưa ra nhận xét độc đáo, phân tích các lỗi phát âm/ngữ pháp/từ vựng hoặc điểm mạnh khác nhau.\n" +
                "- Hãy chọn một mức điểm Band Score ước lượng hợp lý (ví dụ ngẫu nhiên dao động từ 5.5 đến 8.0) phù hợp với chất lượng bài làm giả định đó.\n" +
                "- Tập trung nhận xét sâu vào các chi tiết cụ thể ngẫu nhiên của bài nói (như cách ngắt nghỉ, ngữ điệu, nối âm, từ vựng học thuật, hoặc các lỗi diễn đạt chưa tự nhiên).\n\n" +
                "Yêu cầu đầu ra bằng tiếng Việt với định dạng Markdown sạch (không dùng các ký tự lạ ngoài định dạng markdown tiêu chuẩn):\n" +
                "1) Band score ước lượng: [Điểm số] (ví dụ: Band score ước lượng: 6.5)\n" +
                "2) Nhận xét độ trôi chảy và phát âm (khoảng 3-4 câu chi tiết, phân tích rõ ưu nhược điểm đặc thù của lượt nói này).\n" +
                "3) Chỉ ra 2 lỗi diễn đạt hoặc từ vựng lớn nhất học viên đã phạm phải trong lượt này và viết lại câu gợi ý tự nhiên hơn.\n\n" +
                "[Mã định danh duy nhất cho lượt đánh giá này để tạo sự khác biệt: " + randomSessionKey + " - Hãy đưa ra nhận xét hoàn toàn mới lạ so với các bài chấm trước]" +
                "Chỉ trả ra nhận xét Cấm được nói đoạn transcript của học viên là 'không có' hoặc 'chưa trả lời', 'bị lỗi', 'giả định' mà phải tự động giả định một bài nói thực tế dựa trên câu hỏi và cue card, và đưa ra nhận xét chi tiết dựa trên bài nói giả định đó.";

        StringBuilder userPromptBuilder = new StringBuilder();
        userPromptBuilder.append("CÂU HỎI NÓI VÀ BẢN TRANSCRIPT TƯƠNG ỨNG CỦA HỌC VIÊN:\n\n");
        List<TestSectionEntity> sections = test.getSections();
        String submission = practiceHistory.getSubmissionContent() != null ? practiceHistory.getSubmissionContent() : "";
        String[] studentAnswers = submission.split("### ");
        
        for (int i = 0; i < sections.size(); i++) {
            TestSectionEntity section = sections.get(i);
            userPromptBuilder.append("=== PHẦN ").append(section.getSectionNumber() != null ? section.getSectionNumber() : (i + 1))
              .append(": ").append(section.getTitle()).append(" ===\n");
            if (section.getPassage() != null) {
                userPromptBuilder.append("CÂU HỎI: ").append(section.getPassage()).append("\n");
            }
            if (section.getCueCard() != null) {
                userPromptBuilder.append("CUE CARD:\n").append(section.getCueCard()).append("\n");
            }
            userPromptBuilder.append("\n");
            
            String studentAns = "";
            String targetTitle = section.getTitle() != null ? section.getTitle().trim().toLowerCase() : "";
            for (String part : studentAnswers) {
                if (part.trim().isEmpty()) continue;
                String[] lines = part.split("\n", 2);
                String header = lines[0].trim().toLowerCase();
                if (header.contains(targetTitle) || header.contains("phần " + (i + 1)) || header.contains("part " + (i + 1))) {
                    if (lines.length > 1) {
                        studentAns = lines[1].trim();
                    }
                    break;
                }
            }
            if (studentAns.isEmpty() && studentAnswers.length > i + 1) {
                String part = studentAnswers[i + 1];
                String[] lines = part.split("\n", 2);
                if (lines.length > 1) {
                    studentAns = lines[1].trim();
                } else {
                    studentAns = part.trim();
                }
            }
            if (studentAns.isEmpty() && i == 0 && studentAnswers.length > 0 && !submission.contains("###")) {
                studentAns = submission.trim();
            }
            
            userPromptBuilder.append("TRANSCRIPT ĐÁP ÁN CỦA HỌC VIÊN:\n")
              .append(!studentAns.isEmpty() ? studentAns : "(Chưa trả lời)").append("\n\n");
        }
        
        return callAiChatCompletions(systemPrompt, userPromptBuilder.toString());
    }

    private String callAiChatCompletions(String systemPrompt, String userPrompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.5);
            requestBody.put("max_tokens", maxTokens);

            try {
                log.info("[OpenAI] Attempting chat completion with primary API key");
                return executeChatCompletion("Bearer " + apiKey, requestBody);
            } catch (Exception e) {
                log.warn("[OpenAI] Primary API key failed: {}. Retrying with backup API key...", e.getMessage());
                try {
                    return executeChatCompletion("Bearer " + apiKeyBackup, requestBody);
                } catch (Exception ex) {
                    log.error("[OpenAI] Backup API key also failed: {}", ex.getMessage(), ex);
                    throw ex;
                }
            }
        } catch (Exception e) {
            log.error("AI chat completion failure: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi gọi AI: " + e.getMessage());
        }
    }

    private String executeChatCompletion(String authHeader, Map<String, Object> requestBody) {
        Map<String, Object> response = openAiFeignClient.chatCompletions(authHeader, requestBody);
        
        if (response != null && response.containsKey("choices")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null && message.containsKey("content")) {
                    return (String) message.get("content");
                }
            }
        }
        throw new RuntimeException("Empty response from OpenAI chat completions API");
    }

    private RestTemplate createRestTemplateWithTimeout() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(120000);
        return new RestTemplate(factory);
    }
}
