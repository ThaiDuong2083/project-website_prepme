package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.FavoriteVocabularyEntity;
import com.fpt.website_prepme.model.entity.VocabularyWordEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FavoriteVocabDTO {
    private Long favoriteId;
    private Long wordId;
    private String word;
    private String wordType;
    private String pronunciation;
    private String meaning;
    private String exampleEn;
    private String exampleVi;
    private String level;
    private Long categoryId;
    private String categoryName;

    public static FavoriteVocabDTO toDto(FavoriteVocabularyEntity fav) {
        VocabularyWordEntity w = fav.getWord();
        return FavoriteVocabDTO.builder()
                .favoriteId(fav.getId())
                .wordId(w.getId())
                .word(w.getWord())
                .wordType(w.getWordType())
                .pronunciation(w.getPronunciation())
                .meaning(w.getMeaning())
                .exampleEn(w.getExampleEn())
                .exampleVi(w.getExampleVi())
                .level(w.getLevel())
                .categoryId(w.getCategory().getId())
                .categoryName(w.getCategory().getName())
                .build();
    }
}
