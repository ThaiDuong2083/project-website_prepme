package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.grammar.GrammarQuestionResponse;
import com.fpt.website_prepme.model.dto.grammar.GrammarSubmitRequest;
import com.fpt.website_prepme.model.dto.grammar.GrammarTopicResponse;
import com.fpt.website_prepme.model.dto.grammar.TopicProgressDetailsResponse;

import java.util.List;

public interface GrammarService {
    List<GrammarTopicResponse> getAllGrammarTopics(Long userId);

    List<GrammarQuestionResponse> getPracticeQuestions(Long topicId, int limit);
    
    void submitPracticeResult(Long userId, GrammarSubmitRequest request);
    
    List<TopicProgressDetailsResponse> getGrammarProgress(Long userId);
}
