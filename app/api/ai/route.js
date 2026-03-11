import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/constants";

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.error?.message || `Anthropic API error: ${res.status}`
      );
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "No response generated.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
