package com.example.meetings.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.transcribe.TranscribeClient;

@Configuration
@EnableConfigurationProperties({
        GeminiProperties.class,
        OpenAi.class,
        AzureProperties.class
})
public class AwsConfig {

    @Bean
    public S3Client s3Client() {
        return S3Client.builder().build();
    }

    @Bean
    public TranscribeClient transcribeClient() {
        return TranscribeClient.builder().build();
    }
}
