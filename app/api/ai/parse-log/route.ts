import { NextResponse } from "next/server";

import { parseDailyLogWithAI } from "@/lib/ai/parse-daily-log";
import { requireAllowedApiUser } from "@/lib/auth/api-user";

function parseRequestBody(body: unknown): { rawText: string; date: string } | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { rawText, date } = body as Record<string, unknown>;

  if (typeof rawText !== "string" || rawText.trim() === "") {
    return null;
  }

  if (typeof date !== "string" || date.trim() === "") {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return {
    rawText: rawText.trim(),
    date: parsedDate.toLocaleDateString("en-CA"),
  };
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

  const input = parseRequestBody(body);

  if (!input) {
    return NextResponse.json(
      { error: "rawText and date are required." },
      { status: 400 }
    );
  }

  if (input.rawText.length > 4000) {
    return NextResponse.json(
      { error: "rawText must be 4000 characters or fewer." },
      { status: 400 }
    );
  }

  try {
    const data = await parseDailyLogWithAI(input.rawText, input.date);
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse log.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
