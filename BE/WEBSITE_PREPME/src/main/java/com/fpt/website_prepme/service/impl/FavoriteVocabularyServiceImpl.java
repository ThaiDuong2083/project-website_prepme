package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.FavoriteVocabDTO;
import com.fpt.website_prepme.model.entity.FavoriteVocabularyEntity;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.model.entity.VocabularyWordEntity;
import com.fpt.website_prepme.repository.FavoriteVocabularyRepository;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.repository.VocabularyWordRepository;
import com.fpt.website_prepme.service.FavoriteVocabularyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteVocabularyServiceImpl implements FavoriteVocabularyService {

    private final FavoriteVocabularyRepository favoriteRepository;
    private final VocabularyWordRepository wordRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteVocabDTO> getFavorites() {
        UserEntity user = getCurrentUser();
        return favoriteRepository.findAllByUserId(user.getId())
                .stream()
                .map(FavoriteVocabDTO::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countFavorites() {
        UserEntity user = getCurrentUser();
        return favoriteRepository.countByUser_IdAndIsDeleted(user.getId(), false);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<Long> getFavoriteWordIds() {
        UserEntity user = getCurrentUser();
        return favoriteRepository.findFavoriteWordIdsByUserId(user.getId());
    }

    @Override
    @Transactional
    public FavoriteVocabDTO addFavorite(Long wordId) {
        UserEntity user = getCurrentUser();
        VocabularyWordEntity word = wordRepository.findById(wordId)
                .orElseThrow(() -> new AppException(ErrorCode.WORD_NOT_FOUND));
        // Nếu đã tồn tại (kể cả soft-deleted) → restore lại
        favoriteRepository.findByUser_IdAndWord_Id(user.getId(), wordId)
                .ifPresent(existing -> {
                    if (Boolean.FALSE.equals(existing.getIsDeleted())) {
                        throw new AppException(ErrorCode.FAVORITE_ALREADY_EXISTS);
                    }
                    existing.restore();
                    favoriteRepository.save(existing);
                    log.info("[Favorite] Restored favorite wordId={} for userId={}", wordId, user.getId());
                });
        // Nếu chưa tồn tại → tạo mới
        if (!favoriteRepository.existsByUser_IdAndWord_Id(user.getId(), wordId)) {
            FavoriteVocabularyEntity fav = FavoriteVocabularyEntity.builder()
                    .user(user)
                    .word(word)
                    .build();
            favoriteRepository.save(fav);
            log.info("[Favorite] Added favorite wordId={} for userId={}", wordId, user.getId());
            return FavoriteVocabDTO.toDto(fav);
        }
        // Trường hợp đã restore → load lại entity
        FavoriteVocabularyEntity restored = favoriteRepository.findByUser_IdAndWord_Id(user.getId(), wordId)
                .orElseThrow();
        return FavoriteVocabDTO.toDto(restored);
    }

    @Override
    @Transactional
    public void removeFavorite(Long wordId) {
        UserEntity user = getCurrentUser();
        FavoriteVocabularyEntity fav = favoriteRepository
                .findByUser_IdAndWord_Id(user.getId(), wordId)
                .orElseThrow(() -> new AppException(ErrorCode.FAVORITE_NOT_FOUND));
        if (Boolean.TRUE.equals(fav.getIsDeleted())) {
            throw new AppException(ErrorCode.FAVORITE_NOT_FOUND);
        }
        fav.softDelete();
        favoriteRepository.save(fav);
    }

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));
    }
}
