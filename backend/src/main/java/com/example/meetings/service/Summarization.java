package com.example.meetings.service;

import com.example.meetings.config.GeminiProperties;
import com.example.meetings.dto.StructuredSummary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class Summarization {

    private static final Logger log = LoggerFactory.getLogger(Summarization.class);

    private static final String PROMPT_TEMPLATE = """
            You are analyzing a meeting transcript. Return ONLY valid JSON
            (no markdown fences, no commentary) matching exactly this shape:

            {
              "summary": "2-4 sentence overview of what was discussed",
              "keyDecisions": ["decision 1", "decision 2"],
              "actionItems": [
                {"task": "...", "assignee": "... or null", "deadline": "... or null", "priority": "HIGH|MEDIUM|LOW"}
              ],
              "risks": ["risk 1"]
            }

            Rules:
            - If the transcript doesn't specify an assignee or deadline for a
              task, use null. Do NOT invent or guess a name or date.
            - If there are no risks mentioned, return an empty array for risks.
            - keyDecisions and actionItems should be empty arrays if none exist.

            Transcript:
            %s
            """;

    private final WebClient webClient;
    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Summarization(GeminiProperties geminiProperties) {
        this.geminiProperties = geminiProperties;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public StructuredSummary summarize(String transcript) {
        if (geminiProperties.getApiKey() == null || geminiProperties.getApiKey().isBlank()) {
            throw new SummarizationException("GEMINI_API_KEY is not set");
        }

        String prompt = PROMPT_TEMPLATE.formatted(transcript);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", prompt)})
                },
                "generationConfig", Map.of("responseMimeType", "application/json")
        );

        String rawJson = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/{model}:generateContent")
                        .queryParam("key", geminiProperties.getApiKey())
                        .build(geminiProperties.getModel()))
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        String summaryJson = extractTextFromGeminiResponse(rawJson);
        return parseStructuredSummary(summaryJson);
    }
    private String extractTextFromGeminiResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode textNode = root.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text");

            if (textNode.isMissingNode()) {
                throw new SummarizationException("Unexpected Gemini response shape: " + rawJson);
            }
            return textNode.asText();
        } catch (Exception e) {
            throw new SummarizationException("Failed to parse Gemini response envelope", e);
        }
    }

    private StructuredSummary parseStructuredSummary(String summaryJson) {
        try {
            return objectMapper.readValue(summaryJson, StructuredSummary.class);
        } catch (Exception e) {
            log.error("Gemini did not return valid StructuredSummary JSON: {}", summaryJson);
            throw new SummarizationException("Failed to parse structured summary from Gemini", e);
        }
    }

    public static class SummarizationException extends RuntimeException {
        public SummarizationException(String message) {
            super(message);
        }

        public SummarizationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}