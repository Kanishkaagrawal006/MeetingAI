package com.example.meetings.controller;

import com.example.meetings.dto.MeetingResponse;
import com.example.meetings.entity.Meeting;
import com.example.meetings.service.MeetingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@Tag(name = "Meetings", description = "Upload and manage meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {

        this.meetingService = meetingService;
    }

    @Operation(summary = "Upload a meeting audio file")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<MeetingResponse> uploadMeeting(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {

        Meeting meeting = meetingService.createMeeting(file, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(MeetingResponse.from(meeting));
    }

    @Operation(summary = "List all meetings")
    @GetMapping
    public List<MeetingResponse> getAllMeetings() {
        return meetingService.getAllMeetings().stream()
                .map(MeetingResponse::from)
                .toList();
    }

    @Operation(summary = "Get a single meeting by id")
    @GetMapping("/{id}")
    public MeetingResponse getMeeting(@PathVariable String id) {
        return MeetingResponse.from(meetingService.getMeetingOrThrow(id));
    }

    @Operation(summary = "Delete a meeting")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable String id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Get the raw transcript for a meeting")
    @GetMapping("/{id}/transcript")
    public ResponseEntity<String> getTranscript(@PathVariable String id) {
        String transcript = meetingService.getMeetingOrThrow(id).getTranscript();
        return transcript == null
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(transcript);
    }

    @Operation(summary = "Get the structured summary (summary, decisions, action items) for a meeting")
    @GetMapping("/{id}/summary")
    public ResponseEntity<String> getSummary(@PathVariable String id) {
        String analysisJson = meetingService.getMeetingOrThrow(id).getAnalysisJson();
        return analysisJson == null
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(analysisJson);
    }
}
