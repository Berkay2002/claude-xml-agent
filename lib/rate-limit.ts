// Simple in-memory rate limiting (for development/fallback)
// Note: This won't work across multiple server instances in production
type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

function createSimpleRateLimit(maxRequests: number, windowMs: number) {
  return {
    limit: (identifier: string) => {
      const key = `${identifier}`;
      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        // First request or window expired
        const newEntry = {
          count: 1,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, newEntry);
        return Promise.resolve({
          success: true,
          limit: maxRequests,
          remaining: maxRequests - 1,
          reset: newEntry.resetTime,
        });
      }

      if (entry.count >= maxRequests) {
        // Rate limit exceeded
        return Promise.resolve({
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: entry.resetTime,
        });
      }

      // Increment counter
      entry.count++;
      return Promise.resolve({
        success: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        reset: entry.resetTime,
      });
    },
  };
}

// Rate limiting configurations
export const guestRateLimit = createSimpleRateLimit(3, 60 * 60 * 1000); // 3 requests per hour
export const unapprovedUserRateLimit = createSimpleRateLimit(5, 60 * 60 * 1000); // 5 requests per hour
export const approvedUserRateLimit = createSimpleRateLimit(
  1000,
  60 * 60 * 1000
); // 1000 requests per hour (approved users and admins)

export type UserType = "guest" | "unapproved" | "approved";

export function getRateLimitForUser(userType: UserType, isApproved?: boolean) {
  if (userType === "guest") {
    return guestRateLimit;
  }

  // Authenticated users - rate limit based on approval status only
  if (isApproved) {
    return approvedUserRateLimit;
  }

  // Unapproved authenticated users
  return unapprovedUserRateLimit;
}

export async function checkRateLimit(
  identifier: string,
  userType: UserType,
  isApproved?: boolean
) {
  const rateLimit = getRateLimitForUser(userType, isApproved);
  const result = await rateLimit.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
