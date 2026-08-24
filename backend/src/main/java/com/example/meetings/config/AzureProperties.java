package com.example.meetings.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.azure")
public class AzureProperties {

    private String speechKey;
    private String speechRegion;
    private String storageConnectionString;
    private String storageContainer;

    public String getSpeechKey() {
        return speechKey;
    }

    public void setSpeechKey(String speechKey) {
        this.speechKey = speechKey;
    }

    public String getSpeechRegion() {
        return speechRegion;
    }

    public void setSpeechRegion(String speechRegion) {
        this.speechRegion = speechRegion;
    }

    public String getStorageConnectionString() {
        return storageConnectionString;
    }

    public void setStorageConnectionString(String storageConnectionString) {
        this.storageConnectionString = storageConnectionString;
    }

    public String getStorageContainer() {
        return storageContainer;
    }

    public void setStorageContainer(String storageContainer) {
        this.storageContainer = storageContainer;
    }
}