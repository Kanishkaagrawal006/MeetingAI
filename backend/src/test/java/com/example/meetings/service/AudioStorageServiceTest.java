package com.example.meetings.service;

import com.example.meetings.config.StorageProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

class AudioStorageServiceTest {

    @Test
    void storesValidAudioFileAndReturnsPath() {
        StorageProperties props = new StorageProperties();
        props.setLocation("build-test-uploads");
        AudioStorageService service = new AudioStorageService(props);

        MockMultipartFile file = new MockMultipartFile(
                "file", "meeting.mp3", "audio/mpeg", "fake-audio-bytes".getBytes());

        String path = service.store(file);

        assertTrue(path.endsWith(".mp3"));
    }

    @Test
    void rejectsUnsupportedFileType() {
        StorageProperties props = new StorageProperties();
        props.setLocation("build-test-uploads");
        AudioStorageService service = new AudioStorageService(props);

        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.txt", "text/plain", "hello".getBytes());

        assertThrows(AudioStorageService.StorageException.class, () -> service.store(file));
    }

    @Test
    void rejectsEmptyFile() {
        StorageProperties props = new StorageProperties();
        props.setLocation("build-test-uploads");
        AudioStorageService service = new AudioStorageService(props);

        MockMultipartFile file = new MockMultipartFile("file", "empty.mp3", "audio/mpeg", new byte[0]);

        assertThrows(AudioStorageService.StorageException.class, () -> service.store(file));
    }
}
