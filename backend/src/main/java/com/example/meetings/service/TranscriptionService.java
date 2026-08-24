package com.example.meetings.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.example.meetings.config.AzureProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TranscriptionService {

    private static final Logger log =
            LoggerFactory.getLogger(TranscriptionService.class);

    private static final Duration POLL_INTERVAL =
            Duration.ofSeconds(5);

    private static final Duration MAX_WAIT =
            Duration.ofMinutes(30);

    /*
     * Azure Speech Batch Transcription API version.
     */
    private static final String API_VERSION = "2024-11-15";

    private final AzureProperties azureProperties;
    private final BlobContainerClient blobContainerClient;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public TranscriptionService(AzureProperties azureProperties) {

        this.azureProperties = azureProperties;

        /*
         * Connect to Azure Blob Storage using the
         * Azure Storage connection string.
         */
        BlobServiceClient blobServiceClient =
                new BlobServiceClientBuilder()
                        .connectionString(
                                azureProperties.getStorageConnectionString()
                        )
                        .buildClient();

        this.blobContainerClient =
                blobServiceClient.getBlobContainerClient(
                        azureProperties.getStorageContainer()
                );

        /*
         * Create container if it does not exist.
         */
        blobContainerClient.createIfNotExists();

        /*
         * Azure Speech endpoint.
         *
         * Example:
         * https://centralindia.api.cognitive.microsoft.com
         */
        this.webClient = WebClient.builder()
                .baseUrl(
                        "https://"
                                + azureProperties.getSpeechRegion()
                                + ".api.cognitive.microsoft.com"
                )
                .defaultHeader(
                        "Ocp-Apim-Subscription-Key",
                        azureProperties.getSpeechKey()
                )
                .build();

        this.objectMapper = new ObjectMapper();
    }

    /**
     * Main transcription flow.
     */
    public String transcribe(String blobName) {

        if (azureProperties.getSpeechKey() == null
                || azureProperties.getSpeechKey().isBlank()) {

            throw new TranscriptionException(
                    "AZURE_SPEECH_KEY is not set"
            );
        }

        if (azureProperties.getSpeechRegion() == null
                || azureProperties.getSpeechRegion().isBlank()) {

            throw new TranscriptionException(
                    "AZURE_SPEECH_REGION is not set"
            );
        }

        if (azureProperties.getStorageConnectionString() == null
                || azureProperties.getStorageConnectionString().isBlank()) {

            throw new TranscriptionException(
                    "AZURE_STORAGE_CONNECTION_STRING is not set"
            );
        }

        if (blobName == null || blobName.isBlank()) {

            throw new TranscriptionException(
                    "Azure Blob name is empty"
            );
        }

        log.info(
                "Starting Azure Batch Speech transcription for blob: {}",
                blobName
        );

        /*
         * 1. Generate temporary SAS URL.
         */
        String sasUrl = generateSasUrl(blobName);

        /*
         * 2. Submit Batch Speech transcription job.
         */
        String jobUrl = submitTranscriptionJob(sasUrl);

        /*
         * 3. Poll until Azure finishes.
         */
        String filesUrl = pollUntilComplete(jobUrl);

        /*
         * 4. Download transcription output.
         */
        String transcript = downloadTranscriptText(filesUrl);

        log.info(
                "Azure Batch Speech transcription completed for blob: {}",
                blobName
        );

        return transcript;
    }

    /**
     * Generate a temporary read-only SAS URL.
     */
    private String generateSasUrl(String blobName) {

        BlobClient blobClient =
                blobContainerClient.getBlobClient(blobName);

        /*
         * Verify blob exists.
         */
        if (!blobClient.exists()) {

            throw new TranscriptionException(
                    "Audio blob does not exist: " + blobName
            );
        }

        /*
         * Read-only SAS permission.
         */
        BlobSasPermission permission =
                new BlobSasPermission()
                        .setReadPermission(true);

        /*
         * SAS expires after 2 hours.
         */
        BlobServiceSasSignatureValues sasValues =
                new BlobServiceSasSignatureValues(
                        OffsetDateTime.now().plusHours(2),
                        permission
                );

        String sasToken =
                blobClient.generateSas(sasValues);

        String sasUrl =
                blobClient.getBlobUrl()
                        + "?"
                        + sasToken;

        log.info(
                "Generated temporary SAS URL for blob: {}",
                blobName
        );

        return sasUrl;
    }

    /**
     * Submit Azure Batch Speech transcription job.
     */
    private String submitTranscriptionJob(String sasUrl) {

        /*
         * IMPORTANT:
         *
         * API version 2024-11-15 uses the newer
         * "diarization" object instead of
         * "diarizationEnabled".
         */
        Map<String, Object> requestBody =
                Map.of(
                        "contentUrls",
                        List.of(sasUrl),

                        "locale",
                        "en-US",

                        "displayName",
                        "meeting-transcription",

                        "properties",
                        Map.of(
                                /*
                                 * Word-level timestamps are not
                                 * required for our current implementation.
                                 */
                                "wordLevelTimestampsEnabled",
                                false,
                                "timeToLiveHours", 6,
                                "diarization",
                                Map.of(
                                        "enabled",
                                        true,

                                        "maxSpeakers",
                                        4
                                )
                        )
                );

        log.info(
                "Submitting Azure Batch Speech transcription job"
        );

        try {

            JsonNode response =
                    webClient.post()
                            .uri(
                                    "/speechtotext/transcriptions:submit"
                                            + "?api-version="
                                            + API_VERSION
                            )
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(JsonNode.class)
                            .block();

            if (response == null) {

                throw new TranscriptionException(
                        "Azure returned an empty response when submitting transcription"
                );
            }

            log.info(
                    "Azure transcription submit response: {}",
                    response
            );

            /*
             * Azure returns the URL of the created job.
             */
            String jobUrl =
                    response.path("self").asText();

            if (jobUrl == null || jobUrl.isBlank()) {

                throw new TranscriptionException(
                        "Azure response did not contain transcription job URL: "
                                + response
                );
            }

            log.info(
                    "Azure transcription job submitted: {}",
                    jobUrl
            );

            return jobUrl;

        } catch (WebClientResponseException e) {

            log.error(
                    "Azure transcription request failed. " +
                            "Status: {}, Response body: {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString()
            );

            throw new TranscriptionException(
                    "Azure transcription request failed: "
                            + e.getResponseBodyAsString(),
                    e
            );

        } catch (TranscriptionException e) {

            throw e;

        } catch (Exception e) {

            log.error(
                    "Unexpected error while submitting Azure transcription job",
                    e
            );

            throw new TranscriptionException(
                    "Failed to submit Azure transcription job",
                    e
            );
        }
    }

    /**
     * Poll Azure until transcription job finishes.
     */
    private String pollUntilComplete(String jobUrl) {

        long deadline =
                System.currentTimeMillis()
                        + MAX_WAIT.toMillis();

        while (System.currentTimeMillis() < deadline) {

            log.info(
                    "Checking Azure transcription job status..."
            );

            JsonNode response;

            try {

                /*
                 * jobUrl is already a complete Azure URL. Passed as
                 * URI.create(...), not a String, so WebClient uses it
                 * exactly as-is instead of re-encoding it.
                 */
                response =
                        webClient.get()
                                .uri(URI.create(jobUrl))
                                .retrieve()
                                .bodyToMono(JsonNode.class)
                                .block();

            } catch (WebClientResponseException e) {

                log.error(
                        "Azure status request failed. " +
                                "Status: {}, Response body: {}",
                        e.getStatusCode(),
                        e.getResponseBodyAsString()
                );

                throw new TranscriptionException(
                        "Failed while checking Azure transcription job: "
                                + e.getResponseBodyAsString(),
                        e
                );

            } catch (Exception e) {

                throw new TranscriptionException(
                        "Failed while checking Azure transcription job",
                        e
                );
            }

            if (response == null) {

                throw new TranscriptionException(
                        "Azure returned an empty job status response"
                );
            }

            String status =
                    response.path("status").asText();

            log.info(
                    "Azure transcription status: {}",
                    status
            );

            if ("Succeeded".equalsIgnoreCase(status)) {

                String filesUrl =
                        response
                                .path("links")
                                .path("files")
                                .asText();

                if (filesUrl == null || filesUrl.isBlank()) {

                    throw new TranscriptionException(
                            "Azure transcription succeeded but no files URL was returned"
                    );
                }

                log.info(
                        "Azure transcription completed successfully"
                );

                return filesUrl;
            }

            if ("Failed".equalsIgnoreCase(status)) {

                throw new TranscriptionException(
                        "Azure transcription job failed: "
                                + response
                );
            }

            sleep(POLL_INTERVAL);
        }

        throw new TranscriptionException(
                "Azure transcription job did not finish within "
                        + MAX_WAIT
        );
    }

    /**
     * Retrieve Azure transcription output files.
     */
    private String downloadTranscriptText(String filesUrl) {

        log.info(
                "Fetching Azure transcription output files"
        );

        JsonNode filesResponse;

        try {

            /*
             * filesUrl is already a complete Azure URL -- pass as URI,
             * not String, for the same reason as pollUntilComplete.
             */
            filesResponse =
                    webClient.get()
                            .uri(URI.create(filesUrl))
                            .retrieve()
                            .bodyToMono(JsonNode.class)
                            .block();

        } catch (WebClientResponseException e) {

            log.error(
                    "Azure files request failed. " +
                            "Status: {}, Response body: {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString()
            );

            throw new TranscriptionException(
                    "Failed to retrieve Azure transcription files: "
                            + e.getResponseBodyAsString(),
                    e
            );

        } catch (Exception e) {

            throw new TranscriptionException(
                    "Failed to retrieve Azure transcription files",
                    e
            );
        }

        if (filesResponse == null) {

            throw new TranscriptionException(
                    "Azure returned an empty files response"
            );
        }

        JsonNode values =
                filesResponse.path("values");

        if (!values.isArray()) {

            throw new TranscriptionException(
                    "Unexpected Azure files response: "
                            + filesResponse
            );
        }

        for (JsonNode file : values) {

            String kind =
                    file.path("kind").asText();

            if ("Transcription".equalsIgnoreCase(kind)) {

                String contentUrl =
                        file
                                .path("links")
                                .path("contentUrl")
                                .asText();

                if (contentUrl == null
                        || contentUrl.isBlank()) {

                    throw new TranscriptionException(
                            "Azure transcription file has no content URL"
                    );
                }

                return extractTranscriptFromContentUrl(
                        contentUrl
                );
            }
        }

        throw new TranscriptionException(
                "No transcription file found in Azure job output"
        );
    }

    /**
     * Download transcription JSON and extract recognized text.
     */
    private String extractTranscriptFromContentUrl(
            String contentUrl) {

        log.info(
                "Downloading Azure transcription JSON"
        );

        JsonNode transcriptContent;

        try {

            /*
             * THE FIX: contentUrl is a SAS-signed Azure Storage URL --
             * its query string contains a "sig=" parameter with
             * characters like %2B, %2F, = that are meaningful to the
             * signature. Passing it as a plain String to .uri(...)
             * makes WebClient treat it as a URI TEMPLATE and re-encode
             * it, corrupting the signature -- that's the
             * "Signature fields not well formed" 403 error. Wrapping it
             * in URI.create(...) tells WebClient "this is already a
             * complete, correctly-encoded URL -- use it as-is."
             */
            transcriptContent =
                    webClient.get()
                            .uri(URI.create(contentUrl))
                            .retrieve()
                            .bodyToMono(JsonNode.class)
                            .block();

        } catch (WebClientResponseException e) {

            log.error(
                    "Azure transcription content request failed. " +
                            "Status: {}, Response body: {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString()
            );

            throw new TranscriptionException(
                    "Failed to download Azure transcription content: "
                            + e.getResponseBodyAsString(),
                    e
            );

        } catch (Exception e) {

            throw new TranscriptionException(
                    "Failed to download Azure transcription content",
                    e
            );
        }

        if (transcriptContent == null) {

            throw new TranscriptionException(
                    "Azure returned empty transcription content"
            );
        }

        JsonNode phrases =
                transcriptContent
                        .path("combinedRecognizedPhrases");

        if (!phrases.isArray()
                || phrases.isEmpty()) {

            throw new TranscriptionException(
                    "Azure transcription contains no recognized phrases"
            );
        }

        StringBuilder transcript =
                new StringBuilder();

        for (JsonNode phrase : phrases) {

            String text =
                    phrase.path("display").asText();

            if (text != null && !text.isBlank()) {

                if (!transcript.isEmpty()) {

                    transcript.append(" ");
                }

                transcript.append(text);
            }
        }

        if (transcript.isEmpty()) {

            throw new TranscriptionException(
                    "Azure transcription returned empty text"
            );
        }

        return transcript.toString();
    }

    /**
     * Sleep between polling attempts.
     */
    private void sleep(Duration duration) {

        try {

            Thread.sleep(duration.toMillis());

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new TranscriptionException(
                    "Interrupted while waiting for Azure transcription",
                    e
            );
        }
    }

    /**
     * Custom exception used by GlobalExceptionHandler.
     */
    public static class TranscriptionException
            extends RuntimeException {

        public TranscriptionException(String message) {
            super(message);
        }

        public TranscriptionException(
                String message,
                Throwable cause) {

            super(message, cause);
        }
    }
}