package com.example.meetings.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.example.meetings.config.AzureProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
public class AudioStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("mp3", "wav", "m4a", "mp4", "webm", "ogg");

    private final BlobContainerClient containerClient;

    public AudioStorageService(AzureProperties properties) {

        BlobServiceClient blobServiceClient =
                new BlobServiceClientBuilder()
                        .connectionString(properties.getStorageConnectionString())
                        .buildClient();

        this.containerClient =
                blobServiceClient.getBlobContainerClient(
                        properties.getStorageContainer()
                );

        containerClient.createIfNotExists();
    }

    public String store(MultipartFile file) {

        if (file.isEmpty()) {
            throw new StorageException("Cannot store empty file");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? "audio"
                        : file.getOriginalFilename()
        );

        String extension = getExtension(originalFilename);

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new StorageException(
                    "Unsupported audio format: ." + extension
                            + " (allowed: " + ALLOWED_EXTENSIONS + ")"
            );
        }

        String blobName = UUID.randomUUID() + "." + extension;

        try {
            BlobClient blobClient = containerClient.getBlobClient(blobName);

            blobClient.upload(
                    file.getInputStream(),
                    file.getSize(),
                    true
            );

            return blobName;

        } catch (IOException e) {
            throw new StorageException(
                    "Failed to store file " + originalFilename,
                    e
            );
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot == -1 ? "" : filename.substring(dot + 1);
    }

    public static class StorageException extends RuntimeException {

        public StorageException(String message) {
            super(message);
        }

        public StorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}