package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.FavoriteVocabDTO;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.FavoriteVocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/vocabulary/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorite Vocabulary", description = "APIs for managing user favorite vocabulary words")
@SecurityRequirement(name = "bearerAuth")
public class FavoriteVocabularyController {

    private final FavoriteVocabularyService favoriteService;

    @GetMapping
    @Operation(summary = "Get all favorite words of current user")
    public ResponseEntity<ApiResponse<List<FavoriteVocabDTO>>> getFavorites() {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavorites()));
    }

    @GetMapping("/count")
    @Operation(summary = "Get count of favorite words")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countFavorites() {
        long count = favoriteService.countFavorites();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @GetMapping("/ids")
    @Operation(summary = "Get set of favorited word IDs (for highlighting hearts)")
    public ResponseEntity<ApiResponse<Set<Long>>> getFavoriteWordIds() {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavoriteWordIds()));
    }

    @PostMapping("/{wordId}")
    @Operation(summary = "Add a word to favorites")
    public ResponseEntity<ApiResponse<FavoriteVocabDTO>> addFavorite(@PathVariable Long wordId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.addFavorite(wordId)));
    }

    @DeleteMapping("/{wordId}")
    @Operation(summary = "Remove a word from favorites")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long wordId) {
        favoriteService.removeFavorite(wordId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
