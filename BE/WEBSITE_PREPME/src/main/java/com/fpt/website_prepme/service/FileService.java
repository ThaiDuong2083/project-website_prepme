package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.FileDTO;
import com.fpt.website_prepme.model.request.FileCreateRequest;
import com.fpt.website_prepme.model.request.FileUpdateRequest;
import com.fpt.website_prepme.model.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    PageResponse<FileDTO> getFiles(int page, int size, String category);
    
    FileDTO getFile(Long id);
    
    FileDTO createFile(MultipartFile file, FileCreateRequest request);
    
    FileDTO updateFile(Long id, MultipartFile file, FileUpdateRequest request);
    
    void deleteFile(Long id);
}
