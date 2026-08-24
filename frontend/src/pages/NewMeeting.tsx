import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, FileAudio, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useUploadMeeting } from '../hooks/useMeetings';
import { formatFileSize } from '../lib/format';
import { isNetworkError } from '../api/client';

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/webm'];
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.ogg'];

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function NewMeeting() {
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedMeetingId, setUploadedMeetingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const upload = useUploadMeeting();

  function handleFile(selected: File | null) {
    setValidationError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!isAcceptedFile(selected)) {
      setValidationError('Unsupported file type. Please upload an audio file (MP3, WAV, M4A, MP4, or WEBM).');
      setFile(null);
      return;
    }
    if (selected.size > 500 * 1024 * 1024) {
      setValidationError('File is too large. Please upload a file under 500 MB.');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function handleSubmit() {
    if (!file) return;
    setProgress(0);
    upload.mutate(
      { file, onProgress: setProgress },
      {
        onSuccess: (meeting) => setUploadedMeetingId(meeting.id),
      }
    );
  }

  if (uploadedMeetingId) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-8 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-green-600">
            <CheckCircle2 size={28} strokeWidth={2} />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-lg font-semibold text-ink">Audio uploaded successfully.</h2>
            <p className="text-sm text-ink-soft">Processing your meeting…</p>
          </div>
          <span className="waveform text-signal">
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
          </span>
          <Link
            to={`/meetings/${uploadedMeetingId}`}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-dark"
          >
            View Meeting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <h1 className="mb-1 font-display text-xl font-bold text-ink">New Meeting</h1>
      <p className="mb-6 text-sm text-ink-soft">Upload an audio recording to generate a transcript and summary.</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition ${
          dragActive ? 'border-signal bg-signal-soft' : 'border-border bg-surface hover:border-signal/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={[...ACCEPTED_TYPES, ...ACCEPTED_EXTENSIONS].join(',')}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex size-12 items-center justify-center rounded-full bg-signal-soft text-signal">
          <UploadCloud size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Click to select an audio file, or drag it here</p>
          <p className="mt-1 text-xs text-ink-faint">MP3, WAV, M4A, MP4, or WEBM · up to 500 MB</p>
        </div>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-signal-soft text-signal">
              <FileAudio size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink-faint">{formatFileSize(file.size)}</p>
            </div>
          </div>
          {!upload.isPending && (
            <button
              onClick={() => handleFile(null)}
              className="rounded-md p-1.5 text-ink-faint transition hover:bg-canvas hover:text-ink"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {validationError && (
        <p className="mt-3 text-sm font-medium text-red-600">{validationError}</p>
      )}

      {upload.isPending && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-soft">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border-soft">
            <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {upload.isError && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {isNetworkError(upload.error)
            ? 'Unable to connect to the server. Please make sure the backend is running on http://localhost:8080.'
            : 'Upload failed. Please try again.'}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || upload.isPending}
        className="mt-6 w-full rounded-lg bg-signal py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-faint"
      >
        {upload.isPending ? 'Uploading…' : 'Upload Recording'}
      </button>
    </div>
  );
}
