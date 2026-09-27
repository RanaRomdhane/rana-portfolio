import { NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse, limited, rejectCrossOrigin } from "@/lib/api-security";
import { localAnswer, systemPrompt } from "@/lib/assistant";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) })).min(1).max(12) });
const textHeaders = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: NextRequest) {
  if (rejectCrossOrigin(request)) return errorResponse("Cross-origin requests are not allowed.", 403);
  if (limited(request, "chat", 20, 10 * 60 * 1000)) return errorResponse("Too many messages. Please wait a few minutes.", 429);
  if (Number(request.headers.get("content-length") || 0) > 30000) return errorResponse("Message is too large.", 413);
  let parsed;
  try {
    const raw = await request.text();
    if (raw.length > 30000) return errorResponse("Message is too large.", 413);
    parsed = schema.safeParse(JSON.parse(raw));
  } catch { return errorResponse("Invalid JSON.", 400); }
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") return errorResponse("Invalid conversation.", 400);
  const messages = parsed.data.messages;
  const fallback = () => new Response(localAnswer(messages.at(-1)!.content), { headers: { ...textHeaders, "X-Portfolio-Fallback": "true" } });
  if (!process.env.GROQ_API_KEY) return fallback();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", messages: [{ role: "system", content: `${systemPrompt}\nHelp visitors connect Rana's skills to relevant projects, explain research in plain language, and point to concrete evidence of impact. When asked to compare projects or recommend one for a role, make a grounded choice and briefly explain it.` }, ...messages], temperature: 0.4, max_completion_tokens: 500, stream: true }),
      signal: AbortSignal.timeout(45000),
      cache: "no-store",
    });
    if (!response.ok || !response.body) return fallback();
    const upstream = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await upstream.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const chunk = JSON.parse(line.slice(6));
                const content = chunk.choices?.[0]?.delta?.content;
                if (typeof content === "string") controller.enqueue(encoder.encode(content));
              } catch { /* Ignore malformed provider event, retain the stream. */ }
            }
          }
        } catch { controller.enqueue(encoder.encode("\n\nThe connection ended early. Please try again.")); }
        finally { controller.close(); upstream.releaseLock(); }
      },
      cancel() { upstream.cancel().catch(() => {}); },
    });
    return new Response(stream, { headers: textHeaders });
  } catch { return fallback(); }
}
