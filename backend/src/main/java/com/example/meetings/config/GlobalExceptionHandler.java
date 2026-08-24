package com.example.meetings.config;

import com.example.meetings.dto.ApiError;
import com.example.meetings.service.AudioStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import com.example.meetings.service.Summarization;
import com.example.meetings.service.TranscriptionService;

import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiError> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(AudioStorageService.StorageException.class)
    public ResponseEntity<ApiError> handleStorageError(AudioStorageService.StorageException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiError.of(413, "Payload Too Large", "Uploaded file exceeds the size limit"));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiError> handleMultipartError(MultipartException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "Bad Request", "Expected a multipart/form-data upload with a 'file' part"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(500, "Internal Server Error", "Something went wrong"));
    }
    @ExceptionHandler(TranscriptionService.TranscriptionException.class)
    public ResponseEntity<ApiError> handleTranscriptionError(TranscriptionService.TranscriptionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiError.of(502, "Bad Gateway", "Transcription failed: " + ex.getMessage()));
    }

    @ExceptionHandler(Summarization.SummarizationException.class)
    public ResponseEntity<ApiError> handleSummarizationError(Summarization.SummarizationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiError.of(502, "Bad Gateway", "Summarization failed: " + ex.getMessage()));
    }
}
