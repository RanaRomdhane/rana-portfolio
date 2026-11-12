import { clientIp, env, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOTS = /bot|crawl|spider|slurp|preview|lighthouse|headless|monitor|vercel|pingdom|facebookexternalhit|whatsapp/i;

function flag(country: string): string {
  if (!/^[A-Z]{2}$/.test(country)) return "🌍";
  return String.fromCodePoint(...[...country].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function device(ua: string): string {
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${/Mobi|Android|iPhone/.test(ua) ? "📱" : "💻"} ${browser} on ${os}`;
}

const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.replace(/[<>]/g, "").slice(0, max) : "");

/** Quietly tells Rana (on Telegram) that someone opened the portfolio. Nothing is stored. */
export async function POST(req: Request) {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chat = env("TELEGRAM_CHAT_ID");
  const ua = req.headers.get("user-agent") || "";
  if (!token || !chat || BOTS.test(ua) || !rateLimit(`visit:${clientIp(req)}`, 3, 3_600_000)) {
    return new Response(null, { status: 204 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* empty body is fine */
  }

  const country = req.headers.get("x-vercel-ip-country") || "";
  let city = req.headers.get("x-vercel-ip-city") || "";
  try {
    city = decodeURIComponent(city);
  } catch {
    /* keep raw value */
  }
  const place = [city, country].filter(Boolean).join(", ") || "Unknown place";
  const visits = Number(body.visits) || 1;
  const referrer = clean(body.referrer) || "Direct link";

  const text = [
    `🎮 New player on your portfolio!`,
    `${flag(country)} ${place}`,
    device(ua),
    `🔗 From: ${referrer}`,
    `🕹️ ${visits > 1 ? `Returning visitor (visit #${visits})` : "First visit"}`,
    clean(body.lang, 20) ? `🗣️ Language: ${clean(body.lang, 20)}` : "",
    clean(body.tz, 60) ? `🕒 Time zone: ${clean(body.tz, 60)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
  } catch {
    /* never break the page because of a notification */
  }
  return new Response(null, { status: 204 });
}
