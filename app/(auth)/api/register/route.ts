import { type NextRequest, NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/db/queries";
import { sendApprovalRequestEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await getUser(email);
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user (they will be unapproved by default)
    await createUser(email, password);

    // Send approval request email to admin
    await sendApprovalRequestEmail({
      userEmail: email,
    });

    return NextResponse.json({
      message:
        "Registration successful. Your account is pending approval from an administrator.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
