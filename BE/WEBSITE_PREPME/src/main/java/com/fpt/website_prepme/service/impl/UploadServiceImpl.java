package com.fpt.website_prepme.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.request.FileUploadResult;
import com.fpt.website_prepme.service.UploadService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private final Cloudinary cloudinary;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024L;
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024L;
    private static final long MAX_RAW_SIZE = 20 * 1024 * 1024L;

    private static final Set<String> IMAGE_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp"
    );

    private static final Set<String> VIDEO_TYPES = Set.of(
        "video/mp4",
        "video/mov",
        "video/avi",
        "video/mkv",
        "video/webm"
    );

    @Override
    public FileUploadResult upload(MultipartFile file) {
        validateFile(file);
        try {
            String contentType = file.getContentType();
            String resourceType = resolveResourceType(contentType);

            String publicId = generatePublicId(file.getOriginalFilename());
            String type = Objects.requireNonNull(file.getOriginalFilename())
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1)
                .toLowerCase();
            Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", resourceType,
                    "use_filename", true,
                    "unique_filename", false,
                    "overwrite", false
                )
            );
            FileUploadResult uploadResult = FileUploadResult.builder()
                .url((String) result.get("secure_url"))
                .publicId((String) result.get("public_id"))
                .originalName(file.getOriginalFilename())
                .type(type)
                .build();
            log.info(
                "[Cloudinary] Upload success: {} -> {}",
                file.getOriginalFilename(),
                uploadResult.getUrl()
            );
            return uploadResult;
        } catch (IOException e) {
            log.error("[Cloudinary] Upload failed: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED, e);
        }
    }

    @Override
    public List<FileUploadResult> uploadMultiple(List<MultipartFile> files) {
        List<FileUploadResult> results = new ArrayList<>();
        for (MultipartFile file : files) {
            results.add(upload(file));
        }
        return results;
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
            );
            log.info("[Cloudinary] Deleted: {}", publicId);
        } catch (IOException e) {
            log.error(
                "[Cloudinary] Delete failed: {}",
                e.getMessage(),
                e
            );
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(
                ErrorCode.BAD_REQUEST,
                "File must not be empty"
            );
        }
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new AppException(
                ErrorCode.INVALID_FILE_TYPE,
                "Cannot determine file type"
            );
        }
        long size = file.getSize();
        if (IMAGE_TYPES.contains(contentType)
            && size > MAX_IMAGE_SIZE) {

            throw new AppException(
                ErrorCode.FILE_SIZE_EXCEEDED,
                "Image must not exceed 5 MB"
            );
        }

        if (VIDEO_TYPES.contains(contentType) && size > MAX_VIDEO_SIZE) {
            throw new AppException(
                ErrorCode.FILE_SIZE_EXCEEDED,
                "Video must not exceed 100 MB"
            );
        }

        if (!IMAGE_TYPES.contains(contentType)
            && !VIDEO_TYPES.contains(contentType)
            && size > MAX_RAW_SIZE) {

            throw new AppException(
                ErrorCode.FILE_SIZE_EXCEEDED,
                "File must not exceed 20 MB"
            );
        }
    }

    private String resolveResourceType(String contentType) {
        if (contentType == null) return "auto";
        if (IMAGE_TYPES.contains(contentType) || contentType.toLowerCase().contains("pdf")) {
            return "image";
        }
        if (VIDEO_TYPES.contains(contentType)) {
            return "video";
        }
        return "auto";
    }

    private String generatePublicId(String originalFilename) {
        if (originalFilename == null) {
            return UUID.randomUUID().toString();
        }

        String fileName = getFileNameWithoutExtension(originalFilename);
        return UUID.randomUUID().toString() + "_" + fileName;
    }

    private String getFileNameWithoutExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return fileName;
        }
        return fileName.substring(0, lastDotIndex);
    }
}