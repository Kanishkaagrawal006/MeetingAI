package com.example.meetings.service;

import com.example.meetings.dto.StructuredSummary;
import com.example.meetings.entity.Meeting;
import com.example.meetings.entity.MeetingStatus;
import com.example.meetings.repository.MeetingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Drives one meeting through the full pipeline:
 *
 *   UPLOADED -> TRANSCRIBING -> TRANSCRIBED -> SUMMARIZING -> COMPLETED
 *                                                          \-> FAILED
 *
 * This runs on a background thread (@Async) so the upload endpoint returns
 * immediately with status UPLOADED, instead of making the client wait
 * through several minutes of Transcribe + Gemini calls.
 */
@Service
public class MeetingProcessingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingProcessingService.class);

    private final MeetingRepository meetingRepository;
    private final TranscriptionService transcriptionService;
    private final Summarization summarizationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MeetingProcessingService(
            MeetingRepository meetingRepository,
            TranscriptionService transcriptionService,
            Summarization summarizationService) {
        this.meetingRepository = meetingRepository;
        this.transcriptionService = transcriptionService;
        this.summarizationService = summarizationService;
    }

    @Async
    public void process(String meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElse(null);
        if (meeting == null) {
            log.warn("Meeting {} disappeared before processing could start", meetingId);
            return;
        }

        try {
            runTranscription(meeting);
            runSummarization(meeting);

            meeting.setStatus(MeetingStatus.COMPLETED);
            meetingRepository.save(meeting);
            log.info("Meeting {} fully processed", meetingId);

        } catch (Exception e) {
            log.error("Processing failed for meeting {}", meetingId, e);
            meeting.setStatus(MeetingStatus.FAILED);
            meeting.setErrorMessage(e.getMessage());
            meetingRepository.save(meeting);
        }
    }

    private void runTranscription(Meeting meeting) {
        meeting.setStatus(MeetingStatus.TRANSCRIBING);
        meetingRepository.save(meeting);

        String transcript = transcriptionService.transcribe(meeting.getAudioUrl());

        meeting.setTranscript(transcript);
        meeting.setStatus(MeetingStatus.TRANSCRIBED);
        meetingRepository.save(meeting);
    }

    private void runSummarization(Meeting meeting) {
        meeting.setStatus(MeetingStatus.SUMMARIZING);
        meetingRepository.save(meeting);

        StructuredSummary result = summarizationService.summarize(meeting.getTranscript());

        meeting.setSummary(result.summary());
        try {
            meeting.setAnalysisJson(objectMapper.writeValueAsString(result));
        } catch (Exception e) {
            // Shouldn't happen -- StructuredSummary is a plain record -- but
            // don't let a serialization hiccup fail the whole pipeline.
            log.warn("Failed to serialize StructuredSummary for meeting {}", meeting.getId(), e);
        }
        meetingRepository.save(meeting);
    }
}