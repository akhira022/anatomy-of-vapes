interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = Number(process.env.CHAT_RATE_LIMIT_PER_10MIN ?? 10);

function getKey(sessionId: string | undefined, ip: string) {
  return `${sessionId ?? "anon"}:${ip}`;
}

export function checkRateLimit(
  sessionId: string | undefined,
  ip: string
): { allowed: boolean; retryAfterSec?: number } {
  const key = getKey(sessionId, ip);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true };
}
