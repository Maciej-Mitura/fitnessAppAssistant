"use client";

import { useActionState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile, type SaveProfileState } from "@/features/profile/actions";
import {
  formatProfileDate,
  formatWeightKg,
  getProfileInitials,
  toDateInputValue,
  toNumberInputValue,
} from "@/features/profile/utils";
import type { LatestBodyWeight, Profile } from "@/types/profile";

type ProfileFormProps = {
  email: string;
  profile: Profile | null;
  latestWeight: LatestBodyWeight | null;
};

const initialState: SaveProfileState = {
  success: false,
  message: null,
  error: null,
};

export function ProfileForm({ email, profile, latestWeight }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(saveProfile, initialState);

  const displayName = profile?.display_name ?? "";

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Account details and your latest recorded weight.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 ring-1 ring-border">
              <AvatarFallback className="text-base font-medium">
                {getProfileInitials(displayName, email)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">{displayName || email}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm">
            <p className="text-muted-foreground">Latest weight</p>
            <p className="text-lg font-semibold tracking-tight">
              {latestWeight ? formatWeightKg(latestWeight.weight_kg) : "—"}
            </p>
            {latestWeight ? (
              <p className="text-xs text-muted-foreground">
                Recorded {formatProfileDate(latestWeight.date)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Log body metrics to track weight over time.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Update your profile. All fields are optional except where noted.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                placeholder="How you want to be addressed"
                defaultValue={displayName}
                disabled={isPending}
                autoComplete="name"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={300}
                  step="0.1"
                  placeholder="175"
                  defaultValue={toNumberInputValue(profile?.height_cm)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth date</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  defaultValue={toDateInputValue(profile?.birth_date)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Current goal</Label>
              <Textarea
                id="goal"
                name="goal"
                placeholder="e.g. Build strength, lose 5 kg, run a 10K"
                defaultValue={profile?.goal ?? ""}
                disabled={isPending}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="injury_notes">Injury notes</Label>
              <Textarea
                id="injury_notes"
                name="injury_notes"
                placeholder="Past or current injuries, limitations, or areas to avoid"
                defaultValue={profile?.injury_notes ?? ""}
                disabled={isPending}
                rows={4}
              />
            </div>

            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            {state.success && state.message ? (
              <p className="text-sm text-primary">{state.message}</p>
            ) : null}
          </CardContent>

          <CardFooter className="border-t border-border/60">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Saving…" : "Save profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
