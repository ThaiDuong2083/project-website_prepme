package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.FileDTO;
import com.fpt.website_prepme.model.entity.FileEntity;
import com.fpt.website_prepme.model.request.FileCreateRequest;
import com.fpt.website_prepme.model.request.FileUpdateRequest;
import com.fpt.website_prepme.model.request.FileUploadResult;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.repository.FileRepository;
import com.fpt.website_prepme.service.FileService;
import com.fpt.website_prepme.service.UploadService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final UploadService uploadService;

    @Override
    public PageResponse<FileDTO> getFiles(int page, int size, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        Page<FileEntity> filePage = fileRepository.findByCategory(category, pageable);
        
        List<FileDTO> dtoList = filePage.getContent().stream()
                .map(FileDTO::toDto)
                .toList();
        
        return PageResponse.<FileDTO>builder()
                .content(dtoList)
                .pagination(PageResponse.PaginationMeta.builder()
                        .page(filePage.getNumber() + 1)
                        .size(filePage.getSize())
                        .totalElements(filePage.getTotalElements())
                        .totalPages(filePage.getTotalPages())
                        .first(filePage.isFirst())
                        .last(filePage.isLast())
                        .build())
                .build();
    }

    @Override
    public FileDTO getFile(Long id) {
        return fileRepository.findById(id).map(FileDTO::toDto)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND, "File not found"));
    }

    @Override
    public FileDTO createFile(MultipartFile file, FileCreateRequest request) {
        FileEntity entity = new FileEntity();
        entity.setTitle(request.getTitle());
        entity.setCategory(request.getCategory());

        if (file != null && !file.isEmpty()) {
            FileUploadResult result = uploadService.upload(file);
            entity.setUrl(result.getUrl());
            entity.setPublicId(result.getPublicId());
            entity.setFileName(result.getOriginalName());
            entity.setType(result.getType());
        } else {
            throw new AppException(ErrorCode.BAD_REQUEST, "File must not be empty");
        }

        entity.setUploadedAt(java.time.LocalDateTime.now());
        return FileDTO.toDto(fileRepository.save(entity));
    }

    @Override
    public FileDTO updateFile(Long id, MultipartFile file, FileUpdateRequest request) {
        FileEntity entity = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND, "File not found"));
        
        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getCategory() != null) entity.setCategory(request.getCategory());

        if (file != null && !file.isEmpty()) {
            if (entity.getPublicId() != null && !entity.getPublicId().isEmpty()) {
                try {
                    uploadService.delete(entity.getPublicId());
                } catch (Exception e) {
                    log.warn("Failed to delete old file from Cloudinary: {}", e.getMessage());
                }
            }
            FileUploadResult result = uploadService.upload(file);
            entity.setUrl(result.getUrl());
            entity.setPublicId(result.getPublicId());
            entity.setFileName(result.getOriginalName());
            entity.setType(result.getType());
        }
        
        return FileDTO.toDto(fileRepository.save(entity));
    }

    @Override
    public void deleteFile(Long id) {
        FileEntity entity = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND, "File not found"));
        if (entity.getPublicId() != null && !entity.getPublicId().isEmpty()) {
            try {
                uploadService.delete(entity.getPublicId());
            } catch (Exception e) {
                log.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
            }
        }
        fileRepository.delete(entity);
    }
}
