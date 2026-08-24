package com.example.meetings.service;

import com.example.meetings.entity.Meeting;
import com.example.meetings.entity.MeetingStatus;
import com.example.meetings.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final AudioStorageService audioStorageService;
    private final MeetingProcessingService meetingProcessingService;
    public MeetingService(
            MeetingRepository meetingRepository,
            AudioStorageService audioStorageService,
            MeetingProcessingService meetingProcessingService) {
        this.meetingRepository = meetingRepository;
        this.audioStorageService = audioStorageService;
        this.meetingProcessingService = meetingProcessingService;
    }

    public Meeting createMeeting(MultipartFile audioFile, String title) {
        String storedPath = audioStorageService.store(audioFile);

        String resolvedTitle = StringUtils.hasText(title)
                ? title
                : audioFile.getOriginalFilename();

        Meeting meeting = Meeting.builder()
                .title(resolvedTitle)
                .audioUrl(storedPath)
                .originalFilename(audioFile.getOriginalFilename())
                .status(MeetingStatus.UPLOADED)
                .build();

        Meeting saved =  meetingRepository.save(meeting);
        meetingProcessingService.process(saved.getId());
        return saved;

    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public Meeting getMeetingOrThrow(String id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Meeting not found: " + id));
    }

    public void deleteMeeting(String id) {
        if (!meetingRepository.existsById(id)) {
            throw new NoSuchElementException("Meeting not found: " + id);
        }
        meetingRepository.deleteById(id);
    }
}
