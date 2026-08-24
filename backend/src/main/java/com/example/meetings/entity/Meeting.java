package com.example.meetings.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    /*
     * Azure Blob/S3 URL.
     *
     * This can contain a long SAS query string,
     * so it must not be limited to VARCHAR(255).
     */
    @Lob
    @Column(name = "audio_url", nullable = false, columnDefinition = "TEXT")
    private String audioUrl;

    @Column(name = "original_filename")
    private String originalFilename;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MeetingStatus status = MeetingStatus.UPLOADED;

    /*
     * Full Azure transcription can be very large.
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String transcript;

    /*
     * Gemini/AI analysis JSON can also be large.
     */
    @Lob
    @Column(name = "analysis_json", columnDefinition = "TEXT")
    private String analysisJson;

    /*
     * Generated meeting summary.
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    private Double duration;

    /*
     * Error messages can contain Azure/API responses,
     * stack information, etc., so don't restrict to 255.
     */
    @Lob
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = MeetingStatus.UPLOADED;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}