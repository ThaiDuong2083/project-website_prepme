package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.request.FileUploadResult;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {

    FileUploadResult upload(MultipartFile file);

    List<FileUploadResult> uploadMultiple(List<MultipartFile> files);

    void delete(String publicId);
}
