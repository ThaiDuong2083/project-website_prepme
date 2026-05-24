package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.request.FileUploadResult;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {

     FileUploadResult upload(MultipartFile file);

     FileUploadResult upload(MultipartFile file, String folder);

     void delete(String publicId, String resourceType);

    List<FileUploadResult> uploadMultiple(List<MultipartFile> files);

    void delete(String publicId);

    List<FileUploadResult> uploadMultiple(List<MultipartFile> files, String folder);
}
