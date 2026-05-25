package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.dto.FileDTO;
import com.fpt.website_prepme.model.request.FileCreateRequest;
import com.fpt.website_prepme.model.request.FileUpdateRequest;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.service.FileService;
import com.fpt.website_prepme.service.UploadService;
import com.fpt.website_prepme.model.request.FileUploadResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

    @GetMapping
    @Operation(summary = "Get list of files with pagination and optional filters")
    public ResponseEntity<ApiResponse<PageResponse<FileDTO>>> getFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category) {
        
        return ResponseEntity.ok(ApiResponse.success("success", fileService.getFiles(page, size, category)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file details by ID")
    public ResponseEntity<ApiResponse<FileDTO>> getFile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("success", fileService.getFile(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create file record in database and upload file to Cloudinary")
    public ResponseEntity<ApiResponse<FileDTO>> createFile(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "data") @Valid FileCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("success", fileService.createFile(file, request)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update file record and optionally upload new file")
    public ResponseEntity<ApiResponse<FileDTO>> updateFile(
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @ModelAttribute FileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("success", fileService.updateFile(id, file, request)));
    }

    @DeleteMapping("/{id}/record")
    @Operation(summary = "Delete file record from DB and Cloudinary")
    public ResponseEntity<ApiResponse<Void>> deleteFileRecord(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
