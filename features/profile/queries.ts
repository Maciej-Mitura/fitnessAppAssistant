import "server-only";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import type { LatestBodyWeight, Profile } from "@/types/profile";

export async function getProfile(): Promise<Profile | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getLatestBodyWeight(): Promise<LatestBodyWeight | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("body_metrics")
    .select("weight_kg, date")
    .eq("user_id", user.id)
    .not("weight_kg", "is", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.weight_kg) {
    return null;
  }

  return {
    weight_kg: Number(data.weight_kg),
    date: data.date,
  };
}
