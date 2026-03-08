// 간단한 인메모리 rate limiter (서버리스 환경에서는 인스턴스별로 동작)
const store = new Map<string, { count: number; resetAt: number }>();

// 주기적 정리 (메모리 누수 방지)
let lastCleanup = Date.now();
function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 60_000) return;
    lastCleanup = now;
    for (const [key, val] of store) {
        if (val.resetAt < now) store.delete(key);
    }
}

export function rateLimit(
    key: string,
    { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
    cleanup();
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, remaining: limit - 1 };
    }

    entry.count++;
    if (entry.count > limit) {
        return { success: false, remaining: 0 };
    }

    return { success: true, remaining: limit - entry.count };
}

export function getRateLimitHeaders(remaining: number, limit: number) {
    return {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    };
}
