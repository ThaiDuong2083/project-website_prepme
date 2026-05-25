package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.CategoryDTO;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.model.dto.VocabWordDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VocabularyService {
    List<CategoryDTO> getVocabSets();
    List<CategoryDTO> getTopicsBySetId(Long setId);
    PageResponse<VocabWordDTO> getWords(List<Long> topicIds, String level, Pageable pageable);
    List<VocabWordDTO> getFlashcardSession(List<Long> topicIds, boolean shuffle);
    int startLearningTopics(List<Long> topicIds);
    List<VocabWordDTO> searchWords(String keyword);
}
