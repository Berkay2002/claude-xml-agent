import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  setUserRole
} from "@/lib/db/queries";
import { sendApprovalNotificationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const session = await auth();

  // Check if user is authenticated and has admin role
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "pending") {
      const users = await getPendingUsers();
      return NextResponse.json({ users });
    } else {
      const users = await getAllUsers();
      return NextResponse.json({ users });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  // Check if user is authenticated and has admin role
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { action, userId, role } = await request.json();

    switch (action) {
      case "approve":
        const approvedUser = await approveUser({
          userId,
          approvedById: session.user.id,
        });

        // Send approval email notification
        if (approvedUser[0]?.email) {
          await sendApprovalNotificationEmail({
            userEmail: approvedUser[0].email,
            approved: true,
          });
        }

        return NextResponse.json({
          message: "User approved successfully",
          user: approvedUser[0]
        });

      case "reject":
        const rejectedUsers = await rejectUser({ userId });

        // Send rejection email notification
        if (rejectedUsers[0]?.email) {
          await sendApprovalNotificationEmail({
            userEmail: rejectedUsers[0].email,
            approved: false,
          });
        }

        return NextResponse.json({ message: "User rejected successfully" });

      case "setRole":
        const updatedUser = await setUserRole({ userId, role });
        return NextResponse.json({
          message: "User role updated successfully",
          user: updatedUser[0]
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing user:", error);
    return NextResponse.json({ error: "Failed to manage user" }, { status: 500 });
  }
}