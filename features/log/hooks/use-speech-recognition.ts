"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function getSessionTranscript(results: SpeechRecognitionResultList) {
  let transcript = "";

  for (let index = 0; index < results.length; index += 1) {
    transcript += results[index]?.[0]?.transcript ?? "";
  }

  return transcript.trim();
}

function getErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission denied. Allow mic access or type your log instead.";
    case "no-speech":
      return "No speech detected. Try again or type your log.";
    case "audio-capture":
      return "No microphone found. Type your log or use keyboard dictation.";
    case "network":
      return "Speech recognition needs a network connection in this browser.";
    case "aborted":
      return null;
    default:
      return "Voice input failed. Type your log or use keyboard dictation.";
  }
}

type UseSpeechRecognitionOptions = {
  onTranscript: (sessionTranscript: string) => void;
  lang?: string;
};

export function useSpeechRecognition({
  onTranscript,
  lang = "en-US",
}: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionConstructor()));
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    setError(null);

    const SpeechRecognitionClass = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionClass) {
      setError(
        "Voice input is not available in this browser. Type your log, or on mobile use your keyboard's dictation button."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      const message = getErrorMessage(event.error);
      if (message) {
        setError(message);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      const sessionTranscript = getSessionTranscript(event.results);
      onTranscriptRef.current(sessionTranscript);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError(
        "Could not start voice input. Type your log or use keyboard dictation."
      );
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [lang]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return {
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null),
  };
}
