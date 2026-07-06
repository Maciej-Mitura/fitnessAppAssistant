import "server-only";

import { getOpenAIApiKey } from "@/lib/env.server";
import type { CoachContext, CoachMessage } from "@/types/coach";

const SYSTEM_PROMPT = `You are FitOS Coach, a private fitness assistant for one user.

You answer using ONLY:
1. The user's stored app data provided in the context JSON below
2. General, evidence-informed fitness and nutrition knowledge

Rules:
- Be honest when data is missing or insufficient — say what you don't have.
- End each response with a brief "Based on:" line listing which data you used (e.g. profile, macro targets, daily logs, workouts, body metrics, special events).
- Do not diagnose medical conditions or injuries.
- For persistent, severe, or worsening pain, recommend consulting a qualified health professional.
- Do not claim exact body fat percentage or make precise body-composition claims without data.
- Give practical, concise suggestions — avoid long lectures.
- Compare weeks or trends only when the data supports it; otherwise say more logging is needed.
- When suggesting exercise substitutions (e.g. knee pain), offer sensible alternatives and note limitations.
- Use kg for weight. Be supportive and direct.`;

function buildContextMessage(context: CoachContext) {
  const payload = {
    profile: context.profile
      ? {
          display_name: context.profile.display_name,
          height_cm: context.profile.height_cm,
          birth_date: context.profile.birth_date,
          goal: context.profile.goal,
          injury_notes: context.profile.injury_notes,
        }
      : null,
    macro_target: context.macroTarget
      ? {
          calories: context.macroTarget.calories,
          protein_g: context.macroTarget.protein_g,
          carbs_g: context.macroTarget.carbs_g,
          fat_g: context.macroTarget.fat_g,
          active_from: context.macroTarget.active_from,
          active_until: context.macroTarget.active_until,
        }
      : null,
    daily_logs_last_14_days: context.dailyLogs.map((log) => ({
      date: log.date,
      calories: log.calories,
      protein_g: log.protein_g,
      carbs_g: log.carbs_g,
      fat_g: log.fat_g,
      ai_summary: log.ai_summary,
      raw_text: log.raw_text,
    })),
    body_metrics_last_14_days: context.bodyMetrics,
    workouts_last_14_days: context.workouts,
    special_events_last_14_days: context.specialEvents,
    data_availability: {
      has_profile: Boolean(context.profile),
      has_macro_target: Boolean(context.macroTarget),
      daily_log_count: context.dailyLogs.length,
      body_metric_count: context.bodyMetrics.length,
      workout_count: context.workouts.length,
      special_event_count: context.specialEvents.length,
    },
  };

  return `User app data (last 14 days):\n${JSON.stringify(payload, null, 2)}`;
}

export async function askCoach(
  message: string,
  history: CoachMessage[],
  context: CoachContext
): Promise<string> {
  const apiKey = getOpenAIApiKey();

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: buildContextMessage(context) },
    ...history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 800,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = completion.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("OpenAI returned an empty response.");
  }

  return reply;
}
