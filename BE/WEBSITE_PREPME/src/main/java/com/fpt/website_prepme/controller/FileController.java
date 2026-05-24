package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.FileService;
import com.fpt.website_prepme.model.request.FileUploadResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "Upload files to Cloudinary CDN")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single file (image / video / document)")
    public ResponseEntity<ApiResponse<FileUploadResult>> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String folder) {

        FileUploadResult result = folder != null && !folder.isBlank()
                ? fileService.upload(file, folder)
                : fileService.upload(file);

        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", result));
    }

    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple files at once")
    public ResponseEntity<ApiResponse<List<FileUploadResult>>> uploadMultiple(
            @RequestPart("files") List<MultipartFile> files,
            @RequestParam(required = false) String folder) {

        List<FileUploadResult> results = folder != null && !folder.isBlank()
                ? fileService.uploadMultiple(files, folder)
                : fileService.uploadMultiple(files);

        return ResponseEntity.ok(ApiResponse.success(
                "%d file(s) uploaded successfully".formatted(results.size()), results));
    }

    @DeleteMapping
    @Operation(summary = "Delete a file from Cloudinary by publicId")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestParam String publicId,
            @RequestParam(defaultValue = "image") String resourceType) {
        fileService.delete(publicId, resourceType);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
