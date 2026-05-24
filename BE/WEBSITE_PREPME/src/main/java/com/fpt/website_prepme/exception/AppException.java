package com.fpt.website_prepme.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String customMessage;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.customMessage = null;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    public AppException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.customMessage = null;
    }

    public String getResolvedMessage() {
        return customMessage != null ? customMessage : errorCode.getMessage();
    }
}
