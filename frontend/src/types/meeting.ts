export type MeetingStatus =
  | 'UPLOADED'
  | 'UPLOADING'
  | 'TRANSCRIBING'
  | 'SUMMARIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface Meeting {
  id: string;
  title: string;
  originalFilename: string;
  status: MeetingStatus;
  createdAt: string;
  durationSeconds: number | null;
  errorMessage?: string | null;
  /**
   * Lightweight preview data the list endpoint may include so the dashboard
   * doesn't need to call /summary for every card. Optional and defensive:
   * if the backend doesn't send it, the card falls back to a placeholder.
   */
  summaryPreview?: {
    text: string | null;
    actionCount: number;
    decisionCount: number;
    riskCount: number;
  } | null;
}

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ActionItem {
  task: string;
  assignee: string | null;
  deadline: string | null;
  priority: Priority;
}

export interface StructuredSummary {
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  risks: string[];
}

/**
 * The backend's transcript endpoint shape isn't pinned down in the spec.
 * This type is intentionally permissive: it accepts either a plain string
 * body, a `{ transcript: string }` envelope, or a segmented
 * `{ segments: [...] }` shape with per-line speaker/timestamp data.
 * `normalizeTranscript` below reduces any of these to plain text for display.
 */
export interface TranscriptSegment {
  speaker?: string | null;
  timestamp?: string | null;
  text: string;
}

export type TranscriptResponse =
  | string
  | { transcript: string }
  | { text: string }
  | { segments: TranscriptSegment[] };

export function normalizeTranscript(raw: TranscriptResponse): string {
  if (typeof raw === 'string') return raw;
  if ('transcript' in raw && typeof raw.transcript === 'string') return raw.transcript;
  if ('text' in raw && typeof raw.text === 'string') return raw.text;
  if ('segments' in raw && Array.isArray(raw.segments)) {
    return raw.segments
      .map((seg) => {
        const prefix = [seg.timestamp, seg.speaker].filter(Boolean).join(' ');
        return prefix ? `${prefix}: ${seg.text}` : seg.text;
      })
      .join('\n\n');
  }
  return '';
}

export interface MeetingDetails extends Meeting {
  summary: StructuredSummary | null;
  transcript: string | null;
}
