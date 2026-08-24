package com.example.meetings.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Bound from `app.openai.*` in application.properties. */
@ConfigurationProperties(prefix = "app.openai")
public class OpenAi {

    private String apiKey;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}