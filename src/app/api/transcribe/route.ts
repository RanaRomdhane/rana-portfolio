import { NextRequest } from "next/server";
import { errorResponse, limited, rejectCrossOrigin } from "@/lib/api-security";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (rejectCrossOrigin(request)) return errorResponse("Cross-origin requests are not allowed.", 403);
  if (limited(request, "transcribe", 10, 10 * 60 * 1000)) return errorResponse("Too many recordings. Please wait a few minutes.", 429);
  if (!process.env.GROQ_API_KEY) return errorResponse("Voice transcription is not configured. You can still type your question.", 503);
  if (Number(request.headers.get("content-length") || 0) > 4_000_000) return errorResponse("Recording is too large. Please keep it under 4 MB.", 413);
  try {
    const data = await request.formData();
    const audio = data.get("audio");
    if (!(audio instanceof File) || audio.size === 0 || audio.size > 4_000_000 || !/^audio\//.test(audio.type)) return errorResponse("Upload a recording under 4 MB.", 400);
    const outbound = new FormData();
    outbound.append("file", audio, audio.name || "recording.webm");
    outbound.append("model", "whisper-large-v3-turbo");
    outbound.append("response_format", "json");
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: outbound, signal: AbortSignal.timeout(45000), cache: "no-store" });
    if (!response.ok) return errorResponse(response.status === 429 ? "Voice transcription is busy. Please type your question." : "Could not transcribe the recording. Please try again or type your question.", response.status === 429 ? 429 : 502);
    const result = await response.json();
    const text = typeof result.text === "string" ? result.text.trim().slice(0, 2000) : "";
    if (!text) return errorResponse("No speech was detected. Please try again.", 422);
    return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch { return errorResponse("Could not transcribe the recording. Please type your question.", 502); }
}
