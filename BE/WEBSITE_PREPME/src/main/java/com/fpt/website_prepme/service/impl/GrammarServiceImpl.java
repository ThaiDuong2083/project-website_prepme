package com.fpt.website_prepme.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.grammar.*;
import com.fpt.website_prepme.model.entity.CategoryEntity;
import com.fpt.website_prepme.model.entity.GrammarQuestionEntity;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.model.entity.UserGrammarProgressEntity;
import com.fpt.website_prepme.repository.VocabCategoryRepository;
import com.fpt.website_prepme.repository.GrammarQuestionRepository;
import com.fpt.website_prepme.repository.UserGrammarProgressRepository;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.service.GrammarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrammarServiceImpl implements GrammarService {

    private final VocabCategoryRepository categoryRepository;
    private final GrammarQuestionRepository grammarQuestionRepository;
    private final UserGrammarProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<GrammarTopicResponse> getAllGrammarTopics(Long userId) {
        List<CategoryEntity> topics = categoryRepository.findAllByTypeAndParentIsNull("GRAMMAR_TOPIC");
        if (topics.isEmpty()) {
            // fallback generic if no special query exists, but we can reuse this generic repository method if we added it, else assume we can fetch by type.
            // Oh wait, VocabCategoryRepository has findAllByTypeAndParentIsNull, so I'll use it since GRAMMAR_TOPIC might not have parents.
            // Or I should just use a custom simple repository `CategoryRepository` that I haven't created yet?
            // Actually, I'll stick to using it for now.
        }
        return topics.stream().map(topic -> {
            int total = grammarQuestionRepository.countByTopicId(topic.getId());
            int done = progressRepository.countCompletedQuestionsByTopicAndUser(topic.getId(), userId);
            
            return GrammarTopicResponse.builder()
                    .id(topic.getId())
                    .name(topic.getName())
                    .total(total)
                    .done(done)
                    .accuracy(0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<GrammarQuestionResponse> getPracticeQuestions(Long topicId, int limit) {
        List<GrammarQuestionEntity> questions = grammarQuestionRepository.findByTopicId(topicId);
        Collections.shuffle(questions);
        if (questions.size() > limit) {
            questions = questions.subList(0, limit);
        }

        return questions.stream().map(this::mapToQuestionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void submitPracticeResult(Long userId, GrammarSubmitRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found"));
        GrammarQuestionEntity question = grammarQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Question not found"));

        boolean isCorrect = request.getSelectedAnswer().equals(question.getAnswer());

        UserGrammarProgressEntity progress = progressRepository.findByUserIdAndQuestionId(userId, request.getQuestionId())
                .orElse(UserGrammarProgressEntity.builder()
                        .user(user)
                        .question(question)
                        .timesDone(0)
                        .timesCorrect(0)
                        .build());

        progress.setTimesDone(progress.getTimesDone() + 1);
        if (isCorrect) {
            progress.setTimesCorrect(progress.getTimesCorrect() + 1);
        }

        List<String> recentChoices = new ArrayList<>();
        if (progress.getRecentChoices() != null && !progress.getRecentChoices().isEmpty()) {
            try {
                recentChoices = objectMapper.readValue(progress.getRecentChoices(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                log.error("Error parsing recent choices", e);
            }
        }
        
        recentChoices.add(request.getSelectedAnswer());
        if (recentChoices.size() > 5) {
            recentChoices.remove(0); // keep only 5 recent
        }

        try {
            progress.setRecentChoices(objectMapper.writeValueAsString(recentChoices));
        } catch (JsonProcessingException e) {
            log.error("Error serializing recent choices", e);
        }

        progressRepository.save(progress);
    }

    @Override
    public List<TopicProgressDetailsResponse> getGrammarProgress(Long userId) {
        List<UserGrammarProgressEntity> allProgress = progressRepository.findByUserId(userId);
        
        // Group by topic ID
        Map<CategoryEntity, List<UserGrammarProgressEntity>> progressByTopic = allProgress.stream()
                .collect(Collectors.groupingBy(p -> p.getQuestion().getTopic()));

        return progressByTopic.entrySet().stream().map(entry -> {
            CategoryEntity topic = entry.getKey();
            List<UserGrammarProgressEntity> userProgressList = entry.getValue();
            
            int totalQuestions = grammarQuestionRepository.countByTopicId(topic.getId());
            int done = userProgressList.size();
            
            List<GrammarProgressHistoryResponse> questions = userProgressList.stream().map(p -> {
                double accuracy = p.getTimesDone() == 0 ? 0 : Math.round(((double) p.getTimesCorrect() / p.getTimesDone()) * 100);
                List<String> recent = new ArrayList<>();
                if (p.getRecentChoices() != null) {
                    try {
                        recent = objectMapper.readValue(p.getRecentChoices(), new TypeReference<List<String>>() {});
                    } catch (Exception e) {}
                }
                
                return GrammarProgressHistoryResponse.builder()
                        .id(p.getQuestion().getId())
                        .questionText(p.getQuestion().getQuestionText())
                        .done(p.getTimesDone())
                        .correct(p.getTimesCorrect())
                        .accuracy(accuracy)
                        .recentChoices(recent)
                        .build();
            }).collect(Collectors.toList());

            double overallAccuracy = 0;
            if (done > 0) {
                int totalCorrect = userProgressList.stream().mapToInt(UserGrammarProgressEntity::getTimesCorrect).sum();
                int totalDone = userProgressList.stream().mapToInt(UserGrammarProgressEntity::getTimesDone).sum();
                overallAccuracy = totalDone == 0 ? 0 : Math.round(((double) totalCorrect / totalDone) * 100);
            }

            return TopicProgressDetailsResponse.builder()
                    .id(topic.getId())
                    .name(topic.getName())
                    .total(totalQuestions)
                    .done(done)
                    .accuracy(overallAccuracy)
                    .questions(questions)
                    .build();
        }).collect(Collectors.toList());
    }

    private GrammarQuestionResponse mapToQuestionResponse(GrammarQuestionEntity entity) {
        List<String> options = new ArrayList<>();
        List<Map<String, String>> vocabulary = new ArrayList<>();
        try {
            if (entity.getOptions() != null) {
                options = objectMapper.readValue(entity.getOptions(), new TypeReference<List<String>>() {});
            }
            if (entity.getVocabulary() != null) {
                vocabulary = objectMapper.readValue(entity.getVocabulary(), new TypeReference<List<Map<String, String>>>() {});
            }
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON for grammar question options/vocabulary", e);
        }

        return GrammarQuestionResponse.builder()
                .id(entity.getId())
                .topicId(entity.getTopic().getId())
                .text(entity.getQuestionText())
                .options(options)
                .answer(entity.getAnswer())
                .explanation(entity.getExplanation())
                .translation(entity.getTranslation())
                .vocabulary(vocabulary)
                .build();
    }
}
