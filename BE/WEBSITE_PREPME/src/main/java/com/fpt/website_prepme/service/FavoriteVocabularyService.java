package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.FavoriteVocabDTO;

import java.util.List;
import java.util.Set;

public interface FavoriteVocabularyService {

    List<FavoriteVocabDTO> getFavorites();

    long countFavorites();

    Set<Long> getFavoriteWordIds();

    FavoriteVocabDTO addFavorite(Long wordId);

    void removeFavorite(Long wordId);
}
