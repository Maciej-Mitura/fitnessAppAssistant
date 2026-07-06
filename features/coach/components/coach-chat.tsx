"use client";

import { useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { CoachMessage } from "@/types/coach";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "Should I lower my calories?",
  "Compare this week to last week.",
  "Am I training too much?",
  "Replace RDL because my knee hurts.",
  "How was my consistency this week?",
];

export function CoachChat() {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMessage: CoachMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to get a response.");
        return;
      }

      if (!payload.reply) {
        setError("No response returned.");
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: payload.reply }]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <Card className="flex min-h-[70vh] flex-col border-border/60 bg-card/80">
      <CardHeader className="shrink-0 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Bot className="size-5" />
          </span>
          <div className="space-y-1">
            <CardTitle>AI Coach</CardTitle>
            <CardDescription>
              Answers based on your last 14 days of logs, targets, and profile.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Ask a question about your training, nutrition, or recovery. The coach
                  uses your stored FitOS data.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-muted/30 text-foreground"
                    )}
                  >
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-70">
                      {message.role === "user" ? "You" : "Coach"}
                    </p>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Coach is thinking…
              </div>
            ) : null}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {messages.length === 0 ? (
          <div className="shrink-0 border-t border-border/60 px-4 py-3">
            <p className="mb-2 text-xs text-muted-foreground">Suggested prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => void sendMessage(prompt)}
                  className="h-auto whitespace-normal py-2 text-left"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="shrink-0 px-4 pb-2">
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="shrink-0 border-t border-border/60 p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your coach…"
            rows={2}
            disabled={isLoading}
            className="min-h-0 flex-1 resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage(input);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="size-10 shrink-0 self-end"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
