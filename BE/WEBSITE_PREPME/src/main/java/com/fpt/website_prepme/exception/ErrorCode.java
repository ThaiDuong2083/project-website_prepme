package com.fpt.website_prepme.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INTERNAL_SERVER_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST(400, "Bad request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Unauthorized - Please login", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden - You don't have permission", HttpStatus.FORBIDDEN),
    NOT_FOUND(404, "Resource not found", HttpStatus.NOT_FOUND),
    CONFLICT(409, "Resource already exists", HttpStatus.CONFLICT),
    VALIDATION_FAILED(422, "Validation failed", HttpStatus.UNPROCESSABLE_ENTITY),

    INVALID_CREDENTIALS(1001, "Số điện thoại hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1002, "Token has expired", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(1003, "Token is invalid", HttpStatus.UNAUTHORIZED),
    TOKEN_NOT_FOUND(1004, "Token not found", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(1005, "Refresh token has expired", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED(1006, "Account is disabled", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED(1007, "Account is locked", HttpStatus.FORBIDDEN),

    USER_NOT_FOUND(2001, "User not found", HttpStatus.NOT_FOUND),
    PASSWORD_NOT_MATCH(2004, "Passwords do not match", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_INCORRECT(2005, "Old password is incorrect", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_EXISTS(2006, "Phone number already exists", HttpStatus.CONFLICT),
    PHONE_REQUIRED(2007, "Phone number is required", HttpStatus.BAD_REQUEST),
    PASSWORD_REQUIRED_FOR_LOCAL(2008, "Password is required for phone login", HttpStatus.BAD_REQUEST),

    INVALID_GOOGLE_TOKEN(2009, "Invalid Google ID token", HttpStatus.UNAUTHORIZED),
    GOOGLE_AUTH_FAILED(2010, "Google authentication failed", HttpStatus.INTERNAL_SERVER_ERROR),
    GOOGLE_ID_ALREADY_LINKED(2011, "This Google account is already linked to another user", HttpStatus.CONFLICT),

    FILE_UPLOAD_FAILED(3001, "File upload failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(3002, "File not found", HttpStatus.NOT_FOUND),
    FILE_SIZE_EXCEEDED(3003, "File size exceeds the limit", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(3004, "Invalid file type", HttpStatus.BAD_REQUEST),

    EXAMPLE_NOT_FOUND(4001, "Example not found", HttpStatus.NOT_FOUND),
    EXAMPLE_ALREADY_EXISTS(4002, "Example already exists", HttpStatus.CONFLICT),

    WORD_NOT_FOUND(5001, "Vocabulary word not found", HttpStatus.NOT_FOUND),
    FAVORITE_ALREADY_EXISTS(5002, "Word already in favorites", HttpStatus.CONFLICT),
    FAVORITE_NOT_FOUND(5003, "Favorite not found", HttpStatus.NOT_FOUND);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
