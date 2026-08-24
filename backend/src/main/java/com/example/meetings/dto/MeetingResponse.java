package com.example.meetings.dto;

import com.example.meetings.entity.Meeting;
import com.example.meetings.entity.MeetingStatus;

import java.time.Instant;


public record MeetingResponse(
        String id,
        String title,
        MeetingStatus status,
        String originalFilename,
        Double duration,
        Instant createdAt,
        Instant updatedAt
) {
    public static MeetingResponse from(Meeting meeting) {
        return new MeetingResponse(
                meeting.getId(),
                meeting.getTitle(),
                meeting.getStatus(),
                meeting.getOriginalFilename(),
                meeting.getDuration(),
                meeting.getCreatedAt(),
                meeting.getUpdatedAt()
        );
    }
}
