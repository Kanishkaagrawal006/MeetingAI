import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMeeting,
  fetchMeetingDetails,
  fetchMeetings,
  isProcessing,
  uploadMeeting,
} from '../api/meetings';

const MEETINGS_KEY = ['meetings'];
const MEETING_DETAILS_KEY = (id: string) => ['meeting', id];

export function useMeetingsList() {
  return useQuery({
    queryKey: MEETINGS_KEY,
    queryFn: fetchMeetings,
    // Keep the dashboard fresh in case anything is still processing.
    refetchInterval: (query) => {
      const meetings = query.state.data;
      if (meetings?.some((m) => isProcessing(m.status))) return 4000;
      return false;
    },
  });
}

export function useMeetingDetails(id: string | undefined) {
  return useQuery({
    queryKey: MEETING_DETAILS_KEY(id ?? ''),
    queryFn: () => fetchMeetingDetails(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const meeting = query.state.data;
      if (meeting && isProcessing(meeting.status)) return 3000;
      return false;
    },
  });
}

export function useUploadMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) =>
      uploadMeeting(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
}
