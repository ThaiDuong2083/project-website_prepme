package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.request.FileUploadResult;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "Upload files to Cloudinary CDN")
@SecurityRequirement(name = "bearerAuth")
public class UploadController {

  private final UploadService uploadService;

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload a single file (image / video / document)")
  public ResponseEntity<ApiResponse<FileUploadResult>> upload(
      @RequestPart("file") MultipartFile file) {

    FileUploadResult result = uploadService.upload(file);

    return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", result));
  }

  @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload multiple files at once")
  public ResponseEntity<ApiResponse<List<FileUploadResult>>> uploadMultiple(
      @RequestPart("files") List<MultipartFile> files) {
    List<FileUploadResult> results = uploadService.uploadMultiple(files);
    return ResponseEntity.ok(ApiResponse.success(
        "%d file(s) uploaded successfully".formatted(results.size()), results));
  }

  @DeleteMapping
  @Operation(summary = "Delete a file from Cloudinary by publicId")
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestParam String publicId) {
    uploadService.delete(publicId);
    return ResponseEntity.ok(ApiResponse.noContent());
  }

}
