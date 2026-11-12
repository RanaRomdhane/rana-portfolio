import { clientIp, env, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Speech-to-text for the microphone button. */
export async function POST(req: Request) {
  if (!rateLimit(`stt:${clientIp(req)}`, 12, 60_000)) {
    return Response.json({ error: "Too many voice messages. Try again in a minute." }, { status: 429 });
  }
  const key = env("GROQ_API_KEY");
  if (!key) return Response.json({ error: "Voice input is not switched on yet." }, { status: 503 });

  let audio: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("audio");
    if (f instanceof File) audio = f;
  } catch {
    /* handled below */
  }
  if (!audio || audio.size < 800) {
    return Response.json({ error: "I could not hear anything. Try again?" }, { status: 400 });
  }
  if (audio.size > 6 * 1024 * 1024) {
    return Response.json({ error: "That recording is too long. Keep it under a minute." }, { status: 413 });
  }

  const out = new FormData();
  out.append("file", audio, audio.name || "voice.webm");
  out.append("model", "whisper-large-v3-turbo");
  out.append("response_format", "json");

  try {
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: out,
    });
    if (!res.ok) return Response.json({ error: "I could not understand that. Try again?" }, { status: 502 });
    const json = (await res.json()) as { text?: string };
    return Response.json({ text: (json.text || "").trim() });
  } catch {
    return Response.json({ error: "I could not understand that. Try again?" }, { status: 502 });
  }
}
