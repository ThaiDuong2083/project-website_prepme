package com.fpt.website_prepme.model.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileUploadResult {
    private String url;
    private String publicId;
    private String originalName;
    private String format;
    private long sizeBytes;
    private int width;
    private int height;
    private String resourceType;
}
