// Browser-native speech-to-text, as progressive enhancement. Typed input is always the fallback.
// Some browsers send audio to their vendor's recognition service; nothing is recorded or sent by this site.

interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface RecognitionEvent {
  results: ArrayLike<RecognitionResult>;
  resultIndex: number;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const voiceSupported = (): boolean => ctor() !== undefined;

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone permission was denied. You can still type your question.',
  'service-not-allowed': 'Speech recognition is blocked in this browser. You can still type your question.',
  'no-speech': 'I did not hear anything. Try again or type your question.',
  'audio-capture': 'No microphone was found. You can still type your question.',
  network: 'Speech recognition needs a network connection in this browser. You can still type your question.',
};

export interface VoiceHandlers {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}

/** Starts listening after an explicit user action. Returns a stop function. */
export function startListening(handlers: VoiceHandlers): () => void {
  const Ctor = ctor();
  if (!Ctor) {
    handlers.onError('Voice input is not supported in this browser. You can type your question instead.');
    handlers.onEnd();
    return () => undefined;
  }
  const recognition = new Ctor();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const parts = Array.from(event.results);
    handlers.onTranscript(parts.map((part) => part[0].transcript).join(' ').trim(), parts.every((part) => part.isFinal));
  };
  recognition.onerror = (event) => handlers.onError(ERRORS[event.error] ?? 'Voice input failed. You can type your question instead.');
  recognition.onend = handlers.onEnd;
  recognition.start();
  return () => recognition.stop();
}
