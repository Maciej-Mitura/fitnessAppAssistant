import "server-only";

import { getOpenAIApiKey } from "@/lib/env.server";
import type { ProgressPhotoType } from "@/types/progress-photos";
import { PROGRESS_PHOTO_TYPE_LABELS } from "@/types/progress-photos";

const SYSTEM_PROMPT = `You are FitOS Progress Photo Analyst — a cautious, practical assistant helping one user review private progress photos.

Your job:
- Describe what you can reasonably observe in the photo(s).
- If two photos are provided, compare progress cautiously — progress photos are unreliable for precise measurement.
- Explicitly mention when lighting, angle, pose, distance, pump, hydration, or clothing could change appearance.
- Do not claim exact body fat percentage or precise body-composition numbers.
- Do not diagnose medical conditions or injuries.
- Give practical progress-photo advice: consistency, lighting, distance, pose, same time of day, same photo types (front/side/back).
- Suggest how to take better, more consistent photos next time.
- Be honest about uncertainty. If change is unclear, say so.
- Keep the response concise (roughly 150–280 words) using short paragraphs or bullets.
- Be supportive and direct.`;

type PhotoMeta = {
  date: string;
  photoType: ProgressPhotoType;
  notes: string | null;
  label: string;
};

function buildUserPrompt(current: PhotoMeta, comparison: PhotoMeta | null) {
  const currentLine = `${current.label}: ${current.date}, type: ${PROGRESS_PHOTO_TYPE_LABELS[current.photoType]}${current.notes ? `, user note: ${current.notes}` : ""}`;

  if (!comparison) {
    return `Analyze this single progress photo.

Photo metadata:
- ${currentLine}

Provide observations, limitations of photo-based assessment, and tips for more consistent progress photos.`;
  }

  const comparisonLine = `${comparison.label}: ${comparison.date}, type: ${PROGRESS_PHOTO_TYPE_LABELS[comparison.photoType]}${comparison.notes ? `, user note: ${comparison.notes}` : ""}`;

  return `Compare these two progress photos cautiously.

Photo metadata:
- Current: ${currentLine}
- Comparison: ${comparisonLine}

Discuss visible differences only when reasonably supported. Flag lighting/angle/pose differences. Include practical photo-taking advice.`;
}

type VisionImage = {
  base64: string;
  mimeType: string;
};

export async function generatePhotoObservation(input: {
  current: PhotoMeta;
  comparison: PhotoMeta | null;
  images: VisionImage[];
}): Promise<string> {
  const apiKey = getOpenAIApiKey();

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail: "low" | "high" | "auto" } }
  > = [{ type: "text", text: buildUserPrompt(input.current, input.comparison) }];

  for (const image of input.images) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${image.mimeType};base64,${image.base64}`,
        detail: "low",
      },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
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

  const observation = completion.choices?.[0]?.message?.content?.trim();

  if (!observation) {
    throw new Error("OpenAI returned an empty response.");
  }

  return observation;
}
