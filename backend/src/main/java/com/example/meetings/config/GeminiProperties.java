package com.example.meetings.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Bound from `app.gemini.*` in application.properties. */
@ConfigurationProperties(prefix = "app.gemini")
public class GeminiProperties {

    private String apiKey;
    private String model = "gemini-2.0-flash";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}