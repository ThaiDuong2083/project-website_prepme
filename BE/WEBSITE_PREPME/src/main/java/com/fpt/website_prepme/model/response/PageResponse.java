package com.fpt.website_prepme.model.response;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
public class PageResponse<T> {

    private final List<T> content;
    private final PaginationMeta pagination;

    @Getter
    @Builder
    public static class PaginationMeta {
        private final int page;
        private final int size;
        private final long totalElements;
        private final int totalPages;
        private final boolean first;
        private final boolean last;
    }

    public static <T> ApiResponse<PageResponse<T>> of(Page<T> page) {
        PageResponse<T> pageResponse = PageResponse.<T>builder()
                .content(page.getContent())
                .pagination(PaginationMeta.builder()
                        .page(page.getNumber() + 1) // 1-based for clients
                        .size(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .first(page.isFirst())
                        .last(page.isLast())
                        .build())
                .build();

        return ApiResponse.<PageResponse<T>>builder()
                .code(200)
                .message("Success")
                .data(pageResponse)
                .build();
    }

    public static <T> ApiResponse<PageResponse<T>> of(Page<T> page, String message) {
        PageResponse<T> pageResponse = PageResponse.<T>builder()
                .content(page.getContent())
                .pagination(PaginationMeta.builder()
                        .page(page.getNumber() + 1)
                        .size(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .first(page.isFirst())
                        .last(page.isLast())
                        .build())
                .build();

        return ApiResponse.<PageResponse<T>>builder()
                .code(200)
                .message(message)
                .data(pageResponse)
                .build();
    }
}
