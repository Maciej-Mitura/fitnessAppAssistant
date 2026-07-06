"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerAllowedUser,
  signInAllowedUser,
} from "@/features/auth/actions";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
  registrationOpen: boolean;
};

function getCallbackMessage(error: string | null) {
  if (error === "unauthorized") {
    return "Access is restricted to the app owner.";
  }

  if (error === "auth_callback_failed") {
    return "Authentication failed. Please try again.";
  }

  return null;
}

export function LoginForm({ registrationOpen }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(getCallbackMessage(callbackError));
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const result =
        mode === "sign-in"
          ? await signInAllowedUser(email, password)
          : await registerAllowedUser(email, password);

      if (!result.success) {
        setMessage(result.error ?? "Authentication failed.");
        return;
      }

      if (result.error) {
        setMessage(result.error);
        setMode("sign-in");
        return;
      }

      router.push(next);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  const showSignUp = registrationOpen;

  return (
    <Card className="w-full max-w-sm border-border/60 bg-card/90 shadow-xl shadow-black/20">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <AppLogo />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {mode === "sign-in"
              ? "Sign in to access your private fitness assistant."
              : "One-time setup for the app owner account."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {showSignUp ? (
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1">
            {(["sign-in", "sign-up"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setMessage(null);
                }}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  mode === option
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "sign-in" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          {message ? (
            <p
              className={cn(
                "text-sm",
                message.includes("created") ? "text-primary" : "text-destructive"
              )}
            >
              {message}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
