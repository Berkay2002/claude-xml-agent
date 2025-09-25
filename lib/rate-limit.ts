import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL!,
});

// Rate limiting configurations
export const guestRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
  analytics: true,
  prefix: "ratelimit:guest",
});

export const unapprovedUserRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
  analytics: true,
  prefix: "ratelimit:unapproved",
});

export const approvedUserRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "1 h"), // Effectively unlimited (1000 per hour)
  analytics: true,
  prefix: "ratelimit:approved",
});

export type UserType = "guest" | "unapproved" | "approved";

export function getRateLimitForUser(userType: UserType, isApproved?: boolean) {
  if (userType === "guest") {
    return guestRateLimit;
  }

  if (userType === "regular" && isApproved) {
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
