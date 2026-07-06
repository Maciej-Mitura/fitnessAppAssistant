import { NextResponse } from "next/server";

import { evaluateProgressPhoto } from "@/features/progress-photos/evaluate-photo";
import { requireAllowedApiUser } from "@/lib/auth/api-user";
import { hasOpenAIApiKey } from "@/lib/env.server";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(request: Request) {
  const auth = await requireAllowedApiUser();

  if ("response" in auth) {
    return auth.response;
  }

  if (!hasOpenAIApiKey()) {
    return NextResponse.json(
      { error: "AI photo evaluation is not configured. Add OPENAI_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { photoId, comparisonPhotoId } = body as Record<string, unknown>;

  if (typeof photoId !== "string" || !isUuid(photoId)) {
    return NextResponse.json({ error: "photoId is required." }, { status: 400 });
  }

  if (
    comparisonPhotoId !== undefined &&
    comparisonPhotoId !== null &&
    (typeof comparisonPhotoId !== "string" || !isUuid(comparisonPhotoId))
  ) {
    return NextResponse.json(
      { error: "comparisonPhotoId must be a valid UUID when provided." },
      { status: 400 }
    );
  }

  try {
    const result = await evaluateProgressPhoto({
      photoId,
      comparisonPhotoId:
        typeof comparisonPhotoId === "string" ? comparisonPhotoId : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to evaluate photo.";

    const status = errorMessage.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
