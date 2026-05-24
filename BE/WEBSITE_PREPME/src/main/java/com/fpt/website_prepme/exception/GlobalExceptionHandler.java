package com.fpt.website_prepme.exception;

import com.fpt.website_prepme.model.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        log.warn("[AppException] code={}, message={}", ex.getErrorCode().getCode(), ex.getResolvedMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(ApiResponse.error(ex.getErrorCode().getCode(), ex.getResolvedMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = error instanceof FieldError fe ? fe.getField() : error.getObjectName();
            errors.put(field, error.getDefaultMessage());
        });

        log.warn("[ValidationException] errors={}", errors);

        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.<Map<String, String>>builder()
                        .code(ErrorCode.VALIDATION_FAILED.getCode())
                        .message(ErrorCode.VALIDATION_FAILED.getMessage())
                        .data(errors)
                        .build());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolation(
            ConstraintViolationException ex) {

        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (e1, e2) -> e1
                ));

        log.warn("[ConstraintViolation] errors={}", errors);

        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.<Map<String, String>>builder()
                        .code(ErrorCode.VALIDATION_FAILED.getCode())
                        .message(ErrorCode.VALIDATION_FAILED.getMessage())
                        .data(errors)
                        .build());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("[BadCredentials] {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ErrorCode.INVALID_CREDENTIALS.getCode(),
                        ErrorCode.INVALID_CREDENTIALS.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("[AccessDenied] {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ErrorCode.FORBIDDEN.getCode(),
                        ErrorCode.FORBIDDEN.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        log.warn("[AuthException] {}", ex.getMessage());
        ErrorCode code = ErrorCode.UNAUTHORIZED;
        if (ex instanceof DisabledException) code = ErrorCode.ACCOUNT_DISABLED;
        if (ex instanceof LockedException) code = ErrorCode.ACCOUNT_LOCKED;
        return ResponseEntity
                .status(code.getHttpStatus())
                .body(ApiResponse.error(code.getCode(), code.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("[MaxUploadSize] {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ErrorCode.FILE_SIZE_EXCEEDED.getCode(),
                        ErrorCode.FILE_SIZE_EXCEEDED.getMessage()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(
            MissingServletRequestParameterException ex) {
        String msg = String.format("Required parameter '%s' is missing", ex.getParameterName());
        log.warn("[MissingParam] {}", msg);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ErrorCode.BAD_REQUEST.getCode(), msg));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        String msg = String.format("Parameter '%s' must be of type '%s'",
                ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        log.warn("[TypeMismatch] {}", msg);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ErrorCode.BAD_REQUEST.getCode(), msg));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException ex) {
        log.warn("[NotReadable] {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ErrorCode.BAD_REQUEST.getCode(), "Malformed JSON request body"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("[UnhandledException] {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                        ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}
