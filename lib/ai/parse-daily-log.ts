import "server-only";

import { getOpenAIApiKey } from "@/lib/env.server";
import { validateParsedLog } from "@/lib/ai/validate-parsed-log";
import type { ParsedLog } from "@/types/parsed-log";

const SYSTEM_PROMPT = `You are a fitness log parser for FitOS. Extract structured data from natural language daily fitness logs.

Return ONLY valid JSON matching this exact schema:
{
  "bodyweight_kg": number | null,
  "calories": number | null,
  "protein_g": number | null,
  "carbs_g": number | null,
  "fat_g": number | null,
  "workout_detected": boolean,
  "workout_type": string | null,
  "exercises": [
    {
      "name": string,
      "weight_kg": number | null,
      "sets": number | null,
      "reps": string | null,
      "notes": string | null
    }
  ],
  "pain_notes": string | null,
  "fatigue_notes": string | null,
  "special_events": string[],
  "summary": string,
  "feedback": string
}

Rules:
- Use null for any value not mentioned or unclear.
- bodyweight_kg: extract weight in kg (convert from lbs if needed, round to 1 decimal).
- Macros: extract integers for calories, protein_g, carbs_g, fat_g.
- workout_detected: true if any training/exercise is mentioned.
- workout_type: e.g. push, pull, legs, cardio, upper, lower, full body — or null.
- exercises: list each distinct exercise with sets/reps/weight when stated. reps as comma-separated string e.g. "5,5,4".
- pain_notes: discomfort, pain, injury mentions.
- fatigue_notes: tiredness, low energy, overtraining mentions.
- special_events: notable events (travel, illness, PR, deload) as short strings.
- summary: 1-2 sentence neutral summary of what was logged.
- feedback: brief constructive coaching note based on the log (not medical advice).
- Do not invent data. Only extract what is stated or strongly implied.`;

export async function parseDailyLogWithAI(
  rawText: string,
  date: string
): Promise<ParsedLog> {
  const apiKey = getOpenAIApiKey();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Date: ${date}\n\nLog entry:\n${rawText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  const validated = validateParsedLog(parsed);

  if (!validated) {
    throw new Error("OpenAI response did not match the expected schema.");
  }

  return validated;
}
