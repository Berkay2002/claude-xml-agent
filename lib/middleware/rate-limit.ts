import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function applyRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Get session to determine user type
    const session = await auth();

    let identifier: string;
    let userType: "guest" | "unapproved" | "approved";
    let isApproved = false;

    if (session?.user) {
      // Authenticated user - use user ID as identifier
      identifier = session.user.id;

      if (session.user.type === "guest") {
        userType = "guest";
      } else {
        // Use the approval status from session (already checked in auth callbacks)
        isApproved = session.user.isApproved || false;
        userType = isApproved ? "approved" : "unapproved";
      }
    } else {
      // Guest user - use IP address as identifier
      identifier =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        "unknown";
      userType = "guest";
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      identifier,
      userType,
      isApproved
    );

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded",
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.reset),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Return null if rate limit passes - let the route handler continue
    return null;
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    // If rate limiting fails, continue with the request
    return null;
  }
}

export function createRateLimitedRoute<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Check rate limit first
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // If rate limit passes, execute the original handler
    return handler(request, ...args);
  };
}
