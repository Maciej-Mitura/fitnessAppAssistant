import { NextResponse } from "next/server";

import { askCoach } from "@/lib/ai/coach";
import { requireAllowedApiUser } from "@/lib/auth/api-user";
import { getCoachContext } from "@/features/coach/queries";
import type { CoachMessage } from "@/types/coach";

function parseHistory(value: unknown): CoachMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const history: CoachMessage[] = [];

  for (const item of value.slice(-12)) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const { role, content } = item as Record<string, unknown>;

    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim()
    ) {
      history.push({ role, content: content.trim() });
    }
  }

  return history;
}

export async function POST(request: Request) {
  const auth = await requireAllowedApiUser();

  if ("response" in auth) {
    return auth.response;
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

  const { message, history } = body as Record<string, unknown>;

  if (typeof message !== "string" || message.trim() === "") {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { error: "message must be 2000 characters or fewer." },
      { status: 400 }
    );
  }

  const parsedHistory = parseHistory(history);

  try {
    const context = await getCoachContext();
    const reply = await askCoach(message.trim(), parsedHistory, context);

    return NextResponse.json({ reply });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get coach response.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
