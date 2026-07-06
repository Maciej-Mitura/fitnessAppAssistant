"use client";

import { useCallback, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/features/log/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

type VoiceInputButtonProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onError?: (message: string | null) => void;
};

export function VoiceInputButton({
  value,
  onChange,
  disabled = false,
  onError,
}: VoiceInputButtonProps) {
  const baseTextRef = useRef("");

  const handleTranscript = useCallback(
    (sessionTranscript: string) => {
      const prefix = baseTextRef.current.trim();
      const combined = prefix
        ? sessionTranscript
          ? `${prefix} ${sessionTranscript}`
          : prefix
        : sessionTranscript;

      onChange(combined);
    },
    [onChange]
  );

  const { isSupported, isListening, error, toggleListening, clearError } =
    useSpeechRecognition({
      onTranscript: handleTranscript,
    });

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  function handleClick() {
    if (!isSupported) {
      onError?.(
        "Voice input is not available in this browser. Type your log, or on mobile use your keyboard's dictation button."
      );
      return;
    }

    if (!isListening) {
      baseTextRef.current = value;
      clearError();
    }

    toggleListening();
  }

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="icon-sm"
      onClick={handleClick}
      disabled={disabled}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={isListening}
      title={
        isSupported
          ? isListening
            ? "Stop listening"
            : "Dictate log with microphone"
          : "Voice input unavailable — use keyboard dictation on mobile"
      }
      className={cn(isListening && "animate-pulse")}
    >
      {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
    </Button>
  );
}
