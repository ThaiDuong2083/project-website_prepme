package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.enums.VocabularyStatus;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.CategoryCountDTO;
import com.fpt.website_prepme.model.dto.CategoryDTO;
import com.fpt.website_prepme.model.dto.VocabWordDTO;
import com.fpt.website_prepme.model.entity.CategoryEntity;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.model.entity.VocabularyProgressEntity;
import com.fpt.website_prepme.model.entity.VocabularyWordEntity;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.repository.VocabCategoryRepository;
import com.fpt.website_prepme.repository.VocabularyProgressRepository;
import com.fpt.website_prepme.repository.VocabularyWordRepository;
import com.fpt.website_prepme.service.VocabularyService;
import com.fpt.website_prepme.utils.AppConstant;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl implements VocabularyService {

    private final VocabCategoryRepository categoryRepository;
    private final VocabularyWordRepository wordRepository;
    private final VocabularyProgressRepository progressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getVocabSets() {
        List<CategoryEntity> entities = categoryRepository.findAllByTypeAndParentIsNull(AppConstant.VOCAB_SET);
        List<Long> categoryIds = entities.stream()
            .map(CategoryEntity::getId)
            .toList();
        if (categoryIds.isEmpty()) return Collections.emptyList();
        List<CategoryCountDTO> counts = wordRepository.countWordsGroupByParentCategory(categoryIds);
        Map<Long, Long> countMap = counts.stream()
            .collect(Collectors.toMap(
                CategoryCountDTO::getCategoryId,
                CategoryCountDTO::getCount
            ));
        UserEntity currentUser = getCurrentUser();
        Set<Long> learningSetIds = new HashSet<>(
            progressRepository.findSetIdsWithLearningStatus(currentUser.getId(), categoryIds)
        );
        return entities.stream().map(e -> {
            CategoryDTO dto = CategoryDTO.toDto(e);
            dto.setWordCount(countMap.getOrDefault(e.getId(), 0L).intValue());
            dto.setStatus(learningSetIds.contains(e.getId()) ? "LEARNING" : "NOT_LEARNED");
            return dto;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getTopicsBySetId(Long setId) {
        List<CategoryEntity> topics = categoryRepository.findAllByParentId(setId);
        if (topics.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> topicIds = topics.stream().map(CategoryEntity::getId).toList();
        UserEntity currentUser = getCurrentUser();
        Set<Long> learningTopicIds = new HashSet<>(
            progressRepository.findTopicIdsWithLearningStatus(currentUser.getId(), topicIds)
        );
        return topics.stream().map(e -> {
            CategoryDTO dto = CategoryDTO.toDto(e);
            dto.setStatus(learningTopicIds.contains(e.getId()) ? "LEARNING" : "NOT_LEARNED");
            return dto;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VocabWordDTO> getWords(List<Long> topicIds, String level, Pageable pageable) {
        UserEntity currentUser = getCurrentUser();
        Page<VocabularyWordEntity> page = wordRepository.findAllByTopicIdsAndLevel(topicIds, level, pageable);
        List<Long> wordIds = page.getContent().stream().map(VocabularyWordEntity::getId).collect(Collectors.toList());
        Map<Long, VocabularyProgressEntity> progressMap = getProgressMap(currentUser.getId(), wordIds);
        List<VocabWordDTO> content = page.getContent().stream()
                .map(word -> VocabWordDTO.toDto(word, progressMap.get(word.getId())))
            .toList();
        PageResponse.PaginationMeta pagination = PageResponse.PaginationMeta.builder()
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
        return PageResponse.<VocabWordDTO>builder()
                .content(content)
                .pagination(pagination)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VocabWordDTO> getFlashcardSession(List<Long> topicIds, boolean shuffle) {
        UserEntity currentUser = getCurrentUser();
        List<VocabularyWordEntity> words = wordRepository.findAllByTopicIdsForFlashcard(topicIds);
        if (shuffle) {
            Collections.shuffle(words);
        }
        List<Long> wordIds = words.stream().map(VocabularyWordEntity::getId).toList();
        Map<Long, VocabularyProgressEntity> progressMap = getProgressMap(currentUser.getId(), wordIds);

        return words.stream()
                .map(word -> VocabWordDTO.toDto(word, progressMap.get(word.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int startLearningTopics(List<Long> topicIds) {
        UserEntity currentUser = getCurrentUser();
        List<VocabularyWordEntity> words = wordRepository.findAllByTopicIdsForFlashcard(topicIds);
        if (words.isEmpty()) {
            return 0;
        }
        List<Long> wordIds = words.stream().map(VocabularyWordEntity::getId).toList();
        Map<Long, VocabularyProgressEntity> existingMap = progressRepository
                .findByUserIdAndWordIdIn(currentUser.getId(), wordIds)
                .stream()
                .collect(Collectors.toMap(p -> p.getWord().getId(), p -> p));
        List<VocabularyProgressEntity> toSave = new java.util.ArrayList<>();
        for (VocabularyWordEntity word : words) {
            VocabularyProgressEntity progress = existingMap.get(word.getId());
            if (progress == null) {
                toSave.add(VocabularyProgressEntity.builder()
                        .user(currentUser)
                        .word(word)
                        .status(VocabularyStatus.LEARNING)
                        .build());
            } else if (progress.getStatus() == VocabularyStatus.NOT_LEARNED) {
                progress.setStatus(VocabularyStatus.LEARNING);
                toSave.add(progress);
            }
        }
        progressRepository.saveAll(toSave);
        return toSave.size();
    }

    @Override
    public List<VocabWordDTO> searchWords(String keyword) {
        List<VocabularyWordEntity> words = wordRepository.searchByKeyword(keyword);
        if (words.isEmpty()) {
            return Collections.emptyList();
        }
        return words.stream().map(VocabWordDTO::toDto).toList();
    }

    private Map<Long, VocabularyProgressEntity> getProgressMap(Long userId, List<Long> wordIds) {
        if (wordIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return progressRepository.findByUserIdAndWordIdIn(userId, wordIds).stream()
                .collect(Collectors.toMap(p -> p.getWord().getId(), p -> p));
    }

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));
    }
}
