import { apiClient } from './client';
import { API_ROUTES } from './config';
import type { Meeting, MeetingDetails, StructuredSummary, TranscriptResponse } from '../types/meeting';
import { normalizeTranscript } from '../types/meeting';

export async function fetchMeetings(): Promise<Meeting[]> {
  const { data } = await apiClient.get<Meeting[]>(API_ROUTES.meetings);
  return data;
}

export async function fetchMeeting(id: string): Promise<Meeting> {
  const { data } = await apiClient.get<Meeting>(API_ROUTES.meeting(id));
  return data;
}

export async function fetchMeetingSummary(id: string): Promise<StructuredSummary> {
  const { data } = await apiClient.get<StructuredSummary>(API_ROUTES.meetingSummary(id));
  return data;
}

export async function fetchMeetingTranscript(id: string): Promise<string> {
  const { data } = await apiClient.get<TranscriptResponse>(API_ROUTES.meetingTranscript(id));
  return normalizeTranscript(data);
}

/**
 * Loads a meeting plus, when it's completed, its summary and transcript.
 * The base meeting resource never contains these — they must be fetched
 * from their own endpoints.
 */
export async function fetchMeetingDetails(id: string): Promise<MeetingDetails> {
  const meeting = await fetchMeeting(id);

  if (meeting.status !== 'COMPLETED') {
    return { ...meeting, summary: null, transcript: null };
  }

  const [summary, transcript] = await Promise.all([
    fetchMeetingSummary(id).catch(() => null),
    fetchMeetingTranscript(id).catch(() => null),
  ]);

  return { ...meeting, summary, transcript };
}

export async function uploadMeeting(file: File, onProgress?: (percent: number) => void): Promise<Meeting> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<Meeting>(API_ROUTES.meetings, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export async function deleteMeeting(id: string): Promise<void> {
  await apiClient.delete(API_ROUTES.meeting(id));
}

export function isProcessing(status: Meeting['status']): boolean {
  return status === 'UPLOADED' || status === 'UPLOADING' || status === 'TRANSCRIBING' || status === 'SUMMARIZING';
}
