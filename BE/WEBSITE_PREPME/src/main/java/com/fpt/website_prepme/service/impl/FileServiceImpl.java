package com.fpt.website_prepme.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.request.FileUploadResult;
import com.fpt.website_prepme.service.FileService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.folder}")
    private String baseFolder;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024L;   // 5 MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024L; // 100 MB
    private static final long MAX_RAW_SIZE   = 20 * 1024 * 1024L;  // 20 MB

    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "image/webp", "image/svg+xml", "image/bmp"
    );
    private static final Set<String> VIDEO_TYPES = Set.of(
            "video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm"
    );

    public FileUploadResult upload(MultipartFile file) {
        return upload(file, baseFolder);
    }

    public FileUploadResult upload(MultipartFile file, String folder) {
        validateFile(file);
        String resourceType = resolveResourceType(file.getContentType());

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder",         folder,
                            "resource_type",  resourceType,
                            "use_filename",   true,
                            "unique_filename", true,
                            "overwrite",      false
                    )
            );

            FileUploadResult uploadResult = FileUploadResult.builder()
                    .url((String) result.get("secure_url"))
                    .publicId((String) result.get("public_id"))
                    .originalName(file.getOriginalFilename())
                    .format(result.get("format") != null ? (String) result.get("format") : "")
                    .sizeBytes(file.getSize())
                    .width(result.get("width") != null ? (int) result.get("width") : 0)
                    .height(result.get("height") != null ? (int) result.get("height") : 0)
                    .resourceType(resourceType)
                    .build();

            log.info("[File] Uploaded: {} → {}", file.getOriginalFilename(), uploadResult.getUrl());
            return uploadResult;

        } catch (IOException e) {
            log.error("[File] Upload failed: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED, e);
        }
    }

    public List<FileUploadResult> uploadMultiple(List<MultipartFile> files) {
        return uploadMultiple(files, baseFolder);
    }

    public List<FileUploadResult> uploadMultiple(List<MultipartFile> files, String folder) {
        List<FileUploadResult> results = new ArrayList<>();
        for (MultipartFile file : files) {
            results.add(upload(file, folder));
        }
        return results;
    }

    public void delete(String publicId) {
        delete(publicId, "image");
    }

    public void delete(String publicId, String resourceType) {
        try {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType));
            log.info("[File] Deleted publicId={}", publicId);
        } catch (IOException e) {
            log.error("[File] Delete failed for publicId={}: {}", publicId, e.getMessage(), e);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED, e);
        }
    }


    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "File must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE, "Cannot determine file type");
        }

        long size = file.getSize();
        if (IMAGE_TYPES.contains(contentType) && size > MAX_IMAGE_SIZE) {
            throw new AppException(ErrorCode.FILE_SIZE_EXCEEDED,
                    "Image must not exceed 5 MB");
        }
        if (VIDEO_TYPES.contains(contentType) && size > MAX_VIDEO_SIZE) {
            throw new AppException(ErrorCode.FILE_SIZE_EXCEEDED,
                    "Video must not exceed 100 MB");
        }
        if (!IMAGE_TYPES.contains(contentType) && !VIDEO_TYPES.contains(contentType)
                && size > MAX_RAW_SIZE) {
            throw new AppException(ErrorCode.FILE_SIZE_EXCEEDED,
                    "File must not exceed 20 MB");
        }
    }

    private String resolveResourceType(String contentType) {
        if (contentType == null) return "raw";
        if (IMAGE_TYPES.contains(contentType)) return "image";
        if (VIDEO_TYPES.contains(contentType)) return "video";
        return "raw";
    }
}
