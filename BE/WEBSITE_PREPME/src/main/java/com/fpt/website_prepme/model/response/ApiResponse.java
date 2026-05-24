package com.fpt.website_prepme.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final int code;
    private final String message;
    private final T data;

    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();


    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message("Success")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .code(201)
                .message("Created successfully")
                .data(data)
                .build();
    }

    public static ApiResponse<Void> noContent() {
        return ApiResponse.<Void>builder()
                .code(204)
                .message("No content")
                .build();
    }

    public static ApiResponse<Void> error(int code, String message) {
        return ApiResponse.<Void>builder()
                .code(code)
                .message(message)
                .build();
    }
}
