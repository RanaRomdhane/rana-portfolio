import { NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse, limited, rejectCrossOrigin } from "@/lib/api-security";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({ text: z.string().trim().min(1).max(1000) });

export async function POST(request: NextRequest) {
  if (rejectCrossOrigin(request)) return errorResponse("Cross-origin requests are not allowed.", 403);
  if (limited(request, "speech", 10, 10 * 60 * 1000)) return errorResponse("Voice is busy. Please try again later.", 429);
  if (!process.env.FISH_API_KEY || !process.env.FISH_VOICE_ID) return errorResponse("Cloned voice is not configured. The answer remains available as text.", 503);
  if (Number(request.headers.get("content-length") || 0) > 5000) return errorResponse("Text is too long.", 413);
  let parsed;
  try { parsed = schema.safeParse(await request.json()); } catch { return errorResponse("Invalid JSON.", 400); }
  if (!parsed.success) return errorResponse("Invalid text.", 400);
  try {
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.FISH_API_KEY}`, "Content-Type": "application/json", model: process.env.FISH_MODEL || "s2.1-pro-free" },
      body: JSON.stringify({ text: parsed.data.text, reference_id: process.env.FISH_VOICE_ID, format: "mp3", latency: "balanced" }),
      signal: AbortSignal.timeout(60000),
      cache: "no-store",
    });
    if (!response.ok || !response.body) return errorResponse(response.status === 429 ? "Voice is busy. Please try again later." : "Voice playback is unavailable right now. The answer remains available as text.", response.status === 429 ? 429 : 502);
    return new Response(response.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return errorResponse("Voice playback is unavailable right now. The answer remains available as text.", 502); }
}
