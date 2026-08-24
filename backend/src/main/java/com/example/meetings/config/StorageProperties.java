package com.example.meetings.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from `app.storage.*` in application.properties.
 * Kept as its own class so swapping local disk for S3 later (Phase 5) means
 * changing one implementation, not hunting for @Value strings.
 */
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /** Directory on disk where audio files are saved. */
    private String location = "uploads";

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
