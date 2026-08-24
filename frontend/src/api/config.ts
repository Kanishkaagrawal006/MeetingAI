export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ROUTES = {
  meetings: '/api/meetings',
  meeting: (id: string) => `/api/meetings/${id}`,
  meetingSummary: (id: string) => `/api/meetings/${id}/summary`,
  meetingTranscript: (id: string) => `/api/meetings/${id}/transcript`,
};
