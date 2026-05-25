package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.VocabularyProgressEntity;
import com.fpt.website_prepme.model.entity.VocabularyWordEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VocabWordDTO {
    private Long id;
    private String word;
    private String wordType;
    private String pronunciation;
    private String meaning;
    private String exampleEn;
    private String exampleVi;
    private String level;
    private Long categoryId;
    private String categoryName;
    private String categoryPath;
    private String userStatus;

    public static VocabWordDTO toDto(VocabularyWordEntity word, VocabularyProgressEntity progress) {
        String catPath = word.getCategory().getName();
        if (word.getCategory().getParent() != null) {
            catPath = word.getCategory().getParent().getName() + " - " + catPath;
        }
        return VocabWordDTO.builder()
            .id(word.getId())
            .word(word.getWord())
            .wordType(word.getWordType())
            .pronunciation(word.getPronunciation())
            .meaning(word.getMeaning())
            .exampleEn(word.getExampleEn())
            .exampleVi(word.getExampleVi())
            .level(word.getLevel())
            .categoryId(word.getCategory().getId())
            .categoryName(word.getCategory().getName())
            .categoryPath(catPath)
            .build();
    }

    public static VocabWordDTO toDto(VocabularyWordEntity word) {
        return VocabWordDTO.builder()
            .id(word.getId())
            .word(word.getWord())
            .wordType(word.getWordType())
            .pronunciation(word.getPronunciation())
            .meaning(word.getMeaning())
            .exampleEn(word.getExampleEn())
            .exampleVi(word.getExampleVi())
            .level(word.getLevel())
            .categoryId(word.getCategory().getId())
            .categoryName(word.getCategory().getName())
            .build();
    }
}
