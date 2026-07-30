/**
 * Rate Limiting Utility
 *
 * Bảo vệ API routes khỏi bị spam/abuse bằng sliding window algorithm.
 * Dùng in-memory store (Map) — đủ dùng cho single-instance deployment.
 *
 * ⚠️  Nếu deploy multi-instance (nhiều server), cần dùng Redis thay thế.
 *     Xem: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * @example
 * // Trong API route:
 * import { rateLimit } from "@/lib/rate-limit";
 *
 * export async function POST(req: Request) {
 *   const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
 *   const result = rateLimit(ip, { limit: 10, windowMs: 60_000 });
 *
 *   if (!result.success) {
 *     return Response.json(
 *       { message: "Too Many Requests" },
 *       {
 *         status: 429,
 *         headers: { "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)) },
 *       }
 *     );
 *   }
 *   // ... xử lý request bình thường
 * }
 */

// =============================================================================
// Types
// =============================================================================

export interface RateLimitOptions {
  /** Số requests tối đa trong cửa sổ thời gian */
  limit: number;
  /** Cửa sổ thời gian tính bằng milliseconds (default: 60_000 = 1 phút) */
  windowMs?: number;
}

export interface RateLimitResult {
  /** true nếu request được phép đi qua */
  success: boolean;
  /** Số request còn lại trong window hiện tại */
  remaining: number;
  /** Thời gian (ms) phải đợi trước khi thử lại (chỉ có giá trị khi success = false) */
  retryAfterMs: number;
  /** Timestamp khi window hiện tại reset */
  resetAt: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// =============================================================================
// In-Memory Store
// =============================================================================

const store = new Map<string, WindowEntry>();

// Dọn dẹp entries cũ mỗi 5 phút để tránh memory leak
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

// =============================================================================
// Rate Limit Function
// =============================================================================

/**
 * Kiểm tra và ghi nhận 1 request từ một identifier (thường là IP address).
 *
 * @param identifier - Định danh client (IP, userId, v.v.)
 * @param options    - Cấu hình giới hạn
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { limit, windowMs = 60_000 } = options;
  const now = Date.now();

  const existing = store.get(identifier);

  // Window mới hoặc window cũ đã hết hạn
  if (!existing || existing.resetAt < now) {
    const newEntry: WindowEntry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, newEntry);
    return {
      success: true,
      remaining: limit - 1,
      retryAfterMs: 0,
      resetAt: newEntry.resetAt,
    };
  }

  // Vẫn trong window hiện tại
  if (existing.count < limit) {
    existing.count += 1;
    return {
      success: true,
      remaining: limit - existing.count,
      retryAfterMs: 0,
      resetAt: existing.resetAt,
    };
  }

  // Đã vượt giới hạn
  return {
    success: false,
    remaining: 0,
    retryAfterMs: existing.resetAt - now,
    resetAt: existing.resetAt,
  };
}

// =============================================================================
// Helper: Tạo response headers chuẩn (RFC 6585)
// =============================================================================

/**
 * Tạo các HTTP headers chuẩn cho rate limiting để trả về client.
 */
export function getRateLimitHeaders(result: RateLimitResult, limit: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterMs > 0 && {
      "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
    }),
  };
}
