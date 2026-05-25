package com.fpt.website_prepme.model.dto;

import com.fpt.website_prepme.model.entity.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileDTO {
    private Long id;
    private String title;
    private String fileName;
    private String url;
    private LocalDateTime uploadedAt;
    private String publicId;
    private String type;
    private String category;

    public static FileDTO toDto(FileEntity entity) {
        return com.fpt.website_prepme.model.dto.FileDTO.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .fileName(entity.getFileName())
            .url(entity.getUrl())
            .uploadedAt(entity.getUploadedAt())
            .publicId(entity.getPublicId())
            .type(entity.getType())
            .category(entity.getCategory())
            .build();
    }
}
