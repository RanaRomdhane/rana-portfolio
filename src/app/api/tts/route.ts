import { clientIp, env, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Turns a reply into speech with Rana's cloned voice. */
export async function POST(req: Request) {
  if (!rateLimit(`tts:${clientIp(req)}`, 40, 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  const key = env("FISH_API_KEY");
  const voice = env("FISH_VOICE_ID");
  if (!key || !voice) return Response.json({ error: "voice_unavailable" }, { status: 503 });

  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    if (typeof body.text === "string") text = body.text.trim().slice(0, 900);
  } catch {
    /* handled below */
  }
  if (!text) return Response.json({ error: "empty" }, { status: 400 });

  try {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        model: env("FISH_MODEL") || "s2.1-pro-free",
      },
      body: JSON.stringify({ text, reference_id: voice, format: "mp3", latency: "balanced" }),
    });
    if (!res.ok || !res.body) {
      await res.body?.cancel();
      return Response.json({ error: "voice_failed" }, { status: 502 });
    }
    return new Response(res.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "voice_failed" }, { status: 502 });
  }
}
