import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApprovalRequestEmail({
  userEmail,
  adminEmail,
}: {
  userEmail: string;
  adminEmail?: string;
}) {
  try {
    // Get admin emails from environment variable, fallback to parameter
    const adminEmails = adminEmail
      ? [adminEmail]
      : (process.env.EMAIL_ADMIN || "admin@berkay.se")
          .split(",")
          .map(email => email.trim());

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@berkay.se",
      to: adminEmails,
      subject: "New User Access Request",
      html: `
        <h2>New User Access Request</h2>
        <p>A new user has requested access to the application:</p>
        <ul>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Requested At:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>Please log in to the admin dashboard to approve or reject this request.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Go to Admin Dashboard</a></p>
      `,
    });

    if (error) {
      console.error("Error sending approval request email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending approval request email:", error);
    return false;
  }
}

export async function sendApprovalNotificationEmail({
  userEmail,
  approved,
}: {
  userEmail: string;
  approved: boolean;
}) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@berkay.se",
      to: userEmail,
      subject: approved ? "Access Approved" : "Access Denied",
      html: approved
        ? `
          <h2>Access Approved</h2>
          <p>Great news! Your access to the application has been approved.</p>
          <p>You can now log in and use the application without restrictions.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Access Application</a></p>
        `
        : `
          <h2>Access Denied</h2>
          <p>We're sorry, but your access request has been denied.</p>
          <p>If you believe this is an error, please contact the administrator.</p>
        `,
    });

    if (error) {
      console.error("Error sending approval notification email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending approval notification email:", error);
    return false;
  }
}
