package com.example.meetings.entity;

/**
 * Tracks where a meeting is in the processing pipeline.
 * We model this explicitly (rather than a boolean "done" flag) because the
 * frontend needs to show live progress, and Phase 3 will drive async workers
 * off these states.
 */
public enum MeetingStatus {
    UPLOADED,
    TRANSCRIBING,
    TRANSCRIBED,
    SUMMARIZING,
    COMPLETED,
    FAILED
}
