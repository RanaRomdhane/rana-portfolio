import { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rejectCrossOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.nextUrl.host;
  } catch {
    return true;
  }
}

export function limited(request: NextRequest, action: string, max: number, windowMs: number): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 1000) for (const [item, value] of buckets) if (value.resetAt < now) buckets.delete(item);
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}

export const errorResponse = (message: string, status: number) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
